-------------------------------------
Translated Report (Full Report Below)
-------------------------------------

Incident Identifier: 3080438B-D8BC-417C-8D89-05BF95D28C18
CrashReporter Key:   1f8c2278cc55e8a7d278ab238125a1ffb03a1a9f
Hardware Model:      iPhone18,2
Process:             SoloQuest [2415]
Path:                /private/var/containers/Bundle/Application/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D/SoloQuest.app/SoloQuest
Identifier:          com.kimu.soloquest
Version:             1.0.0 (5)
AppStoreTools:       17C7003g
Code Type:           ARM-64 (Native)
Role:                Foreground
Parent Process:      launchd [1]
Coalition:           com.kimu.soloquest [1693]

Date/Time:           2026-03-17 22:50:41.6409 -0700
Launch Time:         2026-03-17 22:50:41.4450 -0700
OS Version:          iPhone OS 26.3.1 (23D8133)
Release Type:        User
Baseband Version:    1.40.03
Report Version:      104

Exception Type:  EXC_BAD_ACCESS (SIGSEGV)
Exception Subtype: KERN_INVALID_ADDRESS at 0x0000800000000099
Exception Codes: 0x0000000000000001, 0x0000800000000099
VM Region Info: 0x99 is not in any region.  Bytes before following region: 4338040679
      REGION TYPE                 START - END      [ VSIZE] PRT/MAX SHRMOD  REGION DETAIL
      UNUSED SPACE AT START
--->  
      __TEXT                   102914000-102918000 [   16K] r-x/r-x SM=COW  /var/containers/Bundle/Application/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D/SoloQuest.app/SoloQuest
Termination Reason: SIGNAL 11 Segmentation fault: 11
Terminating Process: exc handler [2415]

Triggered by Thread:  10

Thread 0 name:   Dispatch queue: com.apple.main-thread
Thread 0:
0   libsystem_kernel.dylib        	       0x2315decd4 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x2315e22f8 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x2315e2214 mach_msg_overwrite + 428
3   libsystem_kernel.dylib        	       0x2315e205c mach_msg + 24
4   CoreFoundation                	       0x183a8d868 __CFRunLoopServiceMachPort + 160
5   CoreFoundation                	       0x183a64848 __CFRunLoopRun + 1188
6   CoreFoundation                	       0x183a63a6c _CFRunLoopRunSpecificWithOptions + 532
7   GraphicsServices              	       0x228401498 GSEventRunModal + 120
8   UIKitCore                     	       0x189513df8 -[UIApplication _run] + 792
9   UIKitCore                     	       0x1894bce54 UIApplicationMain + 336
10  SoloQuest                     	       0x102919620 0x102914000 + 22048
11  dyld                          	       0x180a3ee28 start + 7116

Thread 1:

Thread 2:

Thread 3 name:   Dispatch queue: com.meta.react.turbomodulemanager.queue
Thread 3:
0   dyld                          	       0x180a7ed4c dyld3::MachOLoaded::findClosestSymbol(unsigned long long, char const**, unsigned long long*) const + 304
1   dyld                          	       0x180a7ffb4 dyld4::APIs::dladdr(void const*, dl_info*) + 236
2   libsystem_c.dylib             	       0x18f392af0 backtrace_symbols + 152
3   Foundation                    	       0x181a44710 -[_NSCallStackArray objectAtIndex:] + 120
4   React                         	       0x104131590 facebook::react::TurboModuleConvertUtils::convertNSArrayToJSIArray(facebook::jsi::Runtime&, NSArray*) + 112
5   React                         	       0x104132b30 facebook::react::TurboModuleConvertUtils::convertNSExceptionToJSError(facebook::jsi::Runtime&, NSException*, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&) + 252
6   React                         	       0x1041335a4 invocation function for block in facebook::react::ObjCTurboModule::performVoidMethodInvocation(facebook::jsi::Runtime&, char const*, NSInvocation*, NSMutableArray*) + 328
7   React                         	       0x1041384a8 std::__1::__function::__func<facebook::react::ObjCTurboModule::performVoidMethodInvocation(facebook::jsi::Runtime&, char const*, NSInvocation*, NSMutableArray*)::$_1, std::__1::allocator<facebook::react::ObjCTurboModule::performVoidMethodInvocation(facebook::jsi::Runtime&, char const*, NSInvocation*, NSMutableArray*)::$_1>, void ()>::operator()() + 88
8   libdispatch.dylib             	       0x1bc770adc _dispatch_call_block_and_release + 32
9   libdispatch.dylib             	       0x1bc78a7fc _dispatch_client_callout + 16
10  libdispatch.dylib             	       0x1bc779468 _dispatch_lane_serial_drain + 740
11  libdispatch.dylib             	       0x1bc779f44 _dispatch_lane_invoke + 388
12  libdispatch.dylib             	       0x1bc7843ec _dispatch_root_queue_drain_deferred_wlh + 292
13  libdispatch.dylib             	       0x1bc783ce4 _dispatch_workloop_worker_thread + 692
14  libsystem_pthread.dylib       	       0x1e05bd3b8 _pthread_wqthread + 292
15  libsystem_pthread.dylib       	       0x1e05bc8c0 start_wqthread + 8

Thread 4:

Thread 5:

Thread 6:

Thread 7 name:  com.apple.uikit.eventfetch-thread
Thread 7:
0   libsystem_kernel.dylib        	       0x2315decd4 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x2315e22f8 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x2315e2214 mach_msg_overwrite + 428
3   libsystem_kernel.dylib        	       0x2315e205c mach_msg + 24
4   CoreFoundation                	       0x183a8d868 __CFRunLoopServiceMachPort + 160
5   CoreFoundation                	       0x183a64848 __CFRunLoopRun + 1188
6   CoreFoundation                	       0x183a63a6c _CFRunLoopRunSpecificWithOptions + 532
7   Foundation                    	       0x181a23f54 -[NSRunLoop(NSRunLoop) runMode:beforeDate:] + 212
8   Foundation                    	       0x181a2412c -[NSRunLoop(NSRunLoop) runUntilDate:] + 64
9   UIKitCore                     	       0x1894e9094 -[UIEventFetcher threadMain] + 408
10  Foundation                    	       0x1810e321c __NSThread__start__ + 732
11  libsystem_pthread.dylib       	       0x1e05c044c _pthread_start + 136
12  libsystem_pthread.dylib       	       0x1e05bc8cc thread_start + 8

Thread 8:

Thread 9:

