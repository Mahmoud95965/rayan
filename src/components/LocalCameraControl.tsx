import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Smartphone, 
  Monitor, 
  Play, 
  Pause, 
  Square, 
  RotateCw, 
  Download,
  Maximize,
  Volume2,
  VolumeX,
  Wifi,
  Settings,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

interface LocalCamera {
  id: string;
  name: string;
  type: 'webcam' | 'mobile' | 'ip';
  deviceId?: string;
  url?: string;
  isActive: boolean;
  quality: 'low' | 'medium' | 'high';
}

const LocalCameraControl: React.FC = () => {
  const [cameras, setCameras] = useState<LocalCamera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<LocalCamera | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoQuality, setVideoQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeCameras();
    generateQRCode();
    startDeviceDiscovery();
    
    return () => {
      stopAllStreams();
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const initializeCameras = async () => {
    try {
      // الحصول على أجهزة الكاميرا المتاحة
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      const webcams: LocalCamera[] = videoDevices.map((device, index) => ({
        id: device.deviceId || `webcam_${index}`,
        name: device.label || `كاميرا الويب ${index + 1}`,
        type: 'webcam',
        deviceId: device.deviceId,
        isActive: false,
        quality: 'medium'
      }));

      // إضافة كاميرات الهاتف المحمول (سيتم اكتشافها عبر الشبكة)
      const mobileCameras: LocalCamera[] = [
        {
          id: 'mobile_front',
          name: 'كاميرا الهاتف الأمامية',
          type: 'mobile',
          url: 'http://192.168.1.100:8080/video',
          isActive: false,
          quality: 'high'
        },
        {
          id: 'mobile_back',
          name: 'كاميرا الهاتف الخلفية',
          type: 'mobile',
          url: 'http://192.168.1.101:8080/video',
          isActive: false,
          quality: 'high'
        }
      ];

      const allCameras = [...webcams, ...mobileCameras];
      setCameras(allCameras);
      
      if (allCameras.length > 0) {
        setSelectedCamera(allCameras[0]);
      }
    } catch (error) {
      console.error('خطأ في تهيئة الكاميرات:', error);
    }
  };

  const generateQRCode = () => {
    // إنشاء رابط QR Code للهاتف المحمول
    const localIP = window.location.hostname;
    const port = window.location.port || '5173';
    const mobileUrl = `http://${localIP}:${port}/mobile-camera`;
    
    // استخدام خدمة QR Code مجانية
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileUrl)}`;
    setQrCodeUrl(qrUrl);
  };

  const startDeviceDiscovery = () => {
    // البحث عن الأجهزة المتصلة في الشبكة المحلية
    const checkDevices = async () => {
      const devices: string[] = [];
      
      // فحص نطاق IP المحلي
      const baseIP = '192.168.1.';
      const promises = [];
      
      for (let i = 100; i <= 110; i++) {
        const ip = baseIP + i;
        promises.push(
          fetch(`http://${ip}:8080/ping`, { 
            method: 'GET',
            mode: 'no-cors',
            signal: AbortSignal.timeout(2000)
          })
          .then(() => devices.push(ip))
          .catch(() => {}) // تجاهل الأخطاء
        );
      }
      
      await Promise.allSettled(promises);
      setConnectedDevices(devices);
    };

    checkDevices();
    
    // فحص دوري كل 30 ثانية
    const interval = setInterval(checkDevices, 30000);
    return () => clearInterval(interval);
  };

  const startWebcamStream = async (camera: LocalCamera) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: camera.deviceId ? { exact: camera.deviceId } : undefined,
          width: getVideoConstraints().width,
          height: getVideoConstraints().height,
          frameRate: getVideoConstraints().frameRate
        },
        audio: audioEnabled
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsStreaming(true);
      updateCameraStatus(camera.id, true);
      
    } catch (error) {
      console.error('خطأ في بدء تشغيل الكاميرا:', error);
      alert('لا يمكن الوصول إلى الكاميرا. تأكد من الأذونات.');
    }
  };

  const startMobileStream = async (camera: LocalCamera) => {
    try {
      if (!camera.url) return;
      
      // التحقق من توفر الكاميرا المحمولة
      const response = await fetch(camera.url, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      if (videoRef.current) {
        videoRef.current.src = camera.url;
        videoRef.current.play();
      }
      
      setIsStreaming(true);
      updateCameraStatus(camera.id, true);
      
    } catch (error) {
      console.error('خطأ في الاتصال بكاميرا الهاتف:', error);
      alert('لا يمكن الاتصال بكاميرا الهاتف. تأكد من تشغيل التطبيق على الهاتف.');
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
    
    setIsStreaming(false);
    if (selectedCamera) {
      updateCameraStatus(selectedCamera.id, false);
    }
  };

  const startRecording = async () => {
    if (!streamRef.current && selectedCamera?.type === 'webcam') {
      await startWebcamStream(selectedCamera);
    }
    
    if (!streamRef.current) return;

    try {
      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: getVideoBitrate()
      };
      
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      const chunks: Blob[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording_${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('خطأ في بدء التسجيل:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snapshot_${new Date().toISOString()}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/jpeg', 0.9);
  };

  const getVideoConstraints = () => {
    switch (videoQuality) {
      case 'low':
        return { width: 640, height: 480, frameRate: 15 };
      case 'medium':
        return { width: 1280, height: 720, frameRate: 30 };
      case 'high':
        return { width: 1920, height: 1080, frameRate: 30 };
      default:
        return { width: 1280, height: 720, frameRate: 30 };
    }
  };

  const getVideoBitrate = () => {
    switch (videoQuality) {
      case 'low': return 500000;
      case 'medium': return 1500000;
      case 'high': return 3000000;
      default: return 1500000;
    }
  };

  const updateCameraStatus = (cameraId: string, isActive: boolean) => {
    setCameras(prev => prev.map(cam => 
      cam.id === cameraId ? { ...cam, isActive } : cam
    ));
  };

  const stopAllStreams = () => {
    stopStream();
    stopRecording();
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCameraIcon = (type: string) => {
    switch (type) {
      case 'webcam': return <Monitor className="h-5 w-5" />;
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      default: return <Camera className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Camera className="h-6 w-6 ml-2 text-blue-600" />
          كاميرات الجهاز والهاتف المحمول
        </h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <select
            value={videoQuality}
            onChange={(e) => setVideoQuality(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">جودة منخفضة (480p)</option>
            <option value="medium">جودة متوسطة (720p)</option>
            <option value="high">جودة عالية (1080p)</option>
          </select>
          <button
            onClick={initializeCameras}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Camera Selection */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">اختيار الكاميرا</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cameras.map((camera) => (
            <button
              key={camera.id}
              onClick={() => setSelectedCamera(camera)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedCamera?.id === camera.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ml-3 ${
                  camera.isActive ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {getCameraIcon(camera.type)}
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{camera.name}</div>
                  <div className="text-sm text-gray-600">
                    {camera.type === 'webcam' ? 'كاميرا الجهاز' : 'كاميرا الهاتف'}
                  </div>
                  <div className={`text-xs ${
                    camera.isActive ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {camera.isActive ? 'نشطة' : 'غير نشطة'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Stream */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg overflow-hidden relative">
            <video
              ref={videoRef}
              className="w-full h-96 object-cover"
              controls={false}
              muted={!audioEnabled}
              playsInline
            />
            
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Stream Overlay */}
            {!isStreaming && selectedCamera && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <button
                  onClick={() => {
                    if (selectedCamera.type === 'webcam') {
                      startWebcamStream(selectedCamera);
                    } else {
                      startMobileStream(selectedCamera);
                    }
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Play className="h-5 w-5 ml-2" />
                  بدء البث المباشر
                </button>
              </div>
            )}
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-2"></div>
                REC {formatRecordingTime(recordingTime)}
              </div>
            )}
            
            {/* Camera Info */}
            {selectedCamera && isStreaming && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {selectedCamera.name}
              </div>
            )}
            
            {/* Control Overlay */}
            {isStreaming && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-2 rounded-full ${
                      isRecording 
                        ? 'bg-red-600 text-white' 
                        : 'bg-white text-gray-700'
                    } hover:opacity-80`}
                  >
                    {isRecording ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  
                  <button
                    onClick={takeSnapshot}
                    className="p-2 bg-white text-gray-700 rounded-full hover:opacity-80"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="p-2 bg-white text-gray-700 rounded-full hover:opacity-80"
                  >
                    {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                </div>
                
                <button
                  onClick={stopStream}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <Pause className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Camera Info */}
          {selectedCamera && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">معلومات الكاميرا</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">الاسم</span>
                  <span className="font-medium">{selectedCamera.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">النوع</span>
                  <span className="font-medium">
                    {selectedCamera.type === 'webcam' ? 'كاميرا الجهاز' : 'كاميرا الهاتف'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الجودة</span>
                  <span className="font-medium">{videoQuality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة</span>
                  <span className={`font-medium ${
                    selectedCamera.isActive ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {selectedCamera.isActive ? 'نشطة' : 'غير نشطة'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Connection */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">ربط الهاتف المحمول</h3>
            
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">امسح الكود بالهاتف:</p>
              {qrCodeUrl && (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="mx-auto border rounded-lg"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-gray-500">الأجهزة المتصلة:</p>
              {connectedDevices.length > 0 ? (
                connectedDevices.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex items-center">
                      <Wifi className="h-4 w-4 text-green-600 ml-2" />
                      <span className="text-sm text-green-800">{device}</span>
                    </div>
                    <Eye className="h-4 w-4 text-green-600" />
                  </div>
                ))
              ) : (
                <div className="flex items-center p-2 bg-gray-50 rounded">
                  <EyeOff className="h-4 w-4 text-gray-500 ml-2" />
                  <span className="text-sm text-gray-600">لا توجد أجهزة متصلة</span>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-2">تعليمات الاستخدام</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• للكاميرا المحلية: اختر الكاميرا واضغط "بدء البث"</p>
              <p>• للهاتف المحمول: امسح الكود وشغل التطبيق</p>
              <p>• يمكنك التسجيل والتقاط الصور مباشرة</p>
              <p>• تأكد من وجود الأجهزة على نفس الشبكة</p>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">الإعدادات</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">الصوت</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audioEnabled}
                    onChange={(e) => setAudioEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalCameraControl;
