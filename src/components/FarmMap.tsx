import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Crop } from '../types';
import { MapPin, Droplets, Sprout, Sun, CloudRain, Thermometer } from 'lucide-react';

interface FarmSection {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  crop?: Crop;
  soilMoisture: number;
  temperature: number;
  sunlight: number;
}

const FarmMap: React.FC = () => {
  const { userProfile } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedSection, setSelectedSection] = useState<FarmSection | null>(null);
  const [farmSections, setFarmSections] = useState<FarmSection[]>([]);

  useEffect(() => {
    // Load crops from localStorage
    const savedCrops = localStorage.getItem(`crops_${userProfile?.uid}`);
    if (savedCrops) {
      setCrops(JSON.parse(savedCrops));
    }

    // Initialize farm sections
    initializeFarmSections();
  }, [userProfile]);

  const initializeFarmSections = () => {
    const sections: FarmSection[] = [
      {
        id: '1',
        x: 50,
        y: 50,
        width: 150,
        height: 100,
        soilMoisture: Math.random() * 100,
        temperature: 25 + Math.random() * 10,
        sunlight: 70 + Math.random() * 30
      },
      {
        id: '2',
        x: 220,
        y: 50,
        width: 150,
        height: 100,
        soilMoisture: Math.random() * 100,
        temperature: 25 + Math.random() * 10,
        sunlight: 70 + Math.random() * 30
      },
      {
        id: '3',
        x: 50,
        y: 170,
        width: 150,
        height: 100,
        soilMoisture: Math.random() * 100,
        temperature: 25 + Math.random() * 10,
        sunlight: 70 + Math.random() * 30
      },
      {
        id: '4',
        x: 220,
        y: 170,
        width: 150,
        height: 100,
        soilMoisture: Math.random() * 100,
        temperature: 25 + Math.random() * 10,
        sunlight: 70 + Math.random() * 30
      },
      {
        id: '5',
        x: 390,
        y: 50,
        width: 150,
        height: 220,
        soilMoisture: Math.random() * 100,
        temperature: 25 + Math.random() * 10,
        sunlight: 70 + Math.random() * 30
      }
    ];

    // Assign crops to sections
    const sectionsWithCrops = sections.map((section, index) => ({
      ...section,
      crop: crops[index] || undefined
    }));

    setFarmSections(sectionsWithCrops);
  };

  useEffect(() => {
    initializeFarmSections();
  }, [crops]);

  const getSectionColor = (section: FarmSection) => {
    if (!section.crop) return '#e5e7eb'; // Gray for empty
    
    const cropColors: { [key: string]: string } = {
      'tomato': '#ef4444', // Red
      'wheat': '#f59e0b', // Amber
      'corn': '#eab308', // Yellow
      'cotton': '#f3f4f6', // Light gray
      'rice': '#10b981' // Green
    };

    return cropColors[section.crop.crop_type] || '#6b7280';
  };

  const getSectionStatus = (section: FarmSection) => {
    if (!section.crop) return 'فارغ';
    
    const plantingDate = new Date(section.crop.planting_date);
    const today = new Date();
    const daysSincePlanting = Math.floor((today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSincePlanting < 30) return 'نمو مبكر';
    if (daysSincePlanting < 60) return 'نمو متوسط';
    if (daysSincePlanting < 90) return 'نمو متقدم';
    return 'جاهز للحصاد';
  };

  const needsWater = (section: FarmSection) => {
    return section.soilMoisture < 30;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <MapPin className="h-6 w-6 ml-2 text-green-600" />
          خريطة المزرعة التفاعلية
        </h2>
        <div className="flex items-center space-x-4 space-x-reverse text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full ml-2"></div>
            <span>صحي</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full ml-2"></div>
            <span>يحتاج عناية</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full ml-2"></div>
            <span>يحتاج ري</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Map */}
        <div className="lg:col-span-2">
          <div className="relative bg-gradient-to-b from-green-100 to-green-200 rounded-lg p-4" style={{ height: '400px' }}>
            <svg width="100%" height="100%" viewBox="0 0 600 320">
              {/* Farm boundary */}
              <rect
                x="20"
                y="20"
                width="560"
                height="280"
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeDasharray="10,5"
                rx="10"
              />
              
              {/* Farm sections */}
              {farmSections.map((section) => (
                <g key={section.id}>
                  <rect
                    x={section.x}
                    y={section.y}
                    width={section.width}
                    height={section.height}
                    fill={getSectionColor(section)}
                    stroke={needsWater(section) ? '#ef4444' : '#059669'}
                    strokeWidth={needsWater(section) ? '3' : '2'}
                    rx="8"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedSection(section)}
                  />
                  
                  {/* Section label */}
                  <text
                    x={section.x + section.width / 2}
                    y={section.y + section.height / 2 - 10}
                    textAnchor="middle"
                    className="fill-white text-sm font-bold"
                    style={{ fontSize: '12px' }}
                  >
                    {section.crop ? section.crop.name : `قطعة ${section.id}`}
                  </text>
                  
                  {/* Status indicator */}
                  <text
                    x={section.x + section.width / 2}
                    y={section.y + section.height / 2 + 10}
                    textAnchor="middle"
                    className="fill-white text-xs"
                    style={{ fontSize: '10px' }}
                  >
                    {getSectionStatus(section)}
                  </text>
                  
                  {/* Water warning icon */}
                  {needsWater(section) && (
                    <g>
                      <circle
                        cx={section.x + section.width - 15}
                        cy={section.y + 15}
                        r="8"
                        fill="#ef4444"
                      />
                      <text
                        x={section.x + section.width - 15}
                        y={section.y + 19}
                        textAnchor="middle"
                        className="fill-white text-xs font-bold"
                        style={{ fontSize: '10px' }}
                      >
                        !
                      </text>
                    </g>
                  )}
                </g>
              ))}
              
              {/* Farm house */}
              <rect x="480" y="250" width="60" height="40" fill="#8b4513" rx="5" />
              <polygon points="480,250 510,230 540,250" fill="#dc2626" />
              <rect x="495" y="265" width="12" height="20" fill="#4b5563" />
              <rect x="515" y="260" width="8" height="8" fill="#60a5fa" />
              
              {/* Trees */}
              <circle cx="450" cy="80" r="20" fill="#059669" />
              <rect x="445" y="95" width="10" height="15" fill="#8b4513" />
              
              <circle cx="480" cy="120" r="15" fill="#059669" />
              <rect x="477" y="130" width="6" height="10" fill="#8b4513" />
            </svg>
          </div>
        </div>

        {/* Section Details */}
        <div className="space-y-4">
          {selectedSection ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {selectedSection.crop ? selectedSection.crop.name : `قطعة ${selectedSection.id}`}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Droplets className="h-4 w-4 text-blue-600 ml-2" />
                    <span className="text-sm text-gray-600">رطوبة التربة</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 ml-2">
                      <div
                        className={`h-2 rounded-full ${
                          selectedSection.soilMoisture > 60 ? 'bg-blue-600' :
                          selectedSection.soilMoisture > 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedSection.soilMoisture}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {selectedSection.soilMoisture.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Thermometer className="h-4 w-4 text-red-600 ml-2" />
                    <span className="text-sm text-gray-600">درجة الحرارة</span>
                  </div>
                  <span className="text-sm font-medium">
                    {selectedSection.temperature.toFixed(1)}°م
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Sun className="h-4 w-4 text-yellow-600 ml-2" />
                    <span className="text-sm text-gray-600">ضوء الشمس</span>
                  </div>
                  <span className="text-sm font-medium">
                    {selectedSection.sunlight.toFixed(0)}%
                  </span>
                </div>
                
                {selectedSection.crop && (
                  <>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">المساحة</span>
                        <span className="text-sm font-medium">
                          {selectedSection.crop.area_size} فدان
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">تاريخ الزراعة</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedSection.crop.planting_date).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">الحالة</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          getSectionStatus(selectedSection) === 'جاهز للحصاد' ? 'bg-green-100 text-green-700' :
                          getSectionStatus(selectedSection) === 'نمو متقدم' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {getSectionStatus(selectedSection)}
                        </span>
                      </div>
                    </div>
                    
                    {needsWater(selectedSection) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                        <div className="flex items-center">
                          <Droplets className="h-4 w-4 text-red-600 ml-2" />
                          <span className="text-sm font-medium text-red-800">
                            يحتاج ري فوري!
                          </span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          رطوبة التربة منخفضة جداً
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">اضغط على أي قطعة في الخريطة لعرض التفاصيل</p>
            </div>
          )}
          
          {/* Quick Stats */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <h4 className="font-bold text-gray-900 mb-3">إحصائيات سريعة</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">إجمالي القطع</span>
                <span className="text-sm font-medium">{farmSections.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">قطع مزروعة</span>
                <span className="text-sm font-medium">
                  {farmSections.filter(s => s.crop).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">تحتاج ري</span>
                <span className="text-sm font-medium text-red-600">
                  {farmSections.filter(s => needsWater(s)).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmMap;