Thread 10 name:  com.facebook.react.runtime.JavaScript
Thread 10 Crashed:
0   hermes                        	       0x104960060 hermes::vm::DictPropertyMap::findOrAdd(hermes::vm::MutableHandle<hermes::vm::DictPropertyMap>&, hermes::vm::Runtime&, hermes::vm::SymbolID) + 52
1   hermes                        	       0x104965f1c hermes::vm::HiddenClass::initializeMissingPropertyMap(hermes::vm::Handle<hermes::vm::HiddenClass>, hermes::vm::Runtime&) + 388
2   hermes                        	       0x1049660e8 hermes::vm::HiddenClass::findProperty(hermes::vm::PseudoHandle<hermes::vm::HiddenClass>, hermes::vm::Runtime&, hermes::vm::SymbolID, hermes::vm::PropertyFlags, hermes::vm::NamedPropertyDescriptor&) + 260
3   hermes                        	       0x10497e19c hermes::vm::JSObject::defineOwnPropertyInternal(hermes::vm::Handle<hermes::vm::JSObject>, hermes::vm::Runtime&, hermes::vm::SymbolID, hermes::vm::DefinePropertyFlags, hermes::vm::Handle<hermes::vm::HermesValue>, hermes::vm::PropOpFlags) + 112
4   hermes                        	       0x104985ec0 hermes::vm::JSRegExp::initialize(hermes::vm::Handle<hermes::vm::JSRegExp>, hermes::vm::Runtime&, hermes::vm::Handle<hermes::vm::StringPrimitive>, hermes::vm::Handle<hermes::vm::StringPrimitive>, llvh::ArrayRef<unsigned char>) + 100
5   hermes                        	       0x1049861a8 hermes::vm::JSRegExp::initialize(hermes::vm::Handle<hermes::vm::JSRegExp>, hermes::vm::Runtime&, hermes::vm::Handle<hermes::vm::StringPrimitive>, hermes::vm::Handle<hermes::vm::StringPrimitive>) + 300
6   hermes                        	       0x1049f3794 hermes::vm::regExpInitialize(hermes::vm::Runtime&, hermes::vm::Handle<hermes::vm::HermesValue>, hermes::vm::Handle<hermes::vm::HermesValue>, hermes::vm::Handle<hermes::vm::HermesValue>) + 328
7   hermes                        	       0x1049f3a4c hermes::vm::regExpConstructorInternal(hermes::vm::Runtime&, hermes::vm::Handle<hermes::vm::HermesValue>, hermes::vm::Handle<hermes::vm::HermesValue>, bool) + 636
8   hermes                        	       0x1049f02d8 hermes::vm::regExpConstructor(void*, hermes::vm::Runtime&, hermes::vm::NativeArgs) + 88
9   hermes                        	       0x10495e1a0 hermes::vm::NativeFunction::_nativeCall(hermes::vm::NativeFunction*, hermes::vm::Runtime&) + 140
10  hermes                        	       0x10496a928 hermes::vm::Interpreter::handleCallSlowPath(hermes::vm::Runtime&, hermes::vm::PinnedHermesValue*) + 60
11  hermes                        	       0x10496c118 hermes::vm::CallResult<hermes::vm::HermesValue, (hermes::vm::detail::CallResultSpecialize)2> hermes::vm::Interpreter::interpretFunction<false, false>(hermes::vm::Runtime&, hermes::vm::InterpreterState&) + 1992
12  hermes                        	       0x10496b928 hermes::vm::Runtime::interpretFunctionImpl(hermes::vm::CodeBlock*) + 52
13  hermes                        	       0x10495e288 hermes::vm::JSFunction::_callImpl(hermes::vm::Handle<hermes::vm::Callable>, hermes::vm::Runtime&) + 40
14  hermes                        	       0x10495cd3c hermes::vm::Callable::executeCall3(hermes::vm::Handle<hermes::vm::Callable>, hermes::vm::Runtime&, hermes::vm::Handle<hermes::vm::HermesValue>, hermes::vm::HermesValue, hermes::vm::HermesValue, hermes::vm::HermesValue, bool) + 180
15  hermes                        	       0x1049b834c hermes::vm::arrayPrototypeMap(void*, hermes::vm::Runtime&, hermes::vm::NativeArgs) + 692
16  hermes                        	       0x10495e1a0 hermes::vm::NativeFunction::_nativeCall(hermes::vm::NativeFunction*, hermes::vm::Runtime&) + 140
17  hermes                        	       0x10496a928 hermes::vm::Interpreter::handleCallSlowPath(hermes::vm::Runtime&, hermes::vm::PinnedHermesValue*) + 60
18  hermes                        	       0x10496c118 hermes::vm::CallResult<hermes::vm::HermesValue, (hermes::vm::detail::CallResultSpecialize)2> hermes::vm::Interpreter::interpretFunction<false, false>(hermes::vm::Runtime&, hermes::vm::InterpreterState&) + 1992
19  hermes                        	       0x10496b928 hermes::vm::Runtime::interpretFunctionImpl(hermes::vm::CodeBlock*) + 52
20  hermes                        	       0x10495e288 hermes::vm::JSFunction::_callImpl(hermes::vm::Handle<hermes::vm::Callable>, hermes::vm::Runtime&) + 40
21  hermes                        	       0x10495de94 hermes::vm::BoundFunction::_boundCall(hermes::vm::BoundFunction*, hermes::inst::Inst const*, hermes::vm::Runtime&) + 344
22  hermes                        	       0x104943804 facebook::hermes::(anonymous namespace)::HermesRuntimeImpl::call(facebook::jsi::Function const&, facebook::jsi::Value const&, facebook::jsi::Value const*, unsigned long) + 300
23  React                         	       0x1040908ec facebook::react::Task::execute(facebook::jsi::Runtime&, bool) + 172
24  React                         	       0x10408d8ac facebook::react::RuntimeScheduler_Modern::executeTask(facebook::jsi::Runtime&, facebook::react::Task&, bool) const + 116
25  React                         	       0x10408df94 facebook::react::RuntimeScheduler_Modern::runEventLoopTick(facebook::jsi::Runtime&, facebook::react::Task&) + 160
26  React                         	       0x10408dd14 facebook::react::RuntimeScheduler_Modern::runEventLoop(facebook::jsi::Runtime&) + 96
27  React                         	       0x1040b3094 _ZNSt3__110__function6__funcIZZN8facebook5react13ReactInstanceC1ENS_10unique_ptrINS3_9JSRuntimeENS_14default_deleteIS6_EEEENS_10shared_ptrINS3_18MessageQueueThreadEEENSA_INS3_12TimerManagerEEENS_8functionIFvRNS2_3jsi7RuntimeERKNS3_14JsErrorHandler14ProcessedErrorEEEEPNS3_18jsinspector_modern10HostTargetEENK3$_0clINSF_IFvSI_EEEEEDaT_EUlvE_NS_9allocatorISY_EEFvvEEclEv + 116
28  React                         	       0x103ecd5d8 facebook::react::tryAndReturnError(std::__1::function<void ()> const&) + 32
29  React                         	       0x103ec8560 facebook::react::RCTMessageThread::tryFunc(std::__1::function<void ()> const&) + 24
30  React                         	       0x103ec8364 invocation function for block in facebook::react::RCTMessageThread::runAsync(std::__1::function<void ()>) + 44
31  CoreFoundation                	       0x183a63320 __CFRUNLOOP_IS_CALLING_OUT_TO_A_BLOCK__ + 28
32  CoreFoundation                	       0x183a62fec __CFRunLoopDoBlocks + 396
33  CoreFoundation                	       0x183a64cd8 __CFRunLoopRun + 2356
34  CoreFoundation                	       0x183a63a6c _CFRunLoopRunSpecificWithOptions + 532
35  React                         	       0x1040c8f14 +[RCTJSThreadManager runRunLoop] + 252
36  Foundation                    	       0x1810e321c __NSThread__start__ + 732
37  libsystem_pthread.dylib       	       0x1e05c044c _pthread_start + 136
38  libsystem_pthread.dylib       	       0x1e05bc8cc thread_start + 8

