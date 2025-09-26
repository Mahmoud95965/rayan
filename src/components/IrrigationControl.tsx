import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  Calendar,
  Gauge,
  Zap,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Timer,
  Sliders
} from 'lucide-react';
import { iotService, IrrigationDevice, ValveDevice } from '../services/iotService';

interface IrrigationSchedule {
  id: string;
  name: string;
  enabled: boolean;
  times: string[];
  duration: number; // minutes
  days: string[];
  zones: string[];
}

const IrrigationControl: React.FC = () => {
  const [irrigationDevices, setIrrigationDevices] = useState<IrrigationDevice[]>([]);
  const [valveDevices, setValveDevices] = useState<ValveDevice[]>([]);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IrrigationDevice | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [controlLoading, setControlLoading] = useState<string | null>(null);
  const [waterUsageToday, setWaterUsageToday] = useState(0);
  const [systemPressure, setSystemPressure] = useState(2.5); // bar

  useEffect(() => {
    loadDevices();
    loadSchedules();
    
    // Update data every 5 seconds
    const interval = setInterval(() => {
      loadDevices();
      updateSystemData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDevices = () => {
    const irrigation = iotService.getDevicesByType('irrigation') as IrrigationDevice[];
    const valves = iotService.getDevicesByType('valve') as ValveDevice[];
    
    setIrrigationDevices(irrigation);
    setValveDevices(valves);
    
    if (irrigation.length > 0 && !selectedDevice) {
      setSelectedDevice(irrigation[0]);
    }
  };

  const loadSchedules = () => {
    // Load from localStorage or Firebase
    const savedSchedules = localStorage.getItem('irrigation_schedules');
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    } else {
      // Default schedules
      const defaultSchedules: IrrigationSchedule[] = [
        {
          id: '1',
          name: 'ري الصباح',
          enabled: true,
          times: ['06:00'],
          duration: 30,
          days: ['الأحد', 'الثلاثاء', 'الخميس'],
          zones: ['القطعة الشمالية', 'القطعة الجنوبية']
        },
        {
          id: '2',
          name: 'ري المساء',
          enabled: true,
          times: ['18:00'],
          duration: 20,
          days: ['الاثنين', 'الأربعاء', 'الجمعة'],
          zones: ['القطعة الغربية']
        }
      ];
      setSchedules(defaultSchedules);
      localStorage.setItem('irrigation_schedules', JSON.stringify(defaultSchedules));
    }
  };

  const updateSystemData = () => {
    // Simulate real-time data updates
    setWaterUsageToday(prev => prev + Math.random() * 0.5);
    setSystemPressure(2.3 + Math.random() * 0.4);
  };

  const handleIrrigationControl = async (deviceId: string, action: 'start' | 'stop') => {
    setControlLoading(deviceId);
    try {
      await iotService.controlIrrigation(deviceId, action);
      loadDevices();
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
      loadDevices();
    } catch (error) {
      console.error('Valve control error:', error);
    } finally {
      setControlLoading(null);
    }
  };

  const handleScheduleToggle = async (scheduleId: string) => {
    const updatedSchedules = schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, enabled: !schedule.enabled }
        : schedule
    );
    setSchedules(updatedSchedules);
    localStorage.setItem('irrigation_schedules', JSON.stringify(updatedSchedules));
  };

  const startManualIrrigation = async (deviceId: string, duration: number) => {
    try {
      await handleIrrigationControl(deviceId, 'start');
      
      // Auto-stop after duration
      setTimeout(async () => {
        await handleIrrigationControl(deviceId, 'stop');
      }, duration * 60 * 1000);
      
    } catch (error) {
      console.error('Manual irrigation error:', error);
    }
  };

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'error': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Droplets className="h-6 w-6 ml-2 text-blue-600" />
          نظام التحكم في الري
        </h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="text-sm text-gray-600">
            ضغط النظام: {systemPressure.toFixed(1)} بار
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Calendar className="h-4 w-4 ml-1" />
            إدارة الجدولة
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Droplets className="h-8 w-8 text-blue-600 ml-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">استهلاك اليوم</p>
              <p className="text-2xl font-bold text-blue-900">
                {waterUsageToday.toFixed(1)} لتر
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 ml-3" />
            <div>
              <p className="text-sm font-medium text-green-600">أنظمة نشطة</p>
              <p className="text-2xl font-bold text-green-900">
                {irrigationDevices.filter(d => d.data.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Gauge className="h-8 w-8 text-purple-600 ml-3" />
            <div>
              <p className="text-sm font-medium text-purple-600">ضغط النظام</p>
              <p className="text-2xl font-bold text-purple-900">
                {systemPressure.toFixed(1)} بار
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <Timer className="h-8 w-8 text-orange-600 ml-3" />
            <div>
              <p className="text-sm font-medium text-orange-600">جدولة نشطة</p>
              <p className="text-2xl font-bold text-orange-900">
                {schedules.filter(s => s.enabled).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Irrigation Systems */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">أنظمة الري</h3>
          
          {irrigationDevices.map((device) => (
            <div key={device.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ml-3 ${
                    device.status === 'online' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Droplets className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{device.name}</h4>
                    <p className="text-sm text-gray-600">{device.location}</p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDeviceStatusColor(device.status)}`}>
                  {device.status === 'online' ? 'متصل' : 'غير متصل'}
                </span>
              </div>

              {device.status === 'online' && (
                <>
                  {/* Status Info */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        device.data.isActive ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {device.data.isActive ? 'يعمل' : 'متوقف'}
                      </div>
                      <div className="text-xs text-gray-500">الحالة</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {device.data.flowRate} ل/د
                      </div>
                      <div className="text-xs text-gray-500">معدل التدفق</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {device.data.totalFlow} لتر
                      </div>
                      <div className="text-xs text-gray-500">إجمالي اليوم</div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleIrrigationControl(device.id, device.data.isActive ? 'stop' : 'start')}
                      disabled={controlLoading === device.id}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
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
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 ml-1" />
                          تشغيل
                        </>
                      )}
                    </button>
                    
                    <div className="flex space-x-1 space-x-reverse">
                      {[5, 10, 15, 30].map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => startManualIrrigation(device.id, minutes)}
                          disabled={device.data.isActive || controlLoading === device.id}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50"
                        >
                          {minutes}د
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Schedule Info */}
                  {device.data.schedule.enabled && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-600 ml-2" />
                          <span className="text-sm text-blue-800">
                            الجدولة: {device.data.schedule.times.join(', ')} | 
                            {device.data.schedule.duration} دقيقة
                          </span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Valve Controls */}
          <h3 className="text-xl font-bold text-gray-900 mt-8">صمامات المياه</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {valveDevices.map((valve) => (
              <div key={valve.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{valve.name}</h4>
                    <p className="text-sm text-gray-600">{valve.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    valve.data.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {valve.data.isOpen ? 'مفتوح' : 'مغلق'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">نسبة الفتح</span>
                    <span className="text-sm font-medium">{valve.data.openPercentage}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${valve.data.openPercentage}%` }}
                    ></div>
                  </div>

                  <div className="flex space-x-1 space-x-reverse">
                    {[0, 25, 50, 75, 100].map((percentage) => (
                      <button
                        key={percentage}
                        onClick={() => handleValveControl(valve.id, percentage)}
                        disabled={controlLoading === valve.id}
                        className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                          valve.data.openPercentage === percentage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {percentage}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedules Panel */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">جدولة الري</h3>
          
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{schedule.name}</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={() => handleScheduleToggle(schedule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 ml-2" />
                  <span className="text-gray-600">
                    {schedule.times.join(', ')} | {schedule.duration} دقيقة
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 ml-2" />
                  <span className="text-gray-600">
                    {schedule.days.join(', ')}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Droplets className="h-4 w-4 text-gray-500 ml-2" />
                  <span className="text-gray-600">
                    {schedule.zones.join(', ')}
                  </span>
                </div>
              </div>

              {schedule.enabled && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                    <span className="text-sm text-green-800">الجدولة نشطة</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h4 className="font-semibold text-gray-900 mb-3">تنبيهات النظام</h4>
            
            <div className="space-y-2">
              {systemPressure < 2.0 && (
                <div className="flex items-center p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600 ml-2" />
                  <span className="text-sm text-red-800">ضغط منخفض في النظام</span>
                </div>
              )}
              
              {waterUsageToday > 1000 && (
                <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 ml-2" />
                  <span className="text-sm text-yellow-800">استهلاك مياه عالي اليوم</span>
                </div>
              )}
              
              {irrigationDevices.filter(d => d.status === 'offline').length > 0 && (
                <div className="flex items-center p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600 ml-2" />
                  <span className="text-sm text-red-800">
                    {irrigationDevices.filter(d => d.status === 'offline').length} جهاز غير متصل
                  </span>
                </div>
              )}
              
              {irrigationDevices.filter(d => d.status === 'offline').length === 0 && 
               systemPressure >= 2.0 && waterUsageToday <= 1000 && (
                <div className="flex items-center p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                  <span className="text-sm text-green-800">جميع الأنظمة تعمل بشكل طبيعي</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationControl;
