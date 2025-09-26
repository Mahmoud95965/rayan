import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cropTypesData, weatherAlertsData } from '../lib/firebase';
import { Plus, Sprout, Droplets, MapPin, TrendingUp, AlertTriangle, Cloud, Thermometer, Eye, CreditCard as Edit, Trash2, Wifi, Settings, Calculator } from 'lucide-react';
import { Crop, CropType, WeatherAlert, Notification } from '../types';
import FarmMap from './FarmMap';
import WeatherMonitor from './WeatherMonitor';
import SmartAlerts from './SmartAlerts';
import VirtualCamera from './VirtualCamera';
import AdvancedAnalytics from './AdvancedAnalytics';
import CostCalculator from './CostCalculator';
import IoTDashboard from './IoTDashboard';
import RealCameraControl from './RealCameraControl';
import IrrigationControl from './IrrigationControl';
import LocalCameraControl from './LocalCameraControl';
import DemoModeNotice from './DemoModeNotice';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [weatherAlerts] = useState<WeatherAlert[]>(weatherAlertsData);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'weather' | 'camera' | 'analytics' | 'calculator' | 'iot' | 'realcamera' | 'irrigation' | 'localcamera'>('overview');

  const [newCrop, setNewCrop] = useState({
    name: '',
    crop_type: '',
    planting_date: '',
    area_size: '',
    location: ''
  });

  useEffect(() => {
    // Load crops from localStorage for MVP
    const savedCrops = localStorage.getItem(`crops_${userProfile?.id}`);
    if (savedCrops) {
      setCrops(JSON.parse(savedCrops));
    }

    // Generate sample notifications
    generateNotifications();
  }, [userProfile]);

  const generateNotifications = () => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        farmer_id: userProfile?.id || '',
        title: 'وقت الري',
        message: 'حان وقت ري محصول الطماطم في القطعة الشمالية',
        type: 'irrigation',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        farmer_id: userProfile?.id || '',
        title: 'تنبيه مناخي',
        message: 'درجات حرارة مرتفعة متوقعة غداً. ينصح بالري في الصباح الباكر',
        type: 'weather',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    setNotifications(sampleNotifications);
  };

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cropType = cropTypesData.find(ct => ct.name === newCrop.crop_type);
    if (!cropType) return;

    const plantingDate = new Date(newCrop.planting_date);
    const nextIrrigation = new Date(plantingDate);
    nextIrrigation.setDate(nextIrrigation.getDate() + cropType.irrigation_frequency_days);
    
    const nextFertilization = new Date(plantingDate);
    nextFertilization.setDate(nextFertilization.getDate() + cropType.fertilization_frequency_days);

    const crop: Crop = {
      id: Date.now().toString(),
      farmer_id: userProfile?.id || '',
      name: newCrop.name,
      crop_type: newCrop.crop_type,
      planting_date: newCrop.planting_date,
      area_size: Number(newCrop.area_size),
      location: newCrop.location,
      status: 'planted',
      irrigation_schedule: {
        frequency_days: cropType.irrigation_frequency_days,
        amount_per_session: `${Math.round(Number(newCrop.area_size) * 50)} لتر`,
        time_of_day: 'الفجر والمغرب',
        next_irrigation: nextIrrigation.toISOString().split('T')[0]
      },
      fertilization_schedule: {
        frequency_days: cropType.fertilization_frequency_days,
        fertilizer_type: cropType.fertilizer_requirements,
        amount_per_area: `${Math.round(Number(newCrop.area_size) * 10)} كجم`,
        next_fertilization: nextFertilization.toISOString().split('T')[0]
      },
      created_at: new Date().toISOString()
    };

    const updatedCrops = [...crops, crop];
    setCrops(updatedCrops);
    localStorage.setItem(`crops_${userProfile?.id}`, JSON.stringify(updatedCrops));
    
    setNewCrop({
      name: '',
      crop_type: '',
      planting_date: '',
      area_size: '',
      location: ''
    });
    setShowAddCrop(false);
  };

  const deleteCrop = (cropId: string) => {
    const updatedCrops = crops.filter(crop => crop.id !== cropId);
    setCrops(updatedCrops);
    localStorage.setItem(`crops_${userProfile?.id}`, JSON.stringify(updatedCrops));
  };

  const getCropTypeInfo = (cropTypeName: string): CropType | undefined => {
    return cropTypesData.find(ct => ct.name === cropTypeName);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <DemoModeNotice />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                مرحباً، {userProfile?.name || userProfile?.displayName}
              </h1>
              <p className="text-gray-600">لوحة تحكم مزرعتك الذكية</p>
            </div>
            <SmartAlerts />
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 space-x-reverse bg-white p-1 rounded-lg shadow-sm overflow-x-auto">
            {[
              { key: 'overview', label: 'نظرة عامة', icon: Sprout },
              { key: 'map', label: 'خريطة المزرعة', icon: MapPin },
              { key: 'weather', label: 'الطقس', icon: Cloud },
              { key: 'camera', label: 'المراقبة', icon: Eye },
              { key: 'analytics', label: 'التحليلات', icon: TrendingUp },
              { key: 'calculator', label: 'الحاسبة', icon: Calculator },
              { key: 'iot', label: 'أجهزة IoT', icon: Wifi },
              { key: 'realcamera', label: 'كاميرات حقيقية', icon: Thermometer },
              { key: 'irrigation', label: 'التحكم في الري', icon: Droplets },
              { key: 'localcamera', label: 'كاميرا الجهاز', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4 ml-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-green-600 ml-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المحاصيل</p>
                <p className="text-2xl font-bold text-gray-900">{crops.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600 ml-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المساحة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {crops.reduce((total, crop) => total + crop.area_size, 0).toFixed(1)} فدان
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <Droplets className="h-8 w-8 text-cyan-600 ml-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">محاصيل تحتاج ري</p>
                <p className="text-2xl font-bold text-gray-900">
                  {crops.filter(crop => {
                    const nextIrrigation = new Date(crop.irrigation_schedule?.next_irrigation || '');
                    const today = new Date();
                    return nextIrrigation <= today;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600 ml-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">الإشعارات الجديدة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => !n.is_read).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Alerts */}
        {weatherAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Cloud className="h-6 w-6 ml-2" />
              التنبيهات المناخية
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {weatherAlerts.map((alert) => (
                <div key={alert.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg ml-3 ${
                      alert.severity === 'high' ? 'bg-red-100' :
                      alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {alert.type === 'temperature' ? (
                        <Thermometer className={`h-5 w-5 ${
                          alert.severity === 'high' ? 'text-red-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      ) : (
                        <Cloud className={`h-5 w-5 ${
                          alert.severity === 'high' ? 'text-red-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(alert.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 ml-2" />
              الإشعارات والتذكيرات
            </h2>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className={`bg-white rounded-xl shadow-sm p-4 border border-gray-100 ${
                  !notification.is_read ? 'border-l-4 border-l-green-500' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ml-3 ${
                        notification.type === 'irrigation' ? 'bg-blue-100' :
                        notification.type === 'weather' ? 'bg-orange-100' : 'bg-green-100'
                      }`}>
                        {notification.type === 'irrigation' ? (
                          <Droplets className="h-4 w-4 text-blue-600" />
                        ) : notification.type === 'weather' ? (
                          <Cloud className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Sprout className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Crops Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">محاصيلك</h2>
                <button
                  onClick={() => setShowAddCrop(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="h-5 w-5 ml-2" />
                  إضافة محصول جديد
                </button>
              </div>

              {crops.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد محاصيل مسجلة</h3>
                  <p className="text-gray-600">ابدأ بإضافة أول محصول في مزرعتك</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {crops.map((crop) => {
                    const cropType = getCropTypeInfo(crop.crop_type);
                    return (
                      <div key={crop.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => deleteCrop(crop.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">نوع المحصول</span>
                              <span className="text-sm font-medium">{cropType?.name_ar}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">المساحة</span>
                              <span className="text-sm font-medium">{crop.area_size} فدان</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">تاريخ الزراعة</span>
                              <span className="text-sm font-medium">{formatDate(crop.planting_date)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">الري القادم</span>
                              <span className="text-sm font-medium text-blue-600">
                                {formatDate(crop.irrigation_schedule?.next_irrigation || '')}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">التسميد القادم</span>
                              <span className="text-sm font-medium text-green-600">
                                {formatDate(crop.fertilization_schedule?.next_fertilization || '')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>الموقع: {crop.location}</span>
                              <span className={`px-2 py-1 rounded-full ${
                                crop.status === 'planted' ? 'bg-green-100 text-green-700' :
                                crop.status === 'growing' ? 'bg-yellow-100 text-yellow-700' :
                                crop.status === 'harvesting' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {crop.status === 'planted' ? 'مزروع' :
                                 crop.status === 'growing' ? 'في النمو' :
                                 crop.status === 'harvesting' ? 'جاهز للحصاد' : 'محصود'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'map' && <FarmMap />}
        {activeTab === 'weather' && <WeatherMonitor />}
        {activeTab === 'camera' && <VirtualCamera />}
        {activeTab === 'analytics' && <AdvancedAnalytics />}
        {activeTab === 'calculator' && <CostCalculator />}
        {activeTab === 'iot' && <IoTDashboard />}
        {activeTab === 'realcamera' && <RealCameraControl />}
        {activeTab === 'irrigation' && <IrrigationControl />}
        {activeTab === 'localcamera' && <LocalCameraControl />}

        {/* Add Crop Modal */}
        {showAddCrop && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">إضافة محصول جديد</h2>
              
              <form onSubmit={handleAddCrop} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المحصول
                  </label>
                  <input
                    type="text"
                    required
                    value={newCrop.name}
                    onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="مثال: طماطم القطعة الشمالية"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع المحصول
                  </label>
                  <select
                    required
                    value={newCrop.crop_type}
                    onChange={(e) => setNewCrop({...newCrop, crop_type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">اختر نوع المحصول</option>
                    {cropTypesData.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.name_ar} - {type.season}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الزراعة
                  </label>
                  <input
                    type="date"
                    required
                    value={newCrop.planting_date}
                    onChange={(e) => setNewCrop({...newCrop, planting_date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المساحة (فدان)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={newCrop.area_size}
                    onChange={(e) => setNewCrop({...newCrop, area_size: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="مثال: 2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموقع في المزرعة
                  </label>
                  <input
                    type="text"
                    required
                    value={newCrop.location}
                    onChange={(e) => setNewCrop({...newCrop, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="مثال: القطعة الشمالية"
                  />
                </div>

                <div className="flex space-x-4 space-x-reverse pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    إضافة المحصول
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCrop(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;