Thread 11 name:  hades
Thread 11:
0   libsystem_kernel.dylib        	       0x2315e45d4 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x1e05beb58 _pthread_cond_wait + 984
2   libc++.1.dylib                	       0x192dcb704 std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&) + 32
3   hermes                        	       0x104a079c4 hermes::vm::HadesGC::Executor::worker() + 116
4   hermes                        	       0x104a0792c void* std::__1::__thread_proxy[abi:nn180100]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*) + 44
5   libsystem_pthread.dylib       	       0x1e05c044c _pthread_start + 136
6   libsystem_pthread.dylib       	       0x1e05bc8cc thread_start + 8

Thread 12 name:  AudioSession - RootQueue
Thread 12:
0   libsystem_kernel.dylib        	       0x2315dec68 semaphore_timedwait_trap + 8
1   libdispatch.dylib             	       0x1bc7a56cc _dispatch_sema4_timedwait + 64
2   libdispatch.dylib             	       0x1bc772e88 _dispatch_semaphore_wait_slow + 76
3   libdispatch.dylib             	       0x1bc782d40 _dispatch_worker_thread + 324
4   libsystem_pthread.dylib       	       0x1e05c044c _pthread_start + 136
5   libsystem_pthread.dylib       	       0x1e05bc8cc thread_start + 8


Thread 10 crashed with ARM Thread State (64-bit):
    x0: 0x000000016da5cb28   x1: 0x00000001096e0000   x2: 0x0000000010000003   x3: 0x000000010c1dba88
    x4: 0x000000010d5d1090   x5: 0x0000000000000000   x6: 0xffffffffbfc007ff   x7: 0xfffff0003ffff800
    x8: 0xfffb80000000008d   x9: 0x000000010c1dba48  x10: 0x0000000000000000  x11: 0x0000000000000002
   x12: 0x000000000000000c  x13: 0x000000010c1dba68  x14: 0x0000000000000001  x15: 0x000000010c1dba70
   x16: 0x0000000000000000  x17: 0x0000000294000400  x18: 0x0000000000000000  x19: 0x000000016da5cb60
   x20: 0x0000000010000003  x21: 0x00000001096e0000  x22: 0x000080000000008d  x23: 0x0000000000000003
   x24: 0x000000016da5cb28  x25: 0x000000010d5d10a0  x26: 0x00000001096e0000  x27: 0x0000000000000001
   x28: 0x00000001097eaf40   fp: 0x000000016da5cb10   lr: 0x0000000104965f1c
    sp: 0x000000016da5cad0   pc: 0x0000000104960060 cpsr: 0x20000000
   far: 0x0000800000000099  esr: 0x92000004 (Data Abort) byte read Translation fault

Binary Images:
       0x102914000 -        0x102e03fff SoloQuest arm64  <11ce3f5762643e8d8a8986894d83b974> /var/containers/Bundle/Application/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D/SoloQuest.app/SoloQuest
       0x103e28000 -        0x104263fff React arm64  <76fbcee9351730b39dc662c4e914e908> /private/var/containers/Bundle/Application/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D/SoloQuest.app/Frameworks/React.framework/React
       0x10345c000 -        0x1034e3fff ReactNativeDependencies arm64  <b35f1182b82e33728a74a4fe502c0906> /private/var/containers/Bundle/Application/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D/SoloQuest.app/Frameworks/ReactNativeDependencies.framework/ReactNativeDependencies
       0x104938000 -        0x104b3bfff hermes arm64  <80d5528f2c783b90b90f747e89a9f880> /private/var/containers/Bundle/Application/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D/SoloQuest.app/Frameworks/hermes.framework/hermes
       0x103010000 -        0x10301bfff libobjc-trampolines.dylib arm64e  <1954b963897d321f88be880ecef5b408> /private/preboot/Cryptexes/OS/usr/lib/libobjc-trampolines.dylib
       0x2315de000 -        0x231618d2b libsystem_kernel.dylib arm64e  <8d8301292cbe32a9b61ece493eecb399> /usr/lib/system/libsystem_kernel.dylib
       0x183a47000 -        0x183fcd73f CoreFoundation arm64e  <2f32d38446373018843e4fc875b865c4> /System/Library/Frameworks/CoreFoundation.framework/CoreFoundation
       0x228400000 -        0x2284087ff GraphicsServices arm64e  <12a401ff966436029f17f3047446e62b> /System/Library/PrivateFrameworks/GraphicsServices.framework/GraphicsServices
       0x189476000 -        0x18b8d59bf UIKitCore arm64e  <c768f963a0cc3f5ca1d32e06d53a2381> /System/Library/PrivateFrameworks/UIKitCore.framework/UIKitCore
       0x180a3a000 -        0x180ad934b dyld arm64e  <8acdb5808ab738c0a586e667adb1c11c> /usr/lib/dyld
               0x0 - 0xffffffffffffffff ??? unknown-arch  <00000000000000000000000000000000> ???
       0x18f371000 -        0x18f3f15af libsystem_c.dylib arm64e  <61a33aa9d6683b35a859b6925c4047b9> /usr/lib/system/libsystem_c.dylib
       0x181081000 -        0x181ec7c9f Foundation arm64e  <42c593bb89fb3ec48220c746811e7a43> /System/Library/Frameworks/Foundation.framework/Foundation
       0x1bc76f000 -        0x1bc7b521f libdispatch.dylib arm64e  <904d48a3d99e3962bfa9c3dfb66bba83> /usr/lib/system/libdispatch.dylib
       0x1e05bc000 -        0x1e05c845f libsystem_pthread.dylib arm64e  <4f94107b94d23e888542f5403c581b50> /usr/lib/system/libsystem_pthread.dylib
       0x192da9000 -        0x192e3be23 libc++.1.dylib arm64e  <1ba945bc7f65386a8a4cf74caab2a260> /usr/lib/libc++.1.dylib
       0x1b2868000 -        0x1b2b123ff MediaExperience arm64e  <08b6dd46697139b3b096ea519fcc83e4> /System/Library/PrivateFrameworks/MediaExperience.framework/MediaExperience

EOF

-----------
Full Report
-----------

