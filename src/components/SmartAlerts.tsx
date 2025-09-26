import React, { useState, useEffect, useRef } from 'react';
import { Bell, Volume2, VolumeX, Droplets, Sprout, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'irrigation' | 'fertilization' | 'weather' | 'pest' | 'harvest';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  isRead: boolean;
  actionRequired: boolean;
  cropName?: string;
  location?: string;
}

const SmartAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize with some sample alerts
    const initialAlerts: Alert[] = [
      {
        id: '1',
        type: 'irrigation',
        title: 'وقت الري - طماطم القطعة الشمالية',
        message: 'حان وقت ري محصول الطماطم. رطوبة التربة منخفضة (25%)',
        priority: 'high',
        timestamp: new Date(),
        isRead: false,
        actionRequired: true,
        cropName: 'طماطم القطعة الشمالية',
        location: 'القطعة الشمالية'
      },
      {
        id: '2',
        type: 'weather',
        title: 'تحذير من موجة حارة',
        message: 'درجات حرارة مرتفعة متوقعة غداً (38°م). يُنصح بالري المبكر',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        isRead: false,
        actionRequired: true
      },
      {
        id: '3',
        type: 'fertilization',
        title: 'موعد التسميد - قمح الحقل الجنوبي',
        message: 'حان موعد تسميد محصول القمح بالسماد المركب NPK',
        priority: 'medium',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        isRead: true,
        actionRequired: true,
        cropName: 'قمح الحقل الجنوبي',
        location: 'الحقل الجنوبي'
      }
    ];

    setAlerts(initialAlerts);

    // Simulate real-time alerts
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 30 seconds
        addNewAlert();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const addNewAlert = () => {
    const alertTypes = ['irrigation', 'weather', 'pest', 'harvest'] as const;
    const priorities = ['low', 'medium', 'high'] as const;
    
    const sampleAlerts = [
      {
        type: 'irrigation' as const,
        title: 'تذكير بالري',
        message: 'محصول الذرة يحتاج إلى ري خلال الساعتين القادمتين',
        priority: 'medium' as const
      },
      {
        type: 'pest' as const,
        title: 'تحذير من الآفات',
        message: 'تم رصد نشاط غير طبيعي للحشرات في القطعة الغربية',
        priority: 'high' as const
      },
      {
        type: 'harvest' as const,
        title: 'موسم الحصاد',
        message: 'محصول الطماطم جاهز للحصاد في القطعة الشمالية',
        priority: 'high' as const
      },
      {
        type: 'weather' as const,
        title: 'تغير في الطقس',
        message: 'رياح قوية متوقعة هذا المساء. تأكد من تثبيت المحاصيل',
        priority: 'medium' as const
      }
    ];

    const randomAlert = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
    
    const newAlert: Alert = {
      id: Date.now().toString(),
      ...randomAlert,
      timestamp: new Date(),
      isRead: false,
      actionRequired: randomAlert.priority === 'high'
    };

    setAlerts(prev => [newAlert, ...prev]);
    
    if (soundEnabled) {
      playNotificationSound(newAlert.priority);
    }
  };

  const playNotificationSound = (priority: string) => {
    // Create audio context for different notification sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (frequency: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    // Different sounds for different priorities
    switch (priority) {
      case 'critical':
        // Urgent beeping
        playTone(800, 0.2);
        setTimeout(() => playTone(800, 0.2), 300);
        setTimeout(() => playTone(800, 0.2), 600);
        break;
      case 'high':
        // Double beep
        playTone(600, 0.3);
        setTimeout(() => playTone(600, 0.3), 400);
        break;
      case 'medium':
        // Single beep
        playTone(500, 0.4);
        break;
      default:
        // Soft notification
        playTone(400, 0.3);
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'irrigation':
        return <Droplets className="h-5 w-5 text-blue-600" />;
      case 'fertilization':
        return <Sprout className="h-5 w-5 text-green-600" />;
      case 'weather':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'pest':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'harvest':
        return <CheckCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-r-red-600 bg-red-50';
      case 'high':
        return 'border-r-orange-500 bg-orange-50';
      case 'medium':
        return 'border-r-yellow-500 bg-yellow-50';
      default:
        return 'border-r-blue-500 bg-blue-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'حرج';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      default: return 'منخفض';
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.priority === 'critical' && !alert.isRead).length;

  return (
    <div className="relative" dir="rtl">
      {/* Notification Bell */}
      <div className="flex items-center space-x-4 space-x-reverse mb-6">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Bell className="h-6 w-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {criticalCount > 0 && (
            <span className="absolute -top-1 -left-1 bg-red-600 rounded-full h-3 w-3 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          {soundEnabled ? (
            <Volume2 className="h-6 w-6 text-gray-700" />
          ) : (
            <VolumeX className="h-6 w-6 text-gray-400" />
          )}
        </button>

        <div className="text-sm text-gray-600">
          {unreadCount > 0 ? (
            <span className="font-medium text-red-600">
              {unreadCount} تنبيه جديد
            </span>
          ) : (
            'لا توجد تنبيهات جديدة'
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute top-16 right-0 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">التنبيهات</h3>
              <div className="flex items-center space-x-2 space-x-reverse">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    قراءة الكل
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>لا توجد تنبيهات</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-r-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    getPriorityColor(alert.priority)
                  } ${!alert.isRead ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 space-x-reverse flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium ${
                            !alert.isRead ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {alert.title}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            alert.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            alert.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {getPriorityText(alert.priority)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {alert.actionRequired && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              يتطلب إجراء
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissAlert(alert.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded ml-2"
                    >
                      <X className="h-3 w-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Critical Alert Banner */}
      {criticalCount > 0 && (
        <div className="fixed top-4 left-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 ml-2" />
              <span className="font-bold">تنبيه حرج!</span>
            </div>
            <span className="text-sm">
              {criticalCount} تنبيه يتطلب اهتماماً فورياً
            </span>
          </div>
        </div>
      )}

      {/* Test Button for Demo */}
      <button
        onClick={addNewAlert}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        إضافة تنبيه تجريبي
      </button>
    </div>
  );
};

export default SmartAlerts;
