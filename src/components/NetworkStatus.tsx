import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Signal, Globe, Smartphone, Monitor } from 'lucide-react';

interface NetworkInfo {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  localIP: string;
  connectedDevices: number;
}

const NetworkStatus: React.FC = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    localIP: 'جاري الكشف...',
    connectedDevices: 0
  });

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    updateNetworkInfo();
    
    // مراقبة تغيرات الاتصال
    const handleOnline = () => updateNetworkInfo();
    const handleOffline = () => updateNetworkInfo();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // تحديث دوري كل 10 ثوانٍ
    const interval = setInterval(updateNetworkInfo, 10000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const updateNetworkInfo = async () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    const info: NetworkInfo = {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      localIP: await getLocalIP(),
      connectedDevices: await scanConnectedDevices()
    };
    
    setNetworkInfo(info);
  };

  const getLocalIP = async (): Promise<string> => {
    try {
      // محاولة الحصول على IP عبر WebRTC
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.createDataChannel('');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      return new Promise((resolve) => {
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
            if (match && !match[1].startsWith('127.')) {
              pc.close();
              resolve(match[1]);
            }
          }
        };
        
        setTimeout(() => {
          pc.close();
          resolve(window.location.hostname);
        }, 3000);
      });
    } catch (error) {
      return window.location.hostname;
    }
  };

  const scanConnectedDevices = async (): Promise<number> => {
    // محاكاة فحص الأجهزة المتصلة
    try {
      const baseIP = networkInfo.localIP.substring(0, networkInfo.localIP.lastIndexOf('.') + 1);
      let connectedCount = 0;
      
      // فحص سريع لبعض العناوين الشائعة
      const commonIPs = [1, 2, 100, 101, 102, 254];
      
      for (const ip of commonIPs) {
        try {
          const response = await fetch(`http://${baseIP}${ip}:80`, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: AbortSignal.timeout(1000)
          });
          connectedCount++;
        } catch {
          // تجاهل الأخطاء
        }
      }
      
      return Math.max(connectedCount, 1); // على الأقل هذا الجهاز
    } catch {
      return 1;
    }
  };

  const getConnectionQuality = () => {
    if (!networkInfo.isOnline) return { color: 'red', text: 'غير متصل', icon: WifiOff };
    
    const { effectiveType, downlink } = networkInfo;
    
    if (effectiveType === '4g' || downlink > 10) {
      return { color: 'green', text: 'ممتاز', icon: Wifi };
    } else if (effectiveType === '3g' || downlink > 1.5) {
      return { color: 'yellow', text: 'جيد', icon: Signal };
    } else {
      return { color: 'orange', text: 'ضعيف', icon: Signal };
    }
  };

  const quality = getConnectionQuality();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-3 space-x-reverse">
          <quality.icon className={`h-5 w-5 text-${quality.color}-600`} />
          <div>
            <h3 className="font-medium text-gray-900">حالة الشبكة</h3>
            <p className={`text-sm text-${quality.color}-600`}>{quality.text}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className={`w-3 h-3 rounded-full bg-${quality.color}-500 animate-pulse`}></div>
          <span className="text-xs text-gray-500">
            {showDetails ? 'إخفاء' : 'تفاصيل'}
          </span>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="border-t bg-gray-50 p-4 space-y-4">
          {/* Connection Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Globe className="h-4 w-4 text-blue-600 ml-2" />
                <span className="text-sm font-medium">معلومات الاتصال</span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>النوع:</span>
                  <span className="font-mono">{networkInfo.connectionType}</span>
                </div>
                <div className="flex justify-between">
                  <span>الجودة:</span>
                  <span className="font-mono">{networkInfo.effectiveType}</span>
                </div>
                <div className="flex justify-between">
                  <span>السرعة:</span>
                  <span className="font-mono">{networkInfo.downlink} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span>التأخير:</span>
                  <span className="font-mono">{networkInfo.rtt} ms</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Monitor className="h-4 w-4 text-green-600 ml-2" />
                <span className="text-sm font-medium">الشبكة المحلية</span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>IP المحلي:</span>
                  <span className="font-mono text-blue-600">{networkInfo.localIP}</span>
                </div>
                <div className="flex justify-between">
                  <span>المنفذ:</span>
                  <span className="font-mono">5173</span>
                </div>
                <div className="flex justify-between">
                  <span>الأجهزة:</span>
                  <span className="font-mono">{networkInfo.connectedDevices}</span>
                </div>
                <div className="flex justify-between">
                  <span>الحالة:</span>
                  <span className={`font-medium text-${quality.color}-600`}>
                    {networkInfo.isOnline ? 'متصل' : 'منقطع'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Connection Guide */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Smartphone className="h-4 w-4 text-blue-600 ml-2" />
              <span className="text-sm font-medium text-blue-900">ربط الهاتف المحمول</span>
            </div>
            <div className="text-xs text-blue-800 space-y-1">
              <p>• تأكد من اتصال الهاتف بنفس شبكة Wi-Fi</p>
              <p>• استخدم العنوان: <span className="font-mono bg-white px-1 rounded">http://{networkInfo.localIP}:5173</span></p>
              <p>• أو امسح QR Code من تبويب "كاميرا الجهاز"</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={() => navigator.clipboard.writeText(`http://${networkInfo.localIP}:5173`)}
              className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              نسخ الرابط
            </button>
            <button
              onClick={updateNetworkInfo}
              className="flex-1 bg-gray-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              تحديث المعلومات
            </button>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={`p-2 rounded-lg ${networkInfo.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="text-xs font-medium">الإنترنت</div>
              <div className="text-xs">{networkInfo.isOnline ? 'متصل' : 'منقطع'}</div>
            </div>
            <div className={`p-2 rounded-lg ${networkInfo.downlink > 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              <div className="text-xs font-medium">السرعة</div>
              <div className="text-xs">{networkInfo.downlink > 1 ? 'سريع' : 'بطيء'}</div>
            </div>
            <div className={`p-2 rounded-lg ${networkInfo.rtt < 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              <div className="text-xs font-medium">الاستجابة</div>
              <div className="text-xs">{networkInfo.rtt < 100 ? 'سريع' : 'بطيء'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;
