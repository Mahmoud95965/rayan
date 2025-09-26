import React, { useState, useEffect, useRef } from 'react';
import { Camera, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Move, Settings, Download, Share2 } from 'lucide-react';

interface CameraView {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  cropType: string;
  lastUpdate: Date;
  issues: string[];
}

const VirtualCamera: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<string>('1');
  const [isRecording, setIsRecording] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const cameras: CameraView[] = [
    {
      id: '1',
      name: 'كاميرا القطعة الشمالية',
      location: 'القطعة الشمالية - طماطم',
      isActive: true,
      cropType: 'tomato',
      lastUpdate: new Date(),
      issues: []
    },
    {
      id: '2',
      name: 'كاميرا الحقل الجنوبي',
      location: 'الحقل الجنوبي - قمح',
      isActive: true,
      cropType: 'wheat',
      lastUpdate: new Date(),
      issues: ['رطوبة منخفضة']
    },
    {
      id: '3',
      name: 'كاميرا القطعة الغربية',
      location: 'القطعة الغربية - ذرة',
      isActive: false,
      cropType: 'corn',
      lastUpdate: new Date(Date.now() - 3600000),
      issues: ['انقطاع الاتصال']
    },
    {
      id: '4',
      name: 'كاميرا المدخل الرئيسي',
      location: 'مدخل المزرعة',
      isActive: true,
      cropType: 'general',
      lastUpdate: new Date(),
      issues: []
    }
  ];

  useEffect(() => {
    drawCameraView();
    
    if (isRecording) {
      animationRef.current = requestAnimationFrame(animateView);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedCamera, zoom, rotation, position, isRecording]);

  const drawCameraView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const camera = cameras.find(c => c.id === selectedCamera);
    if (!camera) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context for transformations
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y);
    ctx.scale(zoom, zoom);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw background based on crop type
    drawBackground(ctx, camera.cropType, canvas.width, canvas.height);

    // Draw crops
    drawCrops(ctx, camera.cropType, canvas.width, canvas.height);

    // Draw environmental elements
    drawEnvironment(ctx, canvas.width, canvas.height);

    // Restore context
    ctx.restore();

    // Draw UI overlay
    drawOverlay(ctx, camera, canvas.width, canvas.height);
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, cropType: string, width: number, height: number) => {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.4);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height * 0.4);

    // Ground
    const groundColor = cropType === 'wheat' ? '#8B4513' : '#228B22';
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, height * 0.4, width, height * 0.6);

    // Add texture to ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = height * 0.4 + Math.random() * height * 0.6;
      ctx.fillRect(x, y, 2, 1);
    }
  };

  const drawCrops = (ctx: CanvasRenderingContext2D, cropType: string, width: number, height: number) => {
    const cropStartY = height * 0.6;
    
    switch (cropType) {
      case 'tomato':
        drawTomatoPlants(ctx, width, cropStartY, height);
        break;
      case 'wheat':
        drawWheatField(ctx, width, cropStartY, height);
        break;
      case 'corn':
        drawCornField(ctx, width, cropStartY, height);
        break;
      default:
        drawGeneralVegetation(ctx, width, cropStartY, height);
    }
  };

  const drawTomatoPlants = (ctx: CanvasRenderingContext2D, width: number, startY: number, height: number) => {
    for (let i = 0; i < 8; i++) {
      const x = (width / 9) * (i + 1);
      const plantHeight = 40 + Math.random() * 20;
      
      // Stem
      ctx.strokeStyle = '#228B22';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY - plantHeight);
      ctx.stroke();
      
      // Leaves
      ctx.fillStyle = '#32CD32';
      for (let j = 0; j < 4; j++) {
        const leafY = startY - (plantHeight / 4) * (j + 1);
        ctx.beginPath();
        ctx.ellipse(x - 8, leafY, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 8, leafY, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Tomatoes
      ctx.fillStyle = '#FF6347';
      for (let j = 0; j < 3; j++) {
        const tomatoY = startY - 15 - j * 8;
        ctx.beginPath();
        ctx.arc(x + (j % 2 === 0 ? -5 : 5), tomatoY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const drawWheatField = (ctx: CanvasRenderingContext2D, width: number, startY: number, height: number) => {
    ctx.fillStyle = '#DAA520';
    for (let i = 0; i < width; i += 3) {
      const wheatHeight = 30 + Math.random() * 15;
      ctx.fillRect(i, startY - wheatHeight, 2, wheatHeight);
      
      // Wheat head
      ctx.fillStyle = '#F4A460';
      ctx.fillRect(i, startY - wheatHeight - 5, 2, 5);
      ctx.fillStyle = '#DAA520';
    }
  };

  const drawCornField = (ctx: CanvasRenderingContext2D, width: number, startY: number, height: number) => {
    for (let i = 0; i < 6; i++) {
      const x = (width / 7) * (i + 1);
      const cornHeight = 60 + Math.random() * 20;
      
      // Stalk
      ctx.strokeStyle = '#228B22';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY - cornHeight);
      ctx.stroke();
      
      // Leaves
      ctx.strokeStyle = '#32CD32';
      ctx.lineWidth = 2;
      for (let j = 0; j < 6; j++) {
        const leafY = startY - (cornHeight / 6) * (j + 1);
        ctx.beginPath();
        ctx.moveTo(x, leafY);
        ctx.lineTo(x + 15, leafY - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, leafY);
        ctx.lineTo(x - 15, leafY - 5);
        ctx.stroke();
      }
      
      // Corn cob
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x - 3, startY - cornHeight + 10, 6, 15);
    }
  };

  const drawGeneralVegetation = (ctx: CanvasRenderingContext2D, width: number, startY: number, height: number) => {
    // Draw various plants and trees
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * width;
      const size = 5 + Math.random() * 10;
      ctx.beginPath();
      ctx.arc(x, startY - size, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawEnvironment = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Sun
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(width - 50, 50, 20, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(ctx, 100, 60, 30);
    drawCloud(ctx, 250, 40, 25);

    // Birds
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const x = 150 + i * 50;
      const y = 80 + Math.sin(Date.now() / 1000 + i) * 10;
      drawBird(ctx, x, y);
    }
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.7, y, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 1.4, y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBird = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x, y - 3);
    ctx.lineTo(x + 5, y);
    ctx.stroke();
  };

  const drawOverlay = (ctx: CanvasRenderingContext2D, camera: CameraView, width: number, height: number) => {
    // Camera info overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 250, 80);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(camera.name, 20, 30);
    ctx.font = '12px Arial';
    ctx.fillText(camera.location, 20, 50);
    ctx.fillText(`آخر تحديث: ${camera.lastUpdate.toLocaleTimeString('ar-EG')}`, 20, 70);

    // Recording indicator
    if (isRecording) {
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(width - 30, 30, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText('REC', width - 50, 35);
    }

    // Issues overlay
    if (camera.issues.length > 0) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fillRect(10, height - 60, 200, 40);
      
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText('تحذير: ' + camera.issues.join(', '), 20, height - 35);
    }

    // Zoom level
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(width - 80, height - 40, 60, 25);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`${(zoom * 100).toFixed(0)}%`, width - 70, height - 22);
  };

  const animateView = () => {
    drawCameraView();
    if (isRecording) {
      animationRef.current = requestAnimationFrame(animateView);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const selectedCameraData = cameras.find(c => c.id === selectedCamera);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Camera className="h-6 w-6 ml-2 text-blue-600" />
          مراقبة المحاصيل المباشرة
        </h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-4 py-2 rounded-lg flex items-center ${
              isRecording 
                ? 'bg-red-600 text-white' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isRecording ? (
              <>
                <Pause className="h-4 w-4 ml-1" />
                إيقاف
              </>
            ) : (
              <>
                <Play className="h-4 w-4 ml-1" />
                تشغيل
              </>
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Camera List */}
        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 mb-3">الكاميرات المتاحة</h3>
          {cameras.map((camera) => (
            <button
              key={camera.id}
              onClick={() => setSelectedCamera(camera.id)}
              className={`w-full p-3 rounded-lg text-right transition-colors ${
                selectedCamera === camera.id
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{camera.name}</div>
                  <div className="text-xs text-gray-600">{camera.location}</div>
                  {camera.issues.length > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      {camera.issues.join(', ')}
                    </div>
                  )}
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  camera.isActive ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>
            </button>
          ))}
        </div>

        {/* Camera View */}
        <div className="lg:col-span-2">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-auto"
            />
            
            {/* Camera Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                >
                  <Move className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <button className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70">
                  <Download className="h-4 w-4" />
                </button>
                <button className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Info */}
        <div className="space-y-4">
          {selectedCameraData && (
            <>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">معلومات الكاميرا</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحالة</span>
                    <span className={`font-medium ${
                      selectedCameraData.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedCameraData.isActive ? 'نشطة' : 'غير نشطة'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">نوع المحصول</span>
                    <span className="font-medium">
                      {selectedCameraData.cropType === 'tomato' ? 'طماطم' :
                       selectedCameraData.cropType === 'wheat' ? 'قمح' :
                       selectedCameraData.cropType === 'corn' ? 'ذرة' : 'عام'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">آخر تحديث</span>
                    <span className="font-medium">
                      {selectedCameraData.lastUpdate.toLocaleTimeString('ar-EG')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">إعدادات العرض</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">التكبير</span>
                    <span className="text-sm font-medium">{(zoom * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">الدوران</span>
                    <span className="text-sm font-medium">{rotation}°</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">التسجيل</span>
                    <span className={`text-sm font-medium ${
                      isRecording ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {isRecording ? 'جاري التسجيل' : 'متوقف'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedCameraData.issues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-bold text-red-800 mb-2">تحذيرات</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {selectedCameraData.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualCamera;
