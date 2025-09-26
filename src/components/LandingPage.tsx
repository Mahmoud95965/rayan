import React from 'react';
import { 
  Sprout, 
  Cloud, 
  Droplets, 
  TrendingUp, 
  Users, 
  MapPin,
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-bl from-green-600 via-green-700 to-emerald-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <Sprout className="h-16 w-16 text-green-200" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              منصة ريّان
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-green-100">
              المنصة الزراعية الذكية لمزارعي صعيد مصر
            </p>
            <p className="text-lg mb-8 text-green-200 max-w-2xl mx-auto">
              نساعدك في إدارة مزرعتك بذكاء مع توصيات الري والتسميد والتنبيهات المناخية
            </p>
            <button
              onClick={onGetStarted}
              className="bg-white text-green-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-green-50 transition-colors shadow-lg flex items-center mx-auto"
            >
              ابدأ رحلتك الزراعية الذكية
              <ArrowLeft className="mr-3 h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Cloud className="h-12 w-12 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <Droplets className="h-10 w-10 text-white animate-bounce" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              لماذا تختار منصة ريّان؟
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              نقدم حلول ذكية مصممة خصيصاً لاحتياجات المزارعين في صعيد مصر
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-blue-100 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                جداول ري ذكية
              </h3>
              <p className="text-gray-600">
                احصل على جداول ري مخصصة لكل محصول بناءً على احتياجاته المائية وظروف المنطقة
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-green-100 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                توصيات التسميد
              </h3>
              <p className="text-gray-600">
                برامج تسميد علمية ومدروسة لضمان أفضل إنتاجية وجودة لمحاصيلك
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-orange-100 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <Cloud className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                التنبيهات المناخية
              </h3>
              <p className="text-gray-600">
                تلقى تنبيهات فورية عن التغيرات المناخية وتأثيرها على محاصيلك
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-purple-100 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                مجتمع المزارعين
              </h3>
              <p className="text-gray-600">
                انضم لمجتمع من المزارعين وشارك خبراتك واستفد من تجارب الآخرين
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-red-100 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                مخصص لصعيد مصر
              </h3>
              <p className="text-gray-600">
                حلول مصممة خصيصاً لظروف ومناخ وتربة محافظات صعيد مصر
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-teal-100 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <Sprout className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                سهل الاستخدام
              </h3>
              <p className="text-gray-600">
                واجهة بسيطة ومفهومة باللغة العربية مصممة خصيصاً للمزارعين
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              كيف تعمل منصة ريّان؟
            </h2>
            <p className="text-lg text-gray-600">
              ثلاث خطوات بسيطة لبداية رحلتك مع الزراعة الذكية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                سجل حسابك
              </h3>
              <p className="text-gray-600">
                أنشئ حساباً جديداً وأدخل بيانات مزرعتك الأساسية
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                أضف محاصيلك
              </h3>
              <p className="text-gray-600">
                سجل محاصيلك مع تواريخ الزراعة ومساحة كل محصول
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                تلقى التوصيات
              </h3>
              <p className="text-gray-600">
                احصل على توصيات ذكية للري والتسميد والتنبيهات المناخية
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                فوائد الانضمام لمنصة ريّان
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 ml-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">توفير في المياه</h3>
                    <p className="text-gray-600">استهلك المياه بطريقة أكثر كفاءة وتوفير</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 ml-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">زيادة الإنتاجية</h3>
                    <p className="text-gray-600">احصل على محاصيل أكثر وجودة أفضل</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 ml-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">تقليل التكاليف</h3>
                    <p className="text-gray-600">قلل تكاليف الري والأسمدة بالاستخدام الأمثل</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 ml-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">سهولة الإدارة</h3>
                    <p className="text-gray-600">راقب جميع محاصيلك من مكان واحد</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 ml-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">دعم مستمر</h3>
                    <p className="text-gray-600">فريق دعم مختص لمساعدتك في أي وقت</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                ابدأ اليوم مجاناً
              </h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">مجاني</div>
                <p className="text-gray-600">النسخة التجريبية</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                  <span className="text-gray-700">إدارة محاصيل غير محدودة</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                  <span className="text-gray-700">جداول ري وتسميد</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                  <span className="text-gray-700">التنبيهات المناخية</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                  <span className="text-gray-700">دعم فني</span>
                </div>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
              >
                سجل الآن مجاناً
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            جاهز لتحويل مزرعتك إلى مزرعة ذكية؟
          </h2>
          <p className="text-xl mb-8 text-green-100">
            انضم إلى مئات المزارعين الذين يستخدمون ريّان لإدارة مزارعهم بذكاء
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-green-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-green-50 transition-colors shadow-lg"
          >
            ابدأ رحلتك الآن
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <Sprout className="h-8 w-8 text-green-400 ml-2" />
                <h3 className="text-2xl font-bold">منصة ريّان</h3>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                منصة زراعية ذكية مصممة خصيصاً لمزارعي صعيد مصر لمساعدتهم في إدارة مزارعهم بكفاءة أكبر
              </p>
              <div className="flex space-x-4 space-x-reverse">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Phone className="h-5 w-5 text-green-400" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-green-400" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Globe className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">خدماتنا</h4>
              <ul className="space-y-2 text-gray-300">
                <li>إدارة المحاصيل</li>
                <li>جداول الري</li>
                <li>توصيات التسميد</li>
                <li>التنبيهات المناخية</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">المحافظات المدعومة</h4>
              <ul className="space-y-2 text-gray-300">
                <li>أسوان</li>
                <li>الأقصر</li>
                <li>قنا</li>
                <li>سوهاج</li>
                <li>أسيوط</li>
                <li>المنيا</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 منصة ريّان. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;