import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Eye, Sunrise, Sunset } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  sunrise: string;
  sunset: string;
}

interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  humidity: number;
  rainChance: number;
}

const WeatherMonitor: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData>({
    temperature: 28,
    humidity: 65,
    windSpeed: 12,
    pressure: 1013,
    visibility: 10,
    uvIndex: 7,
    condition: 'sunny',
    sunrise: '06:15',
    sunset: '18:45'
  });

  const [forecast, setForecast] = useState<WeatherForecast[]>([
    { day: 'اليوم', high: 32, low: 22, condition: 'sunny', humidity: 60, rainChance: 10 },
    { day: 'غداً', high: 30, low: 20, condition: 'cloudy', humidity: 70, rainChance: 30 },
    { day: 'بعد غد', high: 28, low: 18, condition: 'rainy', humidity: 85, rainChance: 80 },
    { day: 'الخميس', high: 31, low: 21, condition: 'sunny', humidity: 55, rainChance: 5 },
    { day: 'الجمعة', high: 33, low: 23, condition: 'windy', humidity: 50, rainChance: 15 }
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'موجة حارة متوقعة',
      message: 'درجات حرارة مرتفعة غداً. يُنصح بالري في الصباح الباكر',
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      title: 'أمطار خفيفة',
      message: 'أمطار خفيفة متوقعة يوم الأربعاء. يمكن تقليل الري',
      priority: 'medium'
    }
  ]);

  useEffect(() => {
    // Simulate real-time weather updates
    const interval = setInterval(() => {
      setCurrentWeather(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
        humidity: Math.max(30, Math.min(90, prev.humidity + (Math.random() - 0.5) * 10)),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 5),
        pressure: prev.pressure + (Math.random() - 0.5) * 5
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string, size: string = 'h-8 w-8') => {
    switch (condition) {
      case 'sunny':
        return <Sun className={`${size} text-yellow-500`} />;
      case 'cloudy':
        return <Cloud className={`${size} text-gray-500`} />;
      case 'rainy':
        return <CloudRain className={`${size} text-blue-500`} />;
      case 'windy':
        return <Wind className={`${size} text-gray-600`} />;
      default:
        return <Sun className={`${size} text-yellow-500`} />;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'مشمس';
      case 'cloudy': return 'غائم جزئياً';
      case 'rainy': return 'ممطر';
      case 'windy': return 'عاصف';
      default: return 'مشمس';
    }
  };

  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'منخفض', color: 'text-green-600' };
    if (uvIndex <= 5) return { level: 'متوسط', color: 'text-yellow-600' };
    if (uvIndex <= 7) return { level: 'عالي', color: 'text-orange-600' };
    return { level: 'خطر', color: 'text-red-600' };
  };

  const getIrrigationRecommendation = () => {
    const temp = currentWeather.temperature;
    const humidity = currentWeather.humidity;
    const wind = currentWeather.windSpeed;

    if (temp > 35 || humidity < 40) {
      return {
        recommendation: 'ري إضافي مطلوب',
        reason: 'درجة حرارة عالية أو رطوبة منخفضة',
        color: 'bg-red-50 border-red-200 text-red-800'
      };
    } else if (temp > 30 || wind > 20) {
      return {
        recommendation: 'ري معتدل',
        reason: 'ظروف جوية معتدلة',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
      };
    } else {
      return {
        recommendation: 'ري طبيعي',
        reason: 'ظروف جوية مثالية',
        color: 'bg-green-50 border-green-200 text-green-800'
      };
    }
  };

  const irrigationRec = getIrrigationRecommendation();
  const uvLevel = getUVLevel(currentWeather.uvIndex);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Current Weather */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">الطقس الحالي</h2>
          <div className="text-sm text-gray-600">
            آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Main Weather */}
          <div className="bg-white rounded-lg p-4 text-center">
            {getWeatherIcon(currentWeather.condition, 'h-12 w-12')}
            <div className="mt-2">
              <div className="text-3xl font-bold text-gray-900">
                {currentWeather.temperature.toFixed(1)}°
              </div>
              <div className="text-sm text-gray-600">
                {getConditionText(currentWeather.condition)}
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="h-6 w-6 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">
                {currentWeather.humidity.toFixed(0)}%
              </span>
            </div>
            <div className="text-sm text-gray-600">الرطوبة</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentWeather.humidity}%` }}
              ></div>
            </div>
          </div>

          {/* Wind */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Wind className="h-6 w-6 text-gray-500" />
              <span className="text-2xl font-bold text-gray-900">
                {currentWeather.windSpeed.toFixed(0)}
              </span>
            </div>
            <div className="text-sm text-gray-600">سرعة الرياح (كم/س)</div>
          </div>

          {/* UV Index */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Sun className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">
                {currentWeather.uvIndex}
              </span>
            </div>
            <div className="text-sm text-gray-600">مؤشر الأشعة فوق البنفسجية</div>
            <div className={`text-xs font-medium mt-1 ${uvLevel.color}`}>
              {uvLevel.level}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900">
              {currentWeather.pressure.toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">الضغط الجوي (هكتوباسكال)</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900">
              {currentWeather.visibility}
            </div>
            <div className="text-xs text-gray-600">الرؤية (كم)</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <Sunrise className="h-4 w-4 text-orange-500 mx-auto mb-1" />
            <div className="text-sm font-bold text-gray-900">
              {currentWeather.sunrise}
            </div>
            <div className="text-xs text-gray-600">شروق الشمس</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <Sunset className="h-4 w-4 text-orange-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-gray-900">
              {currentWeather.sunset}
            </div>
            <div className="text-xs text-gray-600">غروب الشمس</div>
          </div>
        </div>
      </div>

      {/* Irrigation Recommendation */}
      <div className={`rounded-lg p-4 border ${irrigationRec.color}`}>
        <div className="flex items-center">
          <Droplets className="h-5 w-5 ml-2" />
          <div>
            <div className="font-bold">{irrigationRec.recommendation}</div>
            <div className="text-sm">{irrigationRec.reason}</div>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">تنبيهات جوية</h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-r-4 ${
                  alert.priority === 'high'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="font-bold text-gray-900">{alert.title}</div>
                <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5-Day Forecast */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">توقعات الطقس لـ 5 أيام</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="font-bold text-gray-900 mb-2">{day.day}</div>
              {getWeatherIcon(day.condition, 'h-8 w-8')}
              <div className="mt-2">
                <div className="text-lg font-bold text-gray-900">
                  {day.high}° / {day.low}°
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  رطوبة {day.humidity}%
                </div>
                <div className="text-xs text-blue-600">
                  أمطار {day.rainChance}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherMonitor;
