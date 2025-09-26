import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Play, 
  Pause, 
  Square, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Settings,
  Download,
  Share2,
  Maximize,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff
} from 'lucide-react';
import { iotService, CameraDevice } from '../services/iotService';

interface CameraStream {
  id: string;
  url: string;
  isLive: boolean;
  quality: 'low' | 'medium' | 'high';
}

const RealCameraControl: React.FC = () => {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CameraDevice | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [cameraSettings, setCameraSettings] = useState({
    brightness: 50,
    contrast: 50,
    saturation: 50,
    zoom: 1,
    pan: 0,
    tilt: 0
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadCameras();
  }, []);

  useEffect(() => {
    if (selectedCamera?.data.isRecording) {
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
  }, [selectedCamera?.data.isRecording]);

  const loadCameras = () => {
    const cameraDevices = iotService.getDevicesByType('camera') as CameraDevice[];
    setCameras(cameraDevices);
    
    if (cameraDevices.length > 0 && !selectedCamera) {
      setSelectedCamera(cameraDevices[0]);
    }
  };

  const startStream = async (camera: CameraDevice) => {
    try {
      setIsStreaming(true);
      
      // For real cameras, this would connect to RTSP/WebRTC stream
      if (camera.data.streamUrl.startsWith('rtsp://')) {
        // Convert RTSP to WebRTC or use HLS
        const webrtcUrl = await convertRTSPToWebRTC(camera.data.streamUrl);
        setStreamUrl(webrtcUrl);
      } else {
        setStreamUrl(camera.data.streamUrl);
      }

      // Start the video stream
      if (videoRef.current) {
        videoRef.current.src = streamUrl;
        videoRef.current.play();
      }
      
      console.log(`📹 Started stream for ${camera.name}`);
    } catch (error) {
      console.error('Error starting stream:', error);
      setIsStreaming(false);
    }
  };

  const stopStream = () => {
    setIsStreaming(false);
    setStreamUrl('');
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
  };

  const convertRTSPToWebRTC = async (rtspUrl: string): Promise<string> => {
    // This would typically use a media server like Kurento, Janus, or WebRTC gateway
    // For demo purposes, we'll simulate this
    console.log(`Converting RTSP ${rtspUrl} to WebRTC...`);
    
    // In production, you'd call your media server API
    // return await fetch('/api/rtsp-to-webrtc', {
    //   method: 'POST',
    //   body: JSON.stringify({ rtspUrl })
    // }).then(res => res.json()).then(data => data.webrtcUrl);
    
    // For demo, return a placeholder
    return 'blob:' + URL.createObjectURL(new Blob());
  };

  const handleCameraControl = async (action: string, params?: any) => {
    if (!selectedCamera) return;

    try {
      switch (action) {
        case 'record':
          await iotService.controlCamera(selectedCamera.id, 'record');
          break;
        case 'snapshot':
          await takeSnapshot();
          break;
        case 'pan':
          await sendCameraCommand('pan', { direction: params.direction, speed: params.speed });
          break;
        case 'tilt':
          await sendCameraCommand('tilt', { direction: params.direction, speed: params.speed });
          break;
        case 'zoom':
          await sendCameraCommand('zoom', { level: params.level });
          setCameraSettings(prev => ({ ...prev, zoom: params.level }));
          break;
        case 'preset':
          await sendCameraCommand('gotoPreset', { preset: params.preset });
          break;
      }
      
      loadCameras(); // Refresh camera data
    } catch (error) {
      console.error('Camera control error:', error);
    }
  };

  const sendCameraCommand = async (command: string, params: any) => {
    if (!selectedCamera) return;
    
    // This would send actual commands to the camera
    console.log(`📡 Sending ${command} to ${selectedCamera.name}:`, params);
    
    // Simulate API call to camera
    // await fetch(`/api/cameras/${selectedCamera.id}/command`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ command, params })
    // });
  };

  const takeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snapshot-${selectedCamera?.name}-${new Date().toISOString()}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/jpeg', 0.9);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Camera className="h-6 w-6 ml-2 text-blue-600" />
          التحكم في الكاميرات الحقيقية
        </h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <select
            value={selectedCamera?.id || ''}
            onChange={(e) => {
              const camera = cameras.find(c => c.id === e.target.value);
              setSelectedCamera(camera || null);
              if (isStreaming) {
                stopStream();
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">اختر كاميرا</option>
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.name} - {camera.status === 'online' ? 'متصلة' : 'غير متصلة'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCamera ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Stream */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden relative">
              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full h-96 object-cover"
                controls={false}
                muted={!audioEnabled}
                onLoadedMetadata={() => console.log('Video loaded')}
                onError={(e) => console.error('Video error:', e)}
              />
              
              {/* Hidden Canvas for Screenshots */}
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Stream Overlay */}
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <button
                    onClick={() => selectedCamera && startStream(selectedCamera)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Play className="h-5 w-5 ml-2" />
                    بدء البث المباشر
                  </button>
                </div>
              )}
              
              {/* Recording Indicator */}
              {selectedCamera.data.isRecording && (
                <div className="absolute top-4 left-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-2"></div>
                  REC {formatRecordingTime(recordingTime)}
                </div>
              )}
              
              {/* Connection Status */}
              <div className="absolute top-4 right-4">
                {selectedCamera.status === 'online' ? (
                  <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                    <Wifi className="h-3 w-3 ml-1" />
                    متصلة
                  </div>
                ) : (
                  <div className="flex items-center bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                    <WifiOff className="h-3 w-3 ml-1" />
                    منقطعة
                  </div>
                )}
              </div>
              
              {/* Control Overlay */}
              {isStreaming && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleCameraControl('record')}
                      className={`p-2 rounded-full ${
                        selectedCamera.data.isRecording 
                          ? 'bg-red-600 text-white' 
                          : 'bg-white text-gray-700'
                      } hover:opacity-80`}
                    >
                      {selectedCamera.data.isRecording ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleCameraControl('snapshot')}
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
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 bg-white text-gray-700 rounded-full hover:opacity-80"
                    >
                      <Maximize className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={stopStream}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <Pause className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Camera Info */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">معلومات الكاميرا</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">الاسم</span>
                  <span className="font-medium">{selectedCamera.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الموقع</span>
                  <span className="font-medium">{selectedCamera.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الدقة</span>
                  <span className="font-medium">{selectedCamera.data.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">كشف الحركة</span>
                  <span className={`font-medium ${
                    selectedCamera.data.motionDetection ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {selectedCamera.data.motionDetection ? 'مفعل' : 'معطل'}
                  </span>
                </div>
              </div>
            </div>

            {/* PTZ Controls */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">التحكم في الاتجاه</h3>
              
              {/* Pan/Tilt Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => handleCameraControl('pan', { direction: 'left', speed: 50 })}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  ↖
                </button>
                <button
                  onClick={() => handleCameraControl('tilt', { direction: 'up', speed: 50 })}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleCameraControl('pan', { direction: 'right', speed: 50 })}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  ↗
                </button>
                
                <button
                  onClick={() => handleCameraControl('pan', { direction: 'left', speed: 50 })}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  ←
                </button>
                <button
                  onClick={() => handleCameraControl('preset', { preset: 'home' })}
                  className="p-2 bg-blue-100 rounded hover:bg-blue-200 text-blue-700"
                >
                  🏠
                </button>
                <button
                  onClick={() => handleCameraControl('pan', { direction: 'right', speed: 50 })}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  →
                </button>
                
                <button
                  onClick={() => handleCameraControl('pan', { direction: 'left', speed: 50 })}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  ↙
                </button>
                <button
                  onClick={() => handleCameraControl('tilt', { direction: 'down', speed: 50 })}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleCameraControl('pan', { direction: 'right', speed: 50 })}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  ↘
                </button>
              </div>
              
              {/* Zoom Controls */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <button
                  onClick={() => handleCameraControl('zoom', { level: Math.max(1, cameraSettings.zoom - 0.5) })}
                  className="flex-1 p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium">{cameraSettings.zoom}x</span>
                <button
                  onClick={() => handleCameraControl('zoom', { level: Math.min(10, cameraSettings.zoom + 0.5) })}
                  className="flex-1 p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">المواضع المحفوظة</h3>
              <div className="grid grid-cols-2 gap-2">
                {['الموضع 1', 'الموضع 2', 'الموضع 3', 'الموضع 4'].map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleCameraControl('preset', { preset: index + 1 })}
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">الإعدادات</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">السطوع</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cameraSettings.brightness}
                    onChange={(e) => setCameraSettings(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">التباين</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cameraSettings.contrast}
                    onChange={(e) => setCameraSettings(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">التشبع</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cameraSettings.saturation}
                    onChange={(e) => setCameraSettings(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد كاميرات متاحة</h3>
          <p className="text-gray-600">قم بإضافة كاميرات إلى النظام لبدء المراقبة</p>
        </div>
      )}
    </div>
  );
};

export default RealCameraControl;
