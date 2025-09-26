import React, { useState } from 'react';
import { AlertTriangle, X, ExternalLink, Database } from 'lucide-react';
import { auth, db } from '../lib/firebase';

const DemoModeNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const isDemoMode = !auth || !db;

  if (!isDemoMode || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg shadow-lg p-4" dir="rtl">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">
                🎭 الوضع التجريبي
              </h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p>
                  <strong>مرحباً!</strong> أنت تستخدم منصة ريّان في الوضع التجريبي. 
                  جميع الميزات تعمل ولكن البيانات تُحفظ محلياً فقط.
                </p>
                
                <div className="bg-white bg-opacity-50 rounded-lg p-3 my-3">
                  <div className="flex items-center mb-2">
                    <Database className="h-4 w-4 text-blue-600 ml-2" />
                    <span className="font-medium text-blue-800">بيانات الدخول التجريبية:</span>
                  </div>
                  <div className="text-xs font-mono bg-gray-100 rounded p-2">
                    <div>📧 البريد: <strong>demo@rayyan-farm.com</strong></div>
                    <div>🔑 كلمة المرور: <strong>demo123</strong></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="font-medium text-green-800 mb-1">✅ يعمل:</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• جميع الواجهات والميزات</li>
                      <li>• كاميرات الجهاز والهاتف</li>
                      <li>• أنظمة IoT المحاكاة</li>
                      <li>• التحليلات والإحصائيات</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-medium text-blue-800 mb-1">🔄 للتفعيل الكامل:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• إنشاء مشروع Firebase</li>
                      <li>• إعداد متغيرات البيئة</li>
                      <li>• حفظ البيانات في السحابة</li>
                      <li>• مزامنة بين الأجهزة</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-center mt-4 space-x-2 space-x-reverse">
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3 ml-1" />
                    إنشاء مشروع Firebase
                  </a>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/NETLIFY_DEPLOYMENT.md';
                      link.target = '_blank';
                      link.click();
                    }}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📚 دليل النشر
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoModeNotice;
