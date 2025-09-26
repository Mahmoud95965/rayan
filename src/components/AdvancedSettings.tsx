import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Monitor, 
  Smartphone, 
  Wifi, 
  Shield, 
  Zap,
  Database,
  Globe,
  Camera,
  Mic
} from 'lucide-react';

interface AdvancedSettingsProps {
  onSettingsChange?: (settings: any) => void;
}

interface AppSettings {
  // Camera Settings
  defaultVideoQuality: 'low' | 'medium' | 'high';
  defaultFrameRate: number;
  autoStartCamera: boolean;
  enableAudio: boolean;
  
  // Network Settings
  serverPort: number;
  enableCORS: boolean;
  networkTimeout: number;
  maxConnections: number;
  
  // Security Settings
  requireAuth: boolean;
  enableHTTPS: boolean;
  allowedIPs: string[];
  
  // Performance Settings
  enableHardwareAcceleration: boolean;
  maxVideoBufferSize: number;
  compressionLevel: number;
  
  // UI Settings
  theme: 'light' | 'dark' | 'auto';
  language: 'ar' | 'en';
  showAdvancedControls: boolean;
  enableNotifications: boolean;
  
  // Storage Settings
  autoSaveRecordings: boolean;
  maxStorageSize: number;
  compressionFormat: 'webm' | 'mp4';
}

