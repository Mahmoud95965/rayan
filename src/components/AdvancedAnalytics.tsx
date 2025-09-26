import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Droplets, Calendar, PieChart, Activity } from 'lucide-react';

interface AnalyticsData {
  waterUsage: { month: string; amount: number; cost: number }[];
  cropYield: { crop: string; yield: number; target: number; efficiency: number }[];
  monthlyProfit: { month: string; income: number; expenses: number; profit: number }[];
  soilHealth: { parameter: string; value: number; optimal: number; status: 'good' | 'warning' | 'critical' }[];
  weatherImpact: { date: string; temperature: number; humidity: number; yield_impact: number }[];
}

const AdvancedAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'water' | 'yield' | 'finance' | 'soil'>('overview');
  
  const [analyticsData] = useState<AnalyticsData>({
    waterUsage: [
      { month: 'يناير', amount: 1200, cost: 480 },
      { month: 'فبراير', amount: 1100, cost: 440 },
      { month: 'مارس', amount: 1400, cost: 560 },
      { month: 'أبريل', amount: 1600, cost: 640 },
      { month: 'مايو', amount: 1800, cost: 720 },
      { month: 'يونيو', amount: 2200, cost: 880 }
    ],
    cropYield: [
      { crop: 'طماطم', yield: 85, target: 100, efficiency: 85 },
      { crop: 'قمح', yield: 92, target: 90, efficiency: 102 },
      { crop: 'ذرة', yield: 78, target: 85, efficiency: 92 },
      { crop: 'قطن', yield: 88, target: 95, efficiency: 93 }
    ],
    monthlyProfit: [
      { month: 'يناير', income: 15000, expenses: 8000, profit: 7000 },
      { month: 'فبراير', income: 12000, expenses: 7500, profit: 4500 },
      { month: 'مارس', income: 18000, expenses: 9000, profit: 9000 },
      { month: 'أبريل', income: 22000, expenses: 11000, profit: 11000 },
      { month: 'مايو', income: 25000, expenses: 12000, profit: 13000 },
      { month: 'يونيو', income: 28000, expenses: 13500, profit: 14500 }
    ],
    soilHealth: [
      { parameter: 'الحموضة (pH)', value: 6.8, optimal: 7.0, status: 'good' },
      { parameter: 'النيتروجين', value: 45, optimal: 50, status: 'warning' },
      { parameter: 'الفوسفور', value: 38, optimal: 40, status: 'good' },
      { parameter: 'البوتاسيوم', value: 25, optimal: 35, status: 'critical' },
      { parameter: 'المادة العضوية', value: 3.2, optimal: 4.0, status: 'warning' }
    ],
    weatherImpact: [
      { date: '2024-01', temperature: 22, humidity: 65, yield_impact: 95 },
      { date: '2024-02', temperature: 25, humidity: 60, yield_impact: 98 },
      { date: '2024-03', temperature: 28, humidity: 55, yield_impact: 92 },
      { date: '2024-04', temperature: 32, humidity: 50, yield_impact: 88 },
      { date: '2024-05', temperature: 35, humidity: 45, yield_impact: 82 },
      { date: '2024-06', temperature: 38, humidity: 40, yield_impact: 75 }
    ]
  });

  const renderBarChart = (data: any[], xKey: string, yKey: string, color: string, height: number = 200) => {
    const maxValue = Math.max(...data.map(item => item[yKey]));
    
    return (
      <div className="flex items-end justify-between h-48 p-4 bg-gray-50 rounded-lg">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 mx-1">
            <div
              className={`w-full ${color} rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer relative group`}
              style={{ height: `${(item[yKey] / maxValue) * height}px` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {item[yKey].toLocaleString()}
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2 text-center">
              {item[xKey]}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLineChart = (data: any[], xKey: string, yKey: string, color: string) => {
    const maxValue = Math.max(...data.map(item => item[yKey]));
    const minValue = Math.min(...data.map(item => item[yKey]));
    const range = maxValue - minValue;
    
    return (
      <div className="relative h-48 p-4 bg-gray-50 rounded-lg">
        <svg width="100%" height="100%" className="overflow-visible">
          <polyline
            points={data.map((item, index) => 
              `${(index / (data.length - 1)) * 100}%,${100 - ((item[yKey] - minValue) / range) * 80}%`
            ).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="3"
            className="drop-shadow-sm"
          />
          {data.map((item, index) => (
            <circle
              key={index}
              cx={`${(index / (data.length - 1)) * 100}%`}
              cy={`${100 - ((item[yKey] - minValue) / range) * 80}%`}
              r="4"
              fill={color}
              className="cursor-pointer hover:r-6 transition-all"
            />
          ))}
        </svg>
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <div key={index} className="text-xs text-gray-600">
              {item[xKey]}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = (data: any[], labelKey: string, valueKey: string) => {
    const total = data.reduce((sum, item) => sum + item[valueKey], 0);
    let currentAngle = 0;
    const colors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
    
    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item[valueKey] / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 cursor-pointer transition-opacity"
                />
              );
            })}
          </svg>
        </div>
        <div className="mr-6 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full ml-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-gray-700">
                {item[labelKey]}: {item[valueKey]}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const calculateTotalProfit = () => {
    return analyticsData.monthlyProfit.reduce((sum, month) => sum + month.profit, 0);
  };

  const calculateWaterEfficiency = () => {
    const totalWater = analyticsData.waterUsage.reduce((sum, month) => sum + month.amount, 0);
    const avgYield = analyticsData.cropYield.reduce((sum, crop) => sum + crop.efficiency, 0) / analyticsData.cropYield.length;
    return (avgYield / (totalWater / 1000)).toFixed(2);
  };

  const getHealthStatus = (status: string) => {
    switch (status) {
      case 'good': return { color: 'text-green-600', bg: 'bg-green-100', text: 'جيد' };
      case 'warning': return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'تحذير' };
      case 'critical': return { color: 'text-red-600', bg: 'bg-red-100', text: 'حرج' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'غير محدد' };
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-6 w-6 ml-2 text-blue-600" />
          التحليلات المتقدمة
        </h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period === 'week' ? 'أسبوعي' : period === 'month' ? 'شهري' : 'سنوي'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">إجمالي الربح</p>
              <p className="text-2xl font-bold text-green-900">
                {calculateTotalProfit().toLocaleString()} ج.م
              </p>
              <p className="text-xs text-green-600 mt-1">+12% عن الشهر الماضي</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">كفاءة المياه</p>
              <p className="text-2xl font-bold text-blue-900">
                {calculateWaterEfficiency()}
              </p>
              <p className="text-xs text-blue-600 mt-1">كجم/متر مكعب</p>
            </div>
            <Droplets className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">متوسط الإنتاجية</p>
              <p className="text-2xl font-bold text-yellow-900">
                {(analyticsData.cropYield.reduce((sum, crop) => sum + crop.efficiency, 0) / analyticsData.cropYield.length).toFixed(0)}%
              </p>
              <p className="text-xs text-yellow-600 mt-1">من الهدف المحدد</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">صحة التربة</p>
              <p className="text-2xl font-bold text-purple-900">
                {analyticsData.soilHealth.filter(s => s.status === 'good').length}/{analyticsData.soilHealth.length}
              </p>
              <p className="text-xs text-purple-600 mt-1">معايير جيدة</p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 space-x-reverse bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'نظرة عامة', icon: BarChart3 },
          { key: 'water', label: 'استهلاك المياه', icon: Droplets },
          { key: 'yield', label: 'الإنتاجية', icon: TrendingUp },
          { key: 'finance', label: 'المالية', icon: DollarSign },
          { key: 'soil', label: 'التربة', icon: Activity }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4 ml-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'overview' && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">الربح الشهري</h3>
              {renderBarChart(analyticsData.monthlyProfit, 'month', 'profit', 'bg-green-500')}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع الإنتاجية</h3>
              {renderPieChart(analyticsData.cropYield, 'crop', 'efficiency')}
            </div>
          </>
        )}

        {activeTab === 'water' && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">استهلاك المياه الشهري</h3>
              {renderBarChart(analyticsData.waterUsage, 'month', 'amount', 'bg-blue-500')}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">تكلفة المياه</h3>
              {renderLineChart(analyticsData.waterUsage, 'month', 'cost', '#3b82f6')}
            </div>
          </>
        )}

        {activeTab === 'yield' && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">إنتاجية المحاصيل</h3>
              <div className="space-y-4">
                {analyticsData.cropYield.map((crop, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{crop.crop}</span>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            crop.efficiency >= 100 ? 'bg-green-500' :
                            crop.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(crop.efficiency, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {crop.efficiency}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">تأثير الطقس على الإنتاجية</h3>
              {renderLineChart(analyticsData.weatherImpact, 'date', 'yield_impact', '#f59e0b')}
            </div>
          </>
        )}

        {activeTab === 'finance' && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">الإيرادات والمصروفات</h3>
              <div className="space-y-4">
                {analyticsData.monthlyProfit.map((month, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{month.month}</span>
                      <span className={`font-bold ${
                        month.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {month.profit.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>إيرادات: {month.income.toLocaleString()}</span>
                      <span>مصروفات: {month.expenses.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">اتجاه الربحية</h3>
              {renderLineChart(analyticsData.monthlyProfit, 'month', 'profit', '#10b981')}
            </div>
          </>
        )}

        {activeTab === 'soil' && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">تحليل التربة</h3>
              <div className="space-y-4">
                {analyticsData.soilHealth.map((param, index) => {
                  const status = getHealthStatus(param.status);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{param.parameter}</span>
                        <div className="text-sm text-gray-600">
                          القيمة: {param.value} | المثلى: {param.optimal}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">توصيات التحسين</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium text-yellow-800">زيادة النيتروجين</div>
                  <div className="text-sm text-yellow-700">أضف 10 كجم يوريا لكل فدان</div>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-800">نقص البوتاسيوم</div>
                  <div className="text-sm text-red-700">استخدم سماد البوتاسيوم فوراً</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-800">تحسين المادة العضوية</div>
                  <div className="text-sm text-blue-700">أضف كومبوست أو سماد عضوي</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
