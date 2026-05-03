#import <Foundation/Foundation.h>
#import <Speech/Speech.h>
#import <AVFoundation/AVFoundation.h>

@interface SpeechRecognizer : NSObject <SFSpeechRecognizerDelegate>
@property (nonatomic, strong) SFSpeechRecognizer *speechRecognizer;
@property (nonatomic, strong) SFSpeechAudioBufferRecognitionRequest *recognitionRequest;
@property (nonatomic, strong) SFSpeechRecognitionTask *recognitionTask;
@property (nonatomic, strong) AVAudioEngine *audioEngine;
@property (nonatomic, copy) void (^completionHandler)(NSString *result, NSError *error);
@end

@implementation SpeechRecognizer

+ (instancetype)sharedInstance {
    static SpeechRecognizer *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[SpeechRecognizer alloc] init];
    });
    return instance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        self.speechRecognizer = [[SFSpeechRecognizer alloc] initWithLocale:[NSLocale localeWithLocaleIdentifier:@"zh-CN"]];
        self.speechRecognizer.delegate = self;
        self.audioEngine = [[AVAudioEngine alloc] init];
    }
    return self;
}

- (void)requestAuthorization:(void (^)(BOOL authorized))completion {
    [SFSpeechRecognizer requestAuthorization:^(SFSpeechRecognizerAuthorizationStatus status) {
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(status == SFSpeechRecognizerAuthorizationStatusAuthorized);
        });
    }];
}

- (void)startRecordingWithCompletion:(void (^)(NSString *result, NSError *error))completion {
    self.completionHandler = completion;

    // 停止之前的任务
    if (self.recognitionTask) {
        [self.recognitionTask cancel];
        self.recognitionTask = nil;
    }

    // 配置音频会话
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    NSError *error = nil;
    [audioSession setCategory:AVAudioSessionCategoryRecord mode:AVAudioSessionModeMeasurement options:AVAudioSessionOptionDuckOthers error:&error];
    if (error) {
        completion(nil, error);
        return;
    }
    [audioSession setActive:YES withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation error:&error];
    if (error) {
        completion(nil, error);
        return;
    }

    // 创建识别请求
    self.recognitionRequest = [[SFSpeechAudioBufferRecognitionRequest alloc] init];
    self.recognitionRequest.shouldReportPartialResults = YES;

    // 开始识别任务
    __weak typeof(self) weakSelf = self;
    self.recognitionTask = [self.speechRecognizer recognitionTaskWithRequest:self.recognitionRequest resultHandler:^(SFSpeechRecognitionResult *result, NSError *error) {
        if (error) {
            if (weakSelf.completionHandler) {
                weakSelf.completionHandler(nil, error);
            }
            [weakSelf stopRecording];
            return;
        }

        if (result) {
            NSString *transcript = result.bestTranscription.formattedString;
            if (weakSelf.completionHandler) {
                weakSelf.completionHandler(transcript, nil);
            }

            if (result.isFinal) {
                [weakSelf stopRecording];
            }
        }
    }];

    // 配置音频输入
    AVAudioInputNode *inputNode = self.audioEngine.inputNode;
    AVAudioFormat *recordingFormat = [inputNode outputFormatForBus:0];

    [inputNode installTapOnBus:0 bufferSize:1024 format:recordingFormat block:^(AVAudioPCMBuffer *buffer, AVAudioTime *when) {
        [weakSelf.recognitionRequest appendAudioPCMBuffer:buffer];
    }];

    [self.audioEngine prepare];
    [self.audioEngine startAndReturnError:&error];
    if (error) {
        completion(nil, error);
        return;
    }
}

- (void)stopRecording {
    [self.audioEngine stop];
    [self.audioEngine.inputNode removeTapOnBus:0];

    [self.recognitionRequest endAudio];
    self.recognitionRequest = nil;

    [self.recognitionTask cancel];
    self.recognitionTask = nil;

    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    [audioSession setActive:NO error:nil];
}

- (void)speechRecognizer:(SFSpeechRecognizer *)speechRecognizer availabilityDidChange:(BOOL)available {
    NSLog(@"Speech recognizer availability changed: %d", available);
}

@end

// C 接口供 Node.js 调用
extern "C" {
    void requestAuthorization(void (*callback)(bool authorized)) {
        [[SpeechRecognizer sharedInstance] requestAuthorization:^(BOOL authorized) {
            callback(authorized);
        }];
    }

    void startRecording(void (*callback)(const char *result, const char *error)) {
        [[SpeechRecognizer sharedInstance] startRecordingWithCompletion:^(NSString *result, NSError *error) {
            if (error) {
                callback(NULL, [error.localizedDescription UTF8String]);
            } else {
                callback([result UTF8String], NULL);
            }
        }];
    }

    void stopRecording() {
        [[SpeechRecognizer sharedInstance] stopRecording];
    }
}