const defaultSettings: AppSettings = {
  defaultVideoQuality: 'medium',
  defaultFrameRate: 30,
  autoStartCamera: false,
  enableAudio: true,
  serverPort: 5173,
  enableCORS: true,
  networkTimeout: 10000,
  maxConnections: 10,
  requireAuth: false,
  enableHTTPS: false,
  allowedIPs: [],
  enableHardwareAcceleration: true,
  maxVideoBufferSize: 50,
  compressionLevel: 5,
  theme: 'light',
  language: 'ar',
  showAdvancedControls: false,
  enableNotifications: true,
  autoSaveRecordings: true,
  maxStorageSize: 1000,
  compressionFormat: 'webm'
};

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'camera' | 'network' | 'security' | 'performance' | 'ui' | 'storage'>('camera');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('rayyan_advanced_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('rayyan_advanced_settings', JSON.stringify(settings));
      setHasChanges(false);
      onSettingsChange?.(settings);
      alert('تم حفظ الإعدادات بنجاح!');
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      alert('فشل في حفظ الإعدادات');
    }
  };

  const resetSettings = () => {
    if (confirm('هل تريد إعادة تعيين جميع الإعدادات للقيم الافتراضية؟')) {
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const tabs = [
    { key: 'camera', label: 'الكاميرا', icon: Camera },
    { key: 'network', label: 'الشبكة', icon: Wifi },
    { key: 'security', label: 'الأمان', icon: Shield },
    { key: 'performance', label: 'الأداء', icon: Zap },
    { key: 'ui', label: 'الواجهة', icon: Monitor },
    { key: 'storage', label: 'التخزين', icon: Database }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">الإعدادات المتقدمة</h3>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={resetSettings}
            className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4 ml-1" />
            إعادة تعيين
          </button>
          
          <button
            onClick={saveSettings}
            disabled={!hasChanges}
            className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
              hasChanges 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="h-4 w-4 ml-1" />
            حفظ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-gray-50 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-4 w-4 ml-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Camera Settings */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-3">إعدادات الكاميرا</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  جودة الفيديو الافتراضية
                </label>
                <select
                  value={settings.defaultVideoQuality}
                  onChange={(e) => updateSetting('defaultVideoQuality', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">منخفضة (480p)</option>
                  <option value="medium">متوسطة (720p)</option>
                  <option value="high">عالية (1080p)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  معدل الإطارات (FPS)
                </label>
                <select
                  value={settings.defaultFrameRate}
                  onChange={(e) => updateSetting('defaultFrameRate', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={15}>15 FPS</option>
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoStartCamera"
                  checked={settings.autoStartCamera}
                  onChange={(e) => updateSetting('autoStartCamera', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoStartCamera" className="mr-2 text-sm text-gray-700">
                  تشغيل الكاميرا تلقائياً
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableAudio"
                  checked={settings.enableAudio}
                  onChange={(e) => updateSetting('enableAudio', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableAudio" className="mr-2 text-sm text-gray-700">
                  تفعيل الصوت
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Network Settings */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-3">إعدادات الشبكة</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  منفذ الخادم
                </label>
                <input
                  type="number"
                  value={settings.serverPort}
                  onChange={(e) => updateSetting('serverPort', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1000"
                  max="65535"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مهلة الاتصال (مللي ثانية)
                </label>
                <input
                  type="number"
                  value={settings.networkTimeout}
                  onChange={(e) => updateSetting('networkTimeout', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1000"
                  max="60000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أقصى عدد اتصالات
                </label>
                <input
                  type="number"
                  value={settings.maxConnections}
                  onChange={(e) => updateSetting('maxConnections', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="100"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableCORS"
                  checked={settings.enableCORS}
                  onChange={(e) => updateSetting('enableCORS', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableCORS" className="mr-2 text-sm text-gray-700">
                  تفعيل CORS
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-3">إعدادات الأمان</h4>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireAuth"
                  checked={settings.requireAuth}
                  onChange={(e) => updateSetting('requireAuth', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireAuth" className="mr-2 text-sm text-gray-700">
                  طلب المصادقة
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableHTTPS"
                  checked={settings.enableHTTPS}
                  onChange={(e) => updateSetting('enableHTTPS', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableHTTPS" className="mr-2 text-sm text-gray-700">
                  فرض HTTPS
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عناوين IP المسموحة (اختياري)
                </label>
                <textarea
                  value={settings.allowedIPs.join('\n')}
                  onChange={(e) => updateSetting('allowedIPs', e.target.value.split('\n').filter(ip => ip.trim()))}
                  placeholder="192.168.1.100&#10;192.168.1.101"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  اتركه فارغاً للسماح لجميع العناوين
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Settings */}
        {activeTab === 'performance' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-3">إعدادات الأداء</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حجم مخزن الفيديو (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxVideoBufferSize}
                  onChange={(e) => updateSetting('maxVideoBufferSize', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="10"
                  max="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مستوى الضغط (1-10)
                </label>
                <input
                  type="range"
                  value={settings.compressionLevel}
                  onChange={(e) => updateSetting('compressionLevel', parseInt(e.target.value))}
                  className="w-full"
                  min="1"
                  max="10"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>جودة عالية</span>
                  <span>{settings.compressionLevel}</span>
                  <span>حجم صغير</span>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableHardwareAcceleration"
                  checked={settings.enableHardwareAcceleration}
                  onChange={(e) => updateSetting('enableHardwareAcceleration', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableHardwareAcceleration" className="mr-2 text-sm text-gray-700">
                  تسريع الأجهزة
                </label>
              </div>
            </div>
          </div>
        )}

        {/* UI Settings */}
        {activeTab === 'ui' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-3">إعدادات الواجهة</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المظهر
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="light">فاتح</option>
                  <option value="dark">داكن</option>
                  <option value="auto">تلقائي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اللغة
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showAdvancedControls"
                  checked={settings.showAdvancedControls}
                  onChange={(e) => updateSetting('showAdvancedControls', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showAdvancedControls" className="mr-2 text-sm text-gray-700">
                  إظهار التحكم المتقدم
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableNotifications"
                  checked={settings.enableNotifications}
                  onChange={(e) => updateSetting('enableNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableNotifications" className="mr-2 text-sm text-gray-700">
                  تفعيل الإشعارات
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Storage Settings */}
        {activeTab === 'storage' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-3">إعدادات التخزين</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أقصى مساحة تخزين (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxStorageSize}
                  onChange={(e) => updateSetting('maxStorageSize', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="100"
                  max="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صيغة الضغط
                </label>
                <select
                  value={settings.compressionFormat}
                  onChange={(e) => updateSetting('compressionFormat', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="webm">WebM</option>
                  <option value="mp4">MP4</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoSaveRecordings"
                  checked={settings.autoSaveRecordings}
                  onChange={(e) => updateSetting('autoSaveRecordings', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoSaveRecordings" className="mr-2 text-sm text-gray-700">
                  حفظ التسجيلات تلقائياً
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {hasChanges && (
        <div className="border-t bg-yellow-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-yellow-800">
              <Settings className="h-4 w-4 ml-2" />
              يوجد تغييرات غير محفوظة
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => {
                  loadSettings();
                  setHasChanges(false);
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                إلغاء
              </button>
              <button
                onClick={saveSettings}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                حفظ الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;
