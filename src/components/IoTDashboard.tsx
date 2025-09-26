import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Droplets, 
  Thermometer, 
  Settings, 
  Power, 
  Play, 
  Pause, 
  RotateCcw,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sliders
} from 'lucide-react';
import { 
  iotService, 
  IoTDevice, 
  CameraDevice, 
  IrrigationDevice, 
  SensorDevice, 
  ValveDevice,
  createMockDevices 
} from '../services/iotService';

const IoTDashboard: React.FC = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
    
    // Auto-refresh devices every 10 seconds
    const interval = setInterval(loadDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    try {
      const deviceList = iotService.getDevices();
      
      // Create mock devices if none exist
      if (deviceList.length === 0) {
        await createMockDevices();
        setDevices(iotService.getDevices());
      } else {
        setDevices(deviceList);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading devices:', error);
      setLoading(false);
    }
  };

  const handleCameraControl = async (deviceId: string, action: 'start' | 'stop' | 'record' | 'snapshot') => {
    setControlLoading(deviceId);
    try {
      await iotService.controlCamera(deviceId, action);
      await loadDevices(); // Refresh devices
    } catch (error) {
      console.error('Camera control error:', error);
    } finally {
      setControlLoading(null);
    }
  };

  const handleIrrigationControl = async (deviceId: string, action: 'start' | 'stop') => {
    setControlLoading(deviceId);
    try {
      await iotService.controlIrrigation(deviceId, action);
      await loadDevices();
    } catch (error) {
      console.error('Irrigation control error:', error);
    } finally {
      setControlLoading(null);
    }
  };

  const handleValveControl = async (deviceId: string, percentage: number) => {
    setControlLoading(deviceId);
    try {
      await iotService.controlValve(deviceId, percentage);
      await loadDevices();
    } catch (error) {
      console.error('Valve control error:', error);
    } finally {
      setControlLoading(null);
    }
  };

  const getDeviceIcon = (device: IoTDevice) => {
    const iconClass = "h-6 w-6";
    switch (device.type) {
      case 'camera':
        return <Camera className={iconClass} />;
      case 'irrigation':
        return <Droplets className={iconClass} />;
      case 'sensor':
        return <Thermometer className={iconClass} />;
      case 'valve':
        return <Settings className={iconClass} />;
      default:
        return <Settings className={iconClass} />;
    }
  };

  const getStatusColor = (status: IoTDevice['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      case 'error':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: IoTDevice['status']) => {
    switch (status) {
      case 'online': return 'متصل';
      case 'offline': return 'غير متصل';
      case 'error': return 'خطأ';
      default: return 'غير معروف';
    }
  };

  const renderCameraControls = (device: CameraDevice) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">حالة التسجيل</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          device.data.isRecording ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {device.data.isRecording ? 'يسجل' : 'متوقف'}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">الدقة</span>
        <span className="text-sm font-medium">{device.data.resolution}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">كشف الحركة</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          device.data.motionDetection ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {device.data.motionDetection ? 'مفعل' : 'معطل'}
        </span>
      </div>

      <div className="flex space-x-2 space-x-reverse pt-3">
        <button
          onClick={() => handleCameraControl(device.id, 'record')}
          disabled={controlLoading === device.id}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            device.data.isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {controlLoading === device.id ? (
            <RotateCcw className="h-4 w-4 animate-spin mx-auto" />
          ) : device.data.isRecording ? (
            <>
              <Pause className="h-4 w-4 ml-1" />
              إيقاف التسجيل
            </>
          ) : (
            <>
              <Play className="h-4 w-4 ml-1" />
              بدء التسجيل
            </>
          )}
        </button>
        
        <button
          onClick={() => handleCameraControl(device.id, 'snapshot')}
          disabled={controlLoading === device.id}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          📸
        </button>
      </div>
    </div>
  );

  const renderIrrigationControls = (device: IrrigationDevice) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">حالة النظام</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          device.data.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {device.data.isActive ? 'يعمل' : 'متوقف'}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">معدل التدفق</span>
        <span className="text-sm font-medium">{device.data.flowRate} لتر/دقيقة</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">إجمالي اليوم</span>
        <span className="text-sm font-medium">{device.data.totalFlow} لتر</span>
      </div>

      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">الجدولة</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            device.data.schedule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {device.data.schedule.enabled ? 'مفعلة' : 'معطلة'}
          </span>
        </div>
        
        {device.data.schedule.enabled && (
          <div className="text-xs text-gray-600">
            المواعيد: {device.data.schedule.times.join(', ')} | 
            المدة: {device.data.schedule.duration} دقيقة
          </div>
        )}
      </div>

      <div className="flex space-x-2 space-x-reverse pt-3">
        <button
          onClick={() => handleIrrigationControl(device.id, device.data.isActive ? 'stop' : 'start')}
          disabled={controlLoading === device.id}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            device.data.isActive
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {controlLoading === device.id ? (
            <RotateCcw className="h-4 w-4 animate-spin mx-auto" />
          ) : device.data.isActive ? (
            <>
              <Pause className="h-4 w-4 ml-1" />
              إيقاف الري
            </>
          ) : (
            <>
              <Play className="h-4 w-4 ml-1" />
              بدء الري
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSensorData = (device: SensorDevice) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-xs text-red-600 mb-1">درجة الحرارة</div>
          <div className="text-lg font-bold text-red-700">{device.data.temperature}°م</div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-blue-600 mb-1">الرطوبة</div>
          <div className="text-lg font-bold text-blue-700">{device.data.humidity}%</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-green-600 mb-1">رطوبة التربة</div>
          <div className="text-lg font-bold text-green-700">{device.data.soilMoisture}%</div>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-xs text-yellow-600 mb-1">الإضاءة</div>
          <div className="text-lg font-bold text-yellow-700">{device.data.lightLevel}%</div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center pt-2">
        آخر قراءة: {device.data.timestamp.toLocaleTimeString('ar-EG')}
      </div>
    </div>
  );

  const renderValveControls = (device: ValveDevice) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">حالة الصمام</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          device.data.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {device.data.isOpen ? 'مفتوح' : 'مغلق'}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">نسبة الفتح</span>
          <span className="text-sm font-medium">{device.data.openPercentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${device.data.openPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">التحكم في الفتح:</label>
        <div className="flex space-x-2 space-x-reverse">
          {[0, 25, 50, 75, 100].map((percentage) => (
            <button
              key={percentage}
              onClick={() => handleValveControl(device.id, percentage)}
              disabled={controlLoading === device.id}
              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                device.data.openPercentage === percentage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {percentage}%
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        آخر تحكم: {device.data.lastAction.toLocaleTimeString('ar-EG')}
      </div>
    </div>
  );

  const renderDeviceControls = (device: IoTDevice) => {
    switch (device.type) {
      case 'camera':
        return renderCameraControls(device as CameraDevice);
      case 'irrigation':
        return renderIrrigationControls(device as IrrigationDevice);
      case 'sensor':
        return renderSensorData(device as SensorDevice);
      case 'valve':
        return renderValveControls(device as ValveDevice);
      default:
        return <div className="text-sm text-gray-500">لا توجد عناصر تحكم متاحة</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RotateCcw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل الأجهزة...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Wifi className="h-6 w-6 ml-2 text-blue-600" />
          أجهزة إنترنت الأشياء (IoT)
        </h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="text-sm text-gray-600">
            {devices.filter(d => d.status === 'online').length} من {devices.length} متصل
          </div>
          <button
            onClick={loadDevices}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 ml-3" />
            <div>
              <p className="text-sm font-medium text-green-600">أجهزة متصلة</p>
              <p className="text-2xl font-bold text-green-900">
                {devices.filter(d => d.status === 'online').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <WifiOff className="h-8 w-8 text-red-600 ml-3" />
            <div>
              <p className="text-sm font-medium text-red-600">أجهزة منقطعة</p>
              <p className="text-2xl font-bold text-red-900">
                {devices.filter(d => d.status === 'offline').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-blue-600 ml-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">كاميرات</p>
              <p className="text-2xl font-bold text-blue-900">
                {devices.filter(d => d.type === 'camera').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-cyan-50 rounded-lg p-4">
          <div className="flex items-center">
            <Droplets className="h-8 w-8 text-cyan-600 ml-3" />
            <div>
              <p className="text-sm font-medium text-cyan-600">أنظمة الري</p>
              <p className="text-2xl font-bold text-cyan-900">
                {devices.filter(d => d.type === 'irrigation').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div key={device.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              {/* Device Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ml-3 ${
                    device.status === 'online' ? 'bg-green-100' :
                    device.status === 'offline' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {getDeviceIcon(device)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{device.name}</h3>
                    <p className="text-sm text-gray-600">{device.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {device.status === 'online' ? (
                    <Wifi className="h-4 w-4 text-green-600" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                  {getStatusText(device.status)}
                </span>
                <span className="text-xs text-gray-500">
                  <Clock className="h-3 w-3 inline ml-1" />
                  {device.lastUpdate.toLocaleTimeString('ar-EG')}
                </span>
              </div>

              {/* Device Controls */}
              {device.status === 'online' && renderDeviceControls(device)}
              
              {device.status === 'offline' && (
                <div className="text-center py-4 text-gray-500">
                  <WifiOff className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">الجهاز غير متصل</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أجهزة مسجلة</h3>
          <p className="text-gray-600">قم بإضافة أجهزة IoT لبدء المراقبة والتحكم</p>
        </div>
      )}
    </div>
  );
};

export default IoTDashboard;
