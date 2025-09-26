import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Smartphone, 
  Monitor, 
  Play, 
  Pause, 
  Square, 
  Volume2,
  VolumeX,
  Wifi,
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
  const [mobileAppUrl, setMobileAppUrl] = useState<string>('');
  
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const initializeCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      const cameraList: LocalCamera[] = videoDevices.map((device, index) => ({
        id: device.deviceId || `camera-${index}`,
        name: device.label || `كاميرا ${index + 1}`,
        type: 'webcam' as const,
        deviceId: device.deviceId,
        isActive: false,
        quality: 'medium' as const
      }));

      // إضافة كاميرا الهاتف المحمول
      cameraList.push({
        id: 'mobile-camera',
        name: 'كاميرا الهاتف المحمول',
        type: 'mobile',
        isActive: false,
        quality: 'medium'
      });

      setCameras(cameraList);
      if (cameraList.length > 0) {
        setSelectedCamera(cameraList[0]);
      }
    } catch (error) {
      console.error('خطأ في تهيئة الكاميرات:', error);
    }
  };

  const generateQRCode = async () => {
    let localIP = window.location.hostname;
    
    if (localIP === 'localhost' || localIP === '127.0.0.1') {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        pc.createDataChannel('');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        await new Promise((resolve) => {
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              const candidate = event.candidate.candidate;
              const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
              if (match && !match[1].startsWith('127.')) {
                localIP = match[1];
                pc.close();
                resolve(match[1]);
              }
            }
          };
          
          setTimeout(() => {
            pc.close();
            resolve('192.168.1.100');
          }, 3000);
        });
      } catch (error) {
        console.warn('لا يمكن اكتشاف IP المحلي:', error);
        localIP = '192.168.1.100';
      }
    }
    
    const port = window.location.port || '5173';
    const protocol = window.location.protocol;
    const mobileUrl = `${protocol}//${localIP}:${port}/mobile-camera-new.html`;
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&margin=15&ecc=M&color=2563eb&bgcolor=ffffff&data=${encodeURIComponent(mobileUrl)}`;
    setQrCodeUrl(qrUrl);
    setMobileAppUrl(mobileUrl);
    
    console.log('🔗 رابط تطبيق الهاتف:', mobileUrl);
    console.log('📱 IP المكتشف:', localIP);
  };

  const startDeviceDiscovery = () => {
    const devices = ['192.168.1.100', '192.168.1.101', '192.168.1.102'];
    setConnectedDevices(devices);
  };

  const startStream = async () => {
    if (!selectedCamera || selectedCamera.type === 'mobile') return;

    try {
      const constraints = {
        video: {
          deviceId: selectedCamera.deviceId ? { exact: selectedCamera.deviceId } : undefined,
          width: { ideal: videoQuality === 'high' ? 1920 : videoQuality === 'medium' ? 1280 : 640 },
          height: { ideal: videoQuality === 'high' ? 1080 : videoQuality === 'medium' ? 720 : 480 }
        },
        audio: audioEnabled
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      streamRef.current = stream;
      setIsStreaming(true);
      
      setCameras(prev => prev.map(cam => ({
        ...cam,
        isActive: cam.id === selectedCamera.id
      })));
      
    } catch (error) {
      console.error('خطأ في بدء البث:', error);
      alert('لا يمكن الوصول إلى الكاميرا. تحقق من الأذونات.');
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    stopRecording();
    
    setCameras(prev => prev.map(cam => ({
      ...cam,
      isActive: false
    })));
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${new Date().toISOString().slice(0, 19)}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('خطأ في بدء التسجيل:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    
    setIsRecording(false);
    setRecordingTime(0);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `photo-${new Date().toISOString().slice(0, 19)}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎥 كاميرا الجهاز والهاتف</h2>
            <p className="text-green-100">مراقبة مباشرة من الكاميرات المحلية</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100">الكاميرات المتاحة</div>
            <div className="text-3xl font-bold">{cameras.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Display */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">📹 عرض الكاميرا</h3>
            
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">اختر كاميرا وابدأ البث</p>
                  </div>
                </div>
              )}
              
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  {formatTime(recordingTime)}
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">🎮 التحكم</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={isStreaming ? stopStream : startStream}
                disabled={!selectedCamera || selectedCamera.type === 'mobile'}
                className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isStreaming
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                }`}
              >
                {isStreaming ? (
                  <>
                    <Square className="h-4 w-4 ml-2" />
                    إيقاف البث
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 ml-2" />
                    بدء البث
                  </>
                )}
              </button>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isStreaming}
                className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isRecording
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="h-4 w-4 ml-2" />
                    إيقاف التسجيل
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 ml-2" />
                    بدء التسجيل
                  </>
                )}
              </button>

              <button
                onClick={capturePhoto}
                disabled={!isStreaming}
                className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                <Camera className="h-4 w-4 ml-2" />
                التقاط صورة
              </button>

              <button
                onClick={generateQRCode}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث QR
              </button>
            </div>
          </div>
        </div>

        {/* Settings and Mobile */}
        <div className="space-y-4">
          {/* Camera Selection */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">📱 اختيار الكاميرا</h3>
            
            <div className="space-y-2">
              {cameras.map((camera) => (
                <div
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedCamera?.id === camera.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {camera.type === 'mobile' ? (
                        <Smartphone className="h-5 w-5 text-blue-600 ml-3" />
                      ) : (
                        <Monitor className="h-5 w-5 text-green-600 ml-3" />
                      )}
                      <div>
                        <div className="font-medium">{camera.name}</div>
                        <div className="text-sm text-gray-500">
                          {camera.type === 'mobile' ? 'هاتف محمول' : 'كاميرا ويب'}
                        </div>
                      </div>
                    </div>
                    {camera.isActive && (
                      <div className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full ml-2 animate-pulse"></div>
                        نشط
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile QR Code */}
          {selectedCamera?.type === 'mobile' && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">📱 ربط الهاتف المحمول</h3>
              
              <div className="text-center">
                {qrCodeUrl && (
                  <div className="mb-4">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="mx-auto rounded-lg shadow-sm"
                      style={{ maxWidth: '200px' }}
                    />
                    <p className="text-sm text-gray-600 mt-2">امسح الكود بكاميرا الهاتف</p>
                  </div>
                )}
                
                {mobileAppUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">أو افتح الرابط مباشرة:</p>
                    <div className="flex items-center justify-between bg-gray-50 rounded border p-2">
                      <span className="text-xs font-mono text-blue-600 truncate flex-1">
                        {mobileAppUrl}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(mobileAppUrl);
                          alert('تم نسخ الرابط!');
                        }}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors mr-2"
                      >
                        نسخ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Connected Devices */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">🌐 الأجهزة المتصلة</h3>
            
            <div className="space-y-2">
              {connectedDevices.length > 0 ? (
                connectedDevices.map((device, index) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded">
                    <Eye className="h-4 w-4 text-green-600 ml-2" />
                    <span className="text-sm font-mono">{device}</span>
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
            <h3 className="font-bold text-blue-900 mb-3">📱 تعليمات ربط الهاتف</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-bold mb-2">🔗 خطوات الربط:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>تأكد من اتصال الهاتف والكمبيوتر بنفس شبكة Wi-Fi</li>
                  <li>امسح QR Code بكاميرا الهاتف أو انسخ الرابط</li>
                  <li>اضغط "بدء البث" في تطبيق الهاتف</li>
                  <li>امنح إذن الكاميرا عند الطلب</li>
                </ol>
              </div>
              
              <div className="bg-yellow-100 rounded-lg p-3">
                <h4 className="font-bold mb-2">⚠️ في حالة عدم الاتصال:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>تحقق من شبكة Wi-Fi (نفس الشبكة)</li>
                  <li>جرب إعادة تحميل الصفحة في الهاتف</li>
                  <li>تأكد من عمل المنفذ 5173</li>
                  <li>قم بإيقاف Firewall مؤقتاً</li>
                </ul>
              </div>
              
              <div className="bg-green-100 rounded-lg p-3">
                <h4 className="font-bold mb-2">✅ للكاميرا المحلية:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>اختر الكاميرا واضغط "بدء البث"</li>
                  <li>يمكنك التسجيل والتقاط الصور</li>
                  <li>تحكم في الجودة والإعدادات</li>
                </ul>
              </div>
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