{"app_name":"SoloQuest","timestamp":"2026-03-17 22:50:42.00 -0700","app_version":"1.0.0","slice_uuid":"11ce3f57-6264-3e8d-8a89-86894d83b974","adam_id":"6759914132","build_version":"5","bundleID":"com.kimu.soloquest","platform":2,"share_with_app_devs":0,"is_first_party":0,"bug_type":"309","os_version":"iPhone OS 26.3.1 (23D8133)","roots_installed":0,"incident_id":"3080438B-D8BC-417C-8D89-05BF95D28C18","name":"SoloQuest"}
{
  "uptime" : 120000,
  "procRole" : "Foreground",
  "version" : 2,
  "userID" : 501,
  "deployVersion" : 210,
  "modelCode" : "iPhone18,2",
  "coalitionID" : 1693,
  "osVersion" : {
    "isEmbedded" : true,
    "train" : "iPhone OS 26.3.1",
    "releaseType" : "User",
    "build" : "23D8133"
  },
  "captureTime" : "2026-03-17 22:50:41.6409 -0700",
  "codeSigningMonitor" : 2,
  "incident" : "3080438B-D8BC-417C-8D89-05BF95D28C18",
  "pid" : 2415,
  "translated" : false,
  "cpuType" : "ARM-64",
  "procLaunch" : "2026-03-17 22:50:41.4450 -0700",
  "procStartAbsTime" : 2912172031743,
  "procExitAbsTime" : 2912176706790,
  "procName" : "SoloQuest",
  "procPath" : "\/private\/var\/containers\/Bundle\/Application\/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D\/SoloQuest.app\/SoloQuest",
  "bundleInfo" : {"CFBundleShortVersionString":"1.0.0","CFBundleVersion":"5","CFBundleIdentifier":"com.kimu.soloquest","DTAppStoreToolsBuild":"17C7003g"},
  "storeInfo" : {"itemID":"6759914132","deviceIdentifierForVendor":"F233B26D-AD38-431A-ACF5-7683A56AE1C9","thirdParty":true,"softwareVersionExternalIdentifier":"882944724"},
  "parentProc" : "launchd",
  "parentPid" : 1,
  "coalitionName" : "com.kimu.soloquest",
  "crashReporterKey" : "1f8c2278cc55e8a7d278ab238125a1ffb03a1a9f",
  "appleIntelligenceStatus" : {"state":"available"},
  "bootProgressRegister" : "0x2000000c",
  "wasUnlockedSinceBoot" : 1,
  "isLocked" : 0,
  "codeSigningID" : "com.kimu.soloquest",
  "codeSigningTeamID" : "B8D3PJY53R",
  "codeSigningFlags" : 570450689,
  "codeSigningValidationCategory" : 4,
  "codeSigningTrustLevel" : 5,
  "codeSigningAuxiliaryInfo" : 0,
  "instructionByteStream" : {"beforePC":"9E8Dqf17BKn9AwGR9AMCqvUDAar4AwCq8wMIqggAQPkIAUD5Fr1Akg==","atPC":"2Q5AuVd8QJLgAxaq4QMXqnr\/\/5cfHEDyYAEAVIgBgFIpAEC5KX0IUw=="},
  "bootSessionUUID" : "9551A5DF-3957-4886-8671-C69D9E15E844",
  "basebandVersion" : "1.40.03",
  "vmRegionInfo" : "0x99 is not in any region.  Bytes before following region: 4338040679\n      REGION TYPE                 START - END      [ VSIZE] PRT\/MAX SHRMOD  REGION DETAIL\n      UNUSED SPACE AT START\n--->  \n      __TEXT                   102914000-102918000 [   16K] r-x\/r-x SM=COW  \/var\/containers\/Bundle\/Application\/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D\/SoloQuest.app\/SoloQuest",
  "exception" : {"codes":"0x0000000000000001, 0x0000800000000099","rawCodes":[1,140737488355481],"type":"EXC_BAD_ACCESS","signal":"SIGSEGV","subtype":"KERN_INVALID_ADDRESS at 0x0000800000000099"},
  "termination" : {"flags":0,"code":11,"namespace":"SIGNAL","indicator":"Segmentation fault: 11","byProc":"exc handler","byPid":2415},
  "vmregioninfo" : "0x99 is not in any region.  Bytes before following region: 4338040679\n      REGION TYPE                 START - END      [ VSIZE] PRT\/MAX SHRMOD  REGION DETAIL\n      UNUSED SPACE AT START\n--->  \n      __TEXT                   102914000-102918000 [   16K] r-x\/r-x SM=COW  \/var\/containers\/Bundle\/Application\/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D\/SoloQuest.app\/SoloQuest",
  "faultingThread" : 10,
  "threads" : [{"id":1085650,"threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":35197256990720},{"value":0},{"value":35197256990720},{"value":2},{"value":4294967295},{"value":0},{"value":0},{"value":2},{"value":0},{"value":0},{"value":8195},{"value":0},{"value":0},{"value":18446744073709551569},{"value":2},{"value":0},{"value":4294967295},{"value":2},{"value":35197256990720},{"value":0},{"value":35197256990720},{"value":6128837528},{"value":8589934592},{"value":21592279046},{"value":18446744073709550527},{"value":10742185984,"symbolLocation":0,"symbol":"_libkernel_string_functions"}],"flavor":"ARM_THREAD_STATE64","lr":{"value":9418187512},"cpsr":{"value":0},"fp":{"value":6128837376},"sp":{"value":6128837296},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":9418173652},"far":{"value":0}},"queue":"com.apple.main-thread","frames":[{"imageOffset":3284,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":5},{"imageOffset":17144,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":5},{"imageOffset":16916,"symbol":"mach_msg_overwrite","symbolLocation":428,"imageIndex":5},{"imageOffset":16476,"symbol":"mach_msg","symbolLocation":24,"imageIndex":5},{"imageOffset":288872,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":160,"imageIndex":6},{"imageOffset":120904,"symbol":"__CFRunLoopRun","symbolLocation":1188,"imageIndex":6},{"imageOffset":117356,"symbol":"_CFRunLoopRunSpecificWithOptions","symbolLocation":532,"imageIndex":6},{"imageOffset":5272,"symbol":"GSEventRunModal","symbolLocation":120,"imageIndex":7},{"imageOffset":646648,"symbol":"-[UIApplication _run]","symbolLocation":792,"imageIndex":8},{"imageOffset":290388,"symbol":"UIApplicationMain","symbolLocation":336,"imageIndex":8},{"imageOffset":22048,"imageIndex":0},{"imageOffset":20008,"symbol":"start","symbolLocation":7116,"imageIndex":9}]},{"id":1085659,"frames":[],"threadState":{"x":[{"value":6129397760},{"value":3075},{"value":6128861184},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6129397760},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":8059078840},"far":{"value":0}}},{"id":1085660,"frames":[],"threadState":{"x":[{"value":6129971200},{"value":5903},{"value":6129434624},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6129971200},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":8059078840},"far":{"value":0}}},{"id":1085661,"threadState":{"x":[{"value":1},{"value":8},{"value":6130541215},{"value":14},{"value":8},{"value":6130541343},{"value":6130541840},{"value":6130541839},{"value":4360146560},{"value":0},{"value":4367472936},{"value":4367533064},{"value":6130541456},{"value":14},{"value":4364582912},{"value":6443259836},{"value":6453215812,"symbolLocation":0,"symbol":"invocation function for block in mach_o::Header::forEachSection(void (mach_o::Header::SectionInfo const&, bool&) block_pointer) const"},{"value":7701436843910800120},{"value":0},{"value":4453851984},{"value":6130541800},{"value":4360142848},{"value":456868},{"value":7394544},{"value":4947968},{"value":4365107200},{"value":3871552},{"value":4365367816},{"value":16}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6453456168},"cpsr":{"value":1610612736},"fp":{"value":6130541696},"sp":{"value":6130541408},"esr":{"value":2449473543,"description":"(Data Abort) byte read Translation fault"},"pc":{"value":6453456204},"far":{"value":4367472940}},"queue":"com.meta.react.turbomodulemanager.queue","frames":[{"imageOffset":281932,"symbol":"dyld3::MachOLoaded::findClosestSymbol(unsigned long long, char const**, unsigned long long*) const","symbolLocation":304,"imageIndex":9},{"imageOffset":286644,"symbol":"dyld4::APIs::dladdr(void const*, dl_info*)","symbolLocation":236,"imageIndex":9},{"imageOffset":137968,"symbol":"backtrace_symbols","symbolLocation":152,"imageIndex":11},{"imageOffset":10237712,"symbol":"-[_NSCallStackArray objectAtIndex:]","symbolLocation":120,"imageIndex":12},{"imageOffset":3184016,"symbol":"facebook::react::TurboModuleConvertUtils::convertNSArrayToJSIArray(facebook::jsi::Runtime&, NSArray*)","symbolLocation":112,"imageIndex":1},{"imageOffset":3189552,"symbol":"facebook::react::TurboModuleConvertUtils::convertNSExceptionToJSError(facebook::jsi::Runtime&, NSException*, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&)","symbolLocation":252,"imageIndex":1},{"imageOffset":3192228,"symbol":"invocation function for block in facebook::react::ObjCTurboModule::performVoidMethodInvocation(facebook::jsi::Runtime&, char const*, NSInvocation*, NSMutableArray*)","symbolLocation":328,"imageIndex":1},{"imageOffset":3212456,"symbol":"std::__1::__function::__func<facebook::react::ObjCTurboModule::performVoidMethodInvocation(facebook::jsi::Runtime&, char const*, NSInvocation*, NSMutableArray*)::$_1, std::__1::allocator<facebook::react::ObjCTurboModule::performVoidMethodInvocation(facebook::jsi::Runtime&, char const*, NSInvocation*, NSMutableArray*)::$_1>, void ()>::operator()()","symbolLocation":88,"imageIndex":1},{"imageOffset":6876,"symbol":"_dispatch_call_block_and_release","symbolLocation":32,"imageIndex":13},{"imageOffset":112636,"symbol":"_dispatch_client_callout","symbolLocation":16,"imageIndex":13},{"imageOffset":42088,"symbol":"_dispatch_lane_serial_drain","symbolLocation":740,"imageIndex":13},{"imageOffset":44868,"symbol":"_dispatch_lane_invoke","symbolLocation":388,"imageIndex":13},{"imageOffset":87020,"symbol":"_dispatch_root_queue_drain_deferred_wlh","symbolLocation":292,"imageIndex":13},{"imageOffset":85220,"symbol":"_dispatch_workloop_worker_thread","symbolLocation":692,"imageIndex":13},{"imageOffset":5048,"symbol":"_pthread_wqthread","symbolLocation":292,"imageIndex":14},{"imageOffset":2240,"symbol":"start_wqthread","symbolLocation":8,"imageIndex":14}]},{"id":1085662,"frames":[],"threadState":{"x":[{"value":6131118080},{"value":9475},{"value":6130581504},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6131118080},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":8059078840},"far":{"value":0}}},{"id":1085663,"frames":[],"threadState":{"x":[{"value":6131691520},{"value":8707},{"value":6131154944},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6131691520},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":8059078840},"far":{"value":0}}},{"id":1085664,"frames":[],"threadState":{"x":[{"value":6132264960},{"value":11267},{"value":6131728384},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6132264960},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":8059078840},"far":{"value":0}}},{"id":1085665,"name":"com.apple.uikit.eventfetch-thread","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":59386512801792},{"value":2162692},{"value":59386512801792},{"value":2},{"value":4294967295},{"value":0},{"value":0},{"value":2},{"value":0},{"value":0},{"value":13827},{"value":4352038040},{"value":4451237888},{"value":18446744073709551569},{"value":18446744072367376383},{"value":0},{"value":4294967295},{"value":2},{"value":59386512801792},{"value":2162692},{"value":59386512801792},{"value":6132833672},{"value":8589934592},{"value":21592279046},{"value":18446744073709550527},{"value":10742185984,"symbolLocation":0,"symbol":"_libkernel_string_functions"}],"flavor":"ARM_THREAD_STATE64","lr":{"value":9418187512},"cpsr":{"value":0},"fp":{"value":6132833520},"sp":{"value":6132833440},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":9418173652},"far":{"value":0}},"frames":[{"imageOffset":3284,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":5},{"imageOffset":17144,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":5},{"imageOffset":16916,"symbol":"mach_msg_overwrite","symbolLocation":428,"imageIndex":5},{"imageOffset":16476,"symbol":"mach_msg","symbolLocation":24,"imageIndex":5},{"imageOffset":288872,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":160,"imageIndex":6},{"imageOffset":120904,"symbol":"__CFRunLoopRun","symbolLocation":1188,"imageIndex":6},{"imageOffset":117356,"symbol":"_CFRunLoopRunSpecificWithOptions","symbolLocation":532,"imageIndex":6},{"imageOffset":10104660,"symbol":"-[NSRunLoop(NSRunLoop) runMode:beforeDate:]","symbolLocation":212,"imageIndex":12},{"imageOffset":10105132,"symbol":"-[NSRunLoop(NSRunLoop) runUntilDate:]","symbolLocation":64,"imageIndex":12},{"imageOffset":471188,"symbol":"-[UIEventFetcher threadMain]","symbolLocation":408,"imageIndex":8},{"imageOffset":401948,"symbol":"__NSThread__start__","symbolLocation":732,"imageIndex":12},{"imageOffset":17484,"symbol":"_pthread_start","symbolLocation":136,"imageIndex":14},{"imageOffset":2252,"symbol":"thread_start","symbolLocation":8,"imageIndex":14}]},{"id":1085666,"frames":[],"threadState":{"x":[{"value":6133411840},{"value":18179},{"value":6132875264},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6133411840},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":8059078840},"far":{"value":0}}},{"id":1085668,"frames":[],"threadState":{"x":[{"value":6133985280},{"value":0},{"value":6133448704},{"value":0},{"value":278532},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6133985280},"esr":{"value":0},"pc":{"value":8059078840},"far":{"value":0}}},{"triggered":true,"id":1085670,"name":"com.facebook.react.runtime.JavaScript","threadState":{"x":[{"value":6134549288},{"value":4453171200},{"value":268435459},{"value":4498242184},{"value":4519170192},{"value":0},{"value":18446744072631617535},{"value":18446726482597246976},{"value":18445477436314353805},{"value":4498242120},{"value":0},{"value":2},{"value":12},{"value":4498242152},{"value":1},{"value":4498242160},{"value":0},{"value":11072963584},{"value":0},{"value":6134549344},{"value":268435459},{"value":4453171200},{"value":140737488355469},{"value":3},{"value":6134549288},{"value":4519170208},{"value":4453171200},{"value":1},{"value":4454264640}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4371930908},"cpsr":{"value":536870912},"fp":{"value":6134549264},"sp":{"value":6134549200},"esr":{"value":2449473540,"description":"(Data Abort) byte read Translation fault"},"pc":{"value":4371906656,"matchesCrashFrame":1},"far":{"value":140737488355481}},"frames":[{"imageOffset":163936,"symbol":"hermes::vm::DictPropertyMap::findOrAdd(hermes::vm::MutableHandle<hermes::vm::DictPropertyMap>&, hermes::vm::Runtime&, hermes::vm::SymbolID)","symbolLocation":52,"imageIndex":3},{"imageOffset":188188,"symbol":"hermes::vm::HiddenClass::initializeMissingPropertyMap(hermes::vm::Handle<hermes::vm::HiddenClass>, hermes::vm::Runtime&)","symbolLocation":388,"imageIndex":3},{"imageOffset":188648,"symbol":"hermes::vm::HiddenClass::findProperty(hermes::vm::PseudoHandle<hermes::vm::HiddenClass>, hermes::vm::Runtime&, hermes::vm::SymbolID, hermes::vm::PropertyFlags, hermes::vm::NamedPropertyDescriptor&)","symbolLocation":260,"imageIndex":3},{"imageOffset":287132,"symbol":"hermes::vm::JSObject::defineOwnPropertyInternal(hermes::vm::Handle<hermes::vm::JSObject>, hermes::vm::Runtime&, hermes::vm::SymbolID, hermes::vm::DefinePropertyFlags, hermes::vm::Handle<hermes::vm::HermesValue>, hermes::vm::PropOpFlags)","symbolLocation":112,"imageIndex":3},{"imageOffset":319168,"symbol":"hermes::vm::JSRegExp::initialize(hermes::vm::Handle<hermes::vm::JSRegExp>, hermes::vm::Runtime&, hermes::vm::Handle<hermes::vm::StringPrimitive>, hermes::vm::Handle<hermes::vm::StringPrimitive>, llvh::ArrayRef<unsigned char>)","symbolLocation":100,"imageIndex":3},{"imageOffset":319912,"symbol":"hermes::vm::JSRegExp::initialize(hermes::vm::Handle<hermes::vm::JSRegExp>, hermes::vm::Runtime&, hermes::vm::Handle<hermes::vm::StringPrimitive>, hermes::vm::Handle<hermes::vm::StringPrimitive>)","symbolLocation":300,"imageIndex":3},{"imageOffset":767892,"symbol":"hermes::vm::regExpInitialize(hermes::vm::Runtime&, hermes::vm::Handle<hermes::vm::HermesValue>, hermes::vm::Handle<hermes::vm::HermesValue>, hermes::vm::Handle<hermes::vm::HermesValue>)","symbolLocation":328,"imageIndex":3},{"imageOffset":768588,"symbol":"hermes::vm::regExpConstructorInternal(hermes::vm::Runtime&, hermes::vm::Handle<hermes::vm::HermesValue>, hermes::vm::Handle<hermes::vm::HermesValue>, bool)","symbolLocation":636,"imageIndex":3},{"imageOffset":754392,"symbol":"hermes::vm::regExpConstructor(void*, hermes::vm::Runtime&, hermes::vm::NativeArgs)","symbolLocation":88,"imageIndex":3},{"imageOffset":156064,"symbol":"hermes::vm::NativeFunction::_nativeCall(hermes::vm::NativeFunction*, hermes::vm::Runtime&)","symbolLocation":140,"imageIndex":3},{"imageOffset":207144,"symbol":"hermes::vm::Interpreter::handleCallSlowPath(hermes::vm::Runtime&, hermes::vm::PinnedHermesValue*)","symbolLocation":60,"imageIndex":3},{"imageOffset":213272,"symbol":"hermes::vm::CallResult<hermes::vm::HermesValue, (hermes::vm::detail::CallResultSpecialize)2> hermes::vm::Interpreter::interpretFunction<false, false>(hermes::vm::Runtime&, hermes::vm::InterpreterState&)","symbolLocation":1992,"imageIndex":3},{"imageOffset":211240,"symbol":"hermes::vm::Runtime::interpretFunctionImpl(hermes::vm::CodeBlock*)","symbolLocation":52,"imageIndex":3},{"imageOffset":156296,"symbol":"hermes::vm::JSFunction::_callImpl(hermes::vm::Handle<hermes::vm::Callable>, hermes::vm::Runtime&)","symbolLocation":40,"imageIndex":3},{"imageOffset":150844,"symbol":"hermes::vm::Callable::executeCall3(hermes::vm::Handle<hermes::vm::Callable>, hermes::vm::Runtime&, hermes::vm::Handle<hermes::vm::HermesValue>, hermes::vm::HermesValue, hermes::vm::HermesValue, hermes::vm::HermesValue, bool)","symbolLocation":180,"imageIndex":3},{"imageOffset":525132,"symbol":"hermes::vm::arrayPrototypeMap(void*, hermes::vm::Runtime&, hermes::vm::NativeArgs)","symbolLocation":692,"imageIndex":3},{"imageOffset":156064,"symbol":"hermes::vm::NativeFunction::_nativeCall(hermes::vm::NativeFunction*, hermes::vm::Runtime&)","symbolLocation":140,"imageIndex":3},{"imageOffset":207144,"symbol":"hermes::vm::Interpreter::handleCallSlowPath(hermes::vm::Runtime&, hermes::vm::PinnedHermesValue*)","symbolLocation":60,"imageIndex":3},{"imageOffset":213272,"symbol":"hermes::vm::CallResult<hermes::vm::HermesValue, (hermes::vm::detail::CallResultSpecialize)2> hermes::vm::Interpreter::interpretFunction<false, false>(hermes::vm::Runtime&, hermes::vm::InterpreterState&)","symbolLocation":1992,"imageIndex":3},{"imageOffset":211240,"symbol":"hermes::vm::Runtime::interpretFunctionImpl(hermes::vm::CodeBlock*)","symbolLocation":52,"imageIndex":3},{"imageOffset":156296,"symbol":"hermes::vm::JSFunction::_callImpl(hermes::vm::Handle<hermes::vm::Callable>, hermes::vm::Runtime&)","symbolLocation":40,"imageIndex":3},{"imageOffset":155284,"symbol":"hermes::vm::BoundFunction::_boundCall(hermes::vm::BoundFunction*, hermes::inst::Inst const*, hermes::vm::Runtime&)","symbolLocation":344,"imageIndex":3},{"imageOffset":47108,"symbol":"facebook::hermes::(anonymous namespace)::HermesRuntimeImpl::call(facebook::jsi::Function const&, facebook::jsi::Value const&, facebook::jsi::Value const*, unsigned long)","symbolLocation":300,"imageIndex":3},{"imageOffset":2525420,"symbol":"facebook::react::Task::execute(facebook::jsi::Runtime&, bool)","symbolLocation":172,"imageIndex":1},{"imageOffset":2513068,"symbol":"facebook::react::RuntimeScheduler_Modern::executeTask(facebook::jsi::Runtime&, facebook::react::Task&, bool) const","symbolLocation":116,"imageIndex":1},{"imageOffset":2514836,"symbol":"facebook::react::RuntimeScheduler_Modern::runEventLoopTick(facebook::jsi::Runtime&, facebook::react::Task&)","symbolLocation":160,"imageIndex":1},{"imageOffset":2514196,"symbol":"facebook::react::RuntimeScheduler_Modern::runEventLoop(facebook::jsi::Runtime&)","symbolLocation":96,"imageIndex":1},{"imageOffset":2666644,"symbol":"_ZNSt3__110__function6__funcIZZN8facebook5react13ReactInstanceC1ENS_10unique_ptrINS3_9JSRuntimeENS_14default_deleteIS6_EEEENS_10shared_ptrINS3_18MessageQueueThreadEEENSA_INS3_12TimerManagerEEENS_8functionIFvRNS2_3jsi7RuntimeERKNS3_14JsErrorHandler14ProcessedErrorEEEEPNS3_18jsinspector_modern10HostTargetEENK3$_0clINSF_IFvSI_EEEEEDaT_EUlvE_NS_9allocatorISY_EEFvvEEclEv","symbolLocation":116,"imageIndex":1},{"imageOffset":677336,"symbol":"facebook::react::tryAndReturnError(std::__1::function<void ()> const&)","symbolLocation":32,"imageIndex":1},{"imageOffset":656736,"symbol":"facebook::react::RCTMessageThread::tryFunc(std::__1::function<void ()> const&)","symbolLocation":24,"imageIndex":1},{"imageOffset":656228,"symbol":"invocation function for block in facebook::react::RCTMessageThread::runAsync(std::__1::function<void ()>)","symbolLocation":44,"imageIndex":1},{"imageOffset":115488,"symbol":"__CFRUNLOOP_IS_CALLING_OUT_TO_A_BLOCK__","symbolLocation":28,"imageIndex":6},{"imageOffset":114668,"symbol":"__CFRunLoopDoBlocks","symbolLocation":396,"imageIndex":6},{"imageOffset":122072,"symbol":"__CFRunLoopRun","symbolLocation":2356,"imageIndex":6},{"imageOffset":117356,"symbol":"_CFRunLoopRunSpecificWithOptions","symbolLocation":532,"imageIndex":6},{"imageOffset":2756372,"symbol":"+[RCTJSThreadManager runRunLoop]","symbolLocation":252,"imageIndex":1},{"imageOffset":401948,"symbol":"__NSThread__start__","symbolLocation":732,"imageIndex":12},{"imageOffset":17484,"symbol":"_pthread_start","symbolLocation":136,"imageIndex":14},{"imageOffset":2252,"symbol":"thread_start","symbolLocation":8,"imageIndex":14}]},{"id":1085671,"name":"hades","threadState":{"x":[{"value":260},{"value":0},{"value":0},{"value":0},{"value":0},{"value":160},{"value":0},{"value":0},{"value":6135131816},{"value":0},{"value":0},{"value":2},{"value":2},{"value":0},{"value":0},{"value":0},{"value":305},{"value":8298818368},{"value":0},{"value":4451031424},{"value":4451031488},{"value":6135132384},{"value":0},{"value":0},{"value":0},{"value":1},{"value":256},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":8059087704},"cpsr":{"value":1610612736},"fp":{"value":6135131936},"sp":{"value":6135131792},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":9418196436},"far":{"value":0}},"frames":[{"imageOffset":26068,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":5},{"imageOffset":11096,"symbol":"_pthread_cond_wait","symbolLocation":984,"imageIndex":14},{"imageOffset":141060,"symbol":"std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&)","symbolLocation":32,"imageIndex":15},{"imageOffset":850372,"symbol":"hermes::vm::HadesGC::Executor::worker()","symbolLocation":116,"imageIndex":3},{"imageOffset":850220,"symbol":"void* std::__1::__thread_proxy[abi:nn180100]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*)","symbolLocation":44,"imageIndex":3},{"imageOffset":17484,"symbol":"_pthread_start","symbolLocation":136,"imageIndex":14},{"imageOffset":2252,"symbol":"thread_start","symbolLocation":8,"imageIndex":14}]},{"id":1085675,"name":"AudioSession - RootQueue","threadState":{"x":[{"value":14},{"value":5},{"value":0},{"value":68719460488},{"value":4454307392},{"value":7292310295},{"value":0},{"value":0},{"value":0},{"value":3},{"value":13835058055282163714},{"value":80000000},{"value":1090846535725406},{"value":1073252202195299},{"value":274432},{"value":18},{"value":18446744073709551578},{"value":1023533411},{"value":0},{"value":2912295543387},{"value":4453628224},{"value":1000000000},{"value":4453628088},{"value":6135705824},{"value":0},{"value":0},{"value":18446744071411073023},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":7457101516},"cpsr":{"value":2147483648},"fp":{"value":6135705408},"sp":{"value":6135705376},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":9418173544},"far":{"value":0}},"frames":[{"imageOffset":3176,"symbol":"semaphore_timedwait_trap","symbolLocation":8,"imageIndex":5},{"imageOffset":222924,"symbol":"_dispatch_sema4_timedwait","symbolLocation":64,"imageIndex":13},{"imageOffset":16008,"symbol":"_dispatch_semaphore_wait_slow","symbolLocation":76,"imageIndex":13},{"imageOffset":81216,"symbol":"_dispatch_worker_thread","symbolLocation":324,"imageIndex":13},{"imageOffset":17484,"symbol":"_pthread_start","symbolLocation":136,"imageIndex":14},{"imageOffset":2252,"symbol":"thread_start","symbolLocation":8,"imageIndex":14}]}],
  "usedImages" : [
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4338040832,
    "size" : 5177344,
    "uuid" : "11ce3f57-6264-3e8d-8a89-86894d83b974",
    "path" : "\/var\/containers\/Bundle\/Application\/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D\/SoloQuest.app\/SoloQuest",
    "name" : "SoloQuest"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4360142848,
    "size" : 4440064,
    "uuid" : "76fbcee9-3517-30b3-9dc6-62c4e914e908",
    "path" : "\/private\/var\/containers\/Bundle\/Application\/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D\/SoloQuest.app\/Frameworks\/React.framework\/React",
    "name" : "React"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4349870080,
    "size" : 557056,
    "uuid" : "b35f1182-b82e-3372-8a74-a4fe502c0906",
    "path" : "\/private\/var\/containers\/Bundle\/Application\/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D\/SoloQuest.app\/Frameworks\/ReactNativeDependencies.framework\/ReactNativeDependencies",
    "name" : "ReactNativeDependencies"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4371742720,
    "size" : 2113536,
    "uuid" : "80d5528f-2c78-3b90-b90f-747e89a9f880",
    "path" : "\/private\/var\/containers\/Bundle\/Application\/9F4D42D9-D414-4DAA-A7DA-5F733BB3719D\/SoloQuest.app\/Frameworks\/hermes.framework\/hermes",
    "name" : "hermes"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 4345364480,
    "size" : 49152,
    "uuid" : "1954b963-897d-321f-88be-880ecef5b408",
    "path" : "\/private\/preboot\/Cryptexes\/OS\/usr\/lib\/libobjc-trampolines.dylib",
    "name" : "libobjc-trampolines.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 9418170368,
    "size" : 240940,
    "uuid" : "8d830129-2cbe-32a9-b61e-ce493eecb399",
    "path" : "\/usr\/lib\/system\/libsystem_kernel.dylib",
    "name" : "libsystem_kernel.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6503559168,
    "size" : 5793600,
    "uuid" : "2f32d384-4637-3018-843e-4fc875b865c4",
    "path" : "\/System\/Library\/Frameworks\/CoreFoundation.framework\/CoreFoundation",
    "name" : "CoreFoundation"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 9265217536,
    "size" : 34816,
    "uuid" : "12a401ff-9664-3602-9f17-f3047446e62b",
    "path" : "\/System\/Library\/PrivateFrameworks\/GraphicsServices.framework\/GraphicsServices",
    "name" : "GraphicsServices"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6598123520,
    "size" : 38140352,
    "uuid" : "c768f963-a0cc-3f5c-a1d3-2e06d53a2381",
    "path" : "\/System\/Library\/PrivateFrameworks\/UIKitCore.framework\/UIKitCore",
    "name" : "UIKitCore"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6453174272,
    "size" : 652108,
    "uuid" : "8acdb580-8ab7-38c0-a586-e667adb1c11c",
    "path" : "\/usr\/lib\/dyld",
    "name" : "dyld"
  },
  {
    "size" : 0,
    "source" : "A",
    "base" : 0,
    "uuid" : "00000000-0000-0000-0000-000000000000"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6697717760,
    "size" : 525744,
    "uuid" : "61a33aa9-d668-3b35-a859-b6925c4047b9",
    "path" : "\/usr\/lib\/system\/libsystem_c.dylib",
    "name" : "libsystem_c.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6459756544,
    "size" : 14970016,
    "uuid" : "42c593bb-89fb-3ec4-8220-c746811e7a43",
    "path" : "\/System\/Library\/Frameworks\/Foundation.framework\/Foundation",
    "name" : "Foundation"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 7456878592,
    "size" : 287264,
    "uuid" : "904d48a3-d99e-3962-bfa9-c3dfb66bba83",
    "path" : "\/usr\/lib\/system\/libdispatch.dylib",
    "name" : "libdispatch.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 8059076608,
    "size" : 50272,
    "uuid" : "4f94107b-94d2-3e88-8542-f5403c581b50",
    "path" : "\/usr\/lib\/system\/libsystem_pthread.dylib",
    "name" : "libsystem_pthread.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6758764544,
    "size" : 601636,
    "uuid" : "1ba945bc-7f65-386a-8a4c-f74caab2a260",
    "path" : "\/usr\/lib\/libc++.1.dylib",
    "name" : "libc++.1.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 7290126336,
    "size" : 2794496,
    "uuid" : "08b6dd46-6971-39b3-b096-ea519fcc83e4",
    "path" : "\/System\/Library\/PrivateFrameworks\/MediaExperience.framework\/MediaExperience",
    "name" : "MediaExperience"
  }
],
  "sharedCache" : {
  "base" : 6452035584,
  "size" : 5209702400,
  "uuid" : "2e59e585-7e9d-3ae5-9e08-fc063e17b0f2"
},
  "vmSummary" : "ReadOnly portion of Libraries: Total=1.7G resident=0K(0%) swapped_out_or_unallocated=1.7G(100%)\nWritable regions: Total=104.5M written=417K(0%) resident=417K(0%) swapped_out=0K(0%) unallocated=104.0M(100%)\n\n                                VIRTUAL   REGION \nREGION TYPE                        SIZE    COUNT (non-coalesced) \n===========                     =======  ======= \n.note.gnu.proper                    320        1 \nActivity Tracing                   256K        1 \nAudio                               64K        1 \nCoreAnimation                       48K        3 \nFoundation                          16K        1 \nKernel Alloc Once                   32K        1 \nMALLOC                            86.9M       14 \nMALLOC guard page                 3136K        4 \nSTACK GUARD                        208K       13 \nStack                             7536K       13 \nVM_ALLOCATE                       9360K        8 \n__AUTH                            7841K      694 \n__AUTH_CONST                     101.1M     1079 \n__CTF                               824        1 \n__DATA                            46.5M     1029 \n__DATA_CONST                      33.9M     1087 \n__DATA_DIRTY                      9611K      950 \n__FONT_DATA                        2352        1 \n__INFO_FILTER                         8        1 \n__LINKEDIT                       186.5M        6 \n__OBJC_RO                         84.3M        1 \n__OBJC_RW                         3179K        1 \n__TEXT                             1.5G     1105 \n__TPRO_CONST                       128K        2 \nmapped file                       40.0M        6 \npage table in kernel               417K        1 \nshared memory                       80K        4 \n===========                     =======  ======= \nTOTAL                              2.1G     6028 \n",
  "legacyInfo" : {
  "threadTriggered" : {
    "name" : "com.facebook.react.runtime.JavaScript"
  }
},
  "logWritingSignature" : "2e0a668d02b1e139943c679a2e463c0d60f58863",
  "roots_installed" : 0,
  "bug_type" : "309",
  "trmStatus" : 1,
  "trialInfo" : {
  "rollouts" : [
    {
      "rolloutId" : "6761d0c9df60af01adb250fb",
      "factorPackIds" : [

      ],
      "deploymentId" : 240000009
    },
    {
      "rolloutId" : "6090733d1c1e594b6765e603",
      "factorPackIds" : [
        "61969b2ab1c7c7620ce6e28e"
      ],
      "deploymentId" : 240000007
    }
  ],
  "experiments" : [

  ]
}
}

