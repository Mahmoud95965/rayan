import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, TrendingDown, PieChart, Save, Download, RefreshCw } from 'lucide-react';

interface CostItem {
  id: string;
  category: 'seeds' | 'fertilizer' | 'water' | 'labor' | 'equipment' | 'other';
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface RevenueItem {
  id: string;
  crop: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

interface CalculationResult {
  totalCosts: number;
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
}

const CostCalculator: React.FC = () => {
  const [costs, setCosts] = useState<CostItem[]>([
    {
      id: '1',
      category: 'seeds',
      name: 'بذور طماطم',
      quantity: 2,
      unitPrice: 150,
      total: 300
    },
    {
      id: '2',
      category: 'fertilizer',
      name: 'سماد NPK',
      quantity: 10,
      unitPrice: 45,
      total: 450
    },
    {
      id: '3',
      category: 'water',
      name: 'مياه الري',
      quantity: 1000,
      unitPrice: 0.5,
      total: 500
    }
  ]);

  const [revenues, setRevenues] = useState<RevenueItem[]>([
    {
      id: '1',
      crop: 'طماطم',
      quantity: 500,
      pricePerUnit: 8,
      total: 4000
    },
    {
      id: '2',
      crop: 'قمح',
      quantity: 200,
      pricePerUnit: 12,
      total: 2400
    }
  ]);

  const [newCost, setNewCost] = useState<Partial<CostItem>>({
    category: 'seeds',
    name: '',
    quantity: 0,
    unitPrice: 0
  });

  const [newRevenue, setNewRevenue] = useState<Partial<RevenueItem>>({
    crop: '',
    quantity: 0,
    pricePerUnit: 0
  });

  const [calculation, setCalculation] = useState<CalculationResult>({
    totalCosts: 0,
    totalRevenue: 0,
    netProfit: 0,
    profitMargin: 0,
    roi: 0
  });

  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'season' | 'year'>('season');
  const [showAddCost, setShowAddCost] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);

  useEffect(() => {
    calculateResults();
  }, [costs, revenues]);

  const calculateResults = () => {
    const totalCosts = costs.reduce((sum, cost) => sum + cost.total, 0);
    const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.total, 0);
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

    setCalculation({
      totalCosts,
      totalRevenue,
      netProfit,
      profitMargin,
      roi
    });
  };

  const addCost = () => {
    if (newCost.name && newCost.quantity && newCost.unitPrice) {
      const cost: CostItem = {
        id: Date.now().toString(),
        category: newCost.category || 'other',
        name: newCost.name,
        quantity: newCost.quantity,
        unitPrice: newCost.unitPrice,
        total: newCost.quantity * newCost.unitPrice
      };
      setCosts([...costs, cost]);
      setNewCost({ category: 'seeds', name: '', quantity: 0, unitPrice: 0 });
      setShowAddCost(false);
    }
  };

  const addRevenue = () => {
    if (newRevenue.crop && newRevenue.quantity && newRevenue.pricePerUnit) {
      const revenue: RevenueItem = {
        id: Date.now().toString(),
        crop: newRevenue.crop,
        quantity: newRevenue.quantity,
        pricePerUnit: newRevenue.pricePerUnit,
        total: newRevenue.quantity * newRevenue.pricePerUnit
      };
      setRevenues([...revenues, revenue]);
      setNewRevenue({ crop: '', quantity: 0, pricePerUnit: 0 });
      setShowAddRevenue(false);
    }
  };

  const removeCost = (id: string) => {
    setCosts(costs.filter(cost => cost.id !== id));
  };

  const removeRevenue = (id: string) => {
    setRevenues(revenues.filter(revenue => revenue.id !== id));
  };

  const getCategoryName = (category: string) => {
    const categories = {
      seeds: 'البذور',
      fertilizer: 'الأسمدة',
      water: 'المياه',
      labor: 'العمالة',
      equipment: 'المعدات',
      other: 'أخرى'
    };
    return categories[category as keyof typeof categories] || 'أخرى';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      seeds: 'bg-green-100 text-green-800',
      fertilizer: 'bg-yellow-100 text-yellow-800',
      water: 'bg-blue-100 text-blue-800',
      labor: 'bg-purple-100 text-purple-800',
      equipment: 'bg-gray-100 text-gray-800',
      other: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCostsByCategory = () => {
    const categories = costs.reduce((acc, cost) => {
      if (!acc[cost.category]) {
        acc[cost.category] = 0;
      }
      acc[cost.category] += cost.total;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([category, total]) => ({
      category,
      name: getCategoryName(category),
      total,
      percentage: (total / calculation.totalCosts) * 100
    }));
  };

  const exportData = () => {
    const data = {
      period: selectedPeriod,
      calculation,
      costs,
      revenues,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-calculation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calculator className="h-6 w-6 ml-2 text-green-600" />
          حاسبة التكاليف والأرباح
        </h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="month">شهري</option>
            <option value="season">موسمي</option>
            <option value="year">سنوي</option>
          </select>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Download className="h-4 w-4 ml-1" />
            تصدير
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">إجمالي التكاليف</p>
              <p className="text-2xl font-bold text-red-900">
                {calculation.totalCosts.toLocaleString()} ج.م
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-900">
                {calculation.totalRevenue.toLocaleString()} ج.م
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className={`bg-gradient-to-r rounded-xl p-6 ${
          calculation.netProfit >= 0 
            ? 'from-blue-50 to-blue-100' 
            : 'from-red-50 to-red-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                calculation.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                صافي الربح
              </p>
              <p className={`text-2xl font-bold ${
                calculation.netProfit >= 0 ? 'text-blue-900' : 'text-red-900'
              }`}>
                {calculation.netProfit.toLocaleString()} ج.م
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${
              calculation.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
            }`} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">العائد على الاستثمار</p>
              <p className="text-2xl font-bold text-purple-900">
                {calculation.roi.toFixed(1)}%
              </p>
            </div>
            <PieChart className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Costs Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">التكاليف</h3>
            <button
              onClick={() => setShowAddCost(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              إضافة تكلفة
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {costs.map((cost) => (
              <div key={cost.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(cost.category)}`}>
                    {getCategoryName(cost.category)}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">{cost.name}</div>
                    <div className="text-sm text-gray-600">
                      {cost.quantity} × {cost.unitPrice} ج.م
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="font-bold text-gray-900">
                    {cost.total.toLocaleString()} ج.م
                  </span>
                  <button
                    onClick={() => removeCost(cost.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cost Breakdown */}
          <div className="border-t pt-4">
            <h4 className="font-bold text-gray-900 mb-3">توزيع التكاليف</h4>
            <div className="space-y-2">
              {getCostsByCategory().map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">الإيرادات</h3>
            <button
              onClick={() => setShowAddRevenue(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              إضافة إيراد
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {revenues.map((revenue) => (
              <div key={revenue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{revenue.crop}</div>
                  <div className="text-sm text-gray-600">
                    {revenue.quantity} كجم × {revenue.pricePerUnit} ج.م
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="font-bold text-gray-900">
                    {revenue.total.toLocaleString()} ج.م
                  </span>
                  <button
                    onClick={() => removeRevenue(revenue.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Profit Analysis */}
          <div className="border-t pt-4">
            <h4 className="font-bold text-gray-900 mb-3">تحليل الربحية</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">هامش الربح</span>
                <span className={`text-sm font-medium ${
                  calculation.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {calculation.profitMargin.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">نقطة التعادل</span>
                <span className="text-sm font-medium text-gray-900">
                  {calculation.totalCosts.toLocaleString()} ج.م
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">الربح لكل جنيه مستثمر</span>
                <span className="text-sm font-medium text-blue-600">
                  {(calculation.roi / 100).toFixed(2)} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Cost Modal */}
      {showAddCost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">إضافة تكلفة جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                <select
                  value={newCost.category}
                  onChange={(e) => setNewCost({...newCost, category: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="seeds">البذور</option>
                  <option value="fertilizer">الأسمدة</option>
                  <option value="water">المياه</option>
                  <option value="labor">العمالة</option>
                  <option value="equipment">المعدات</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                <input
                  type="text"
                  value={newCost.name}
                  onChange={(e) => setNewCost({...newCost, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="مثال: بذور طماطم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الكمية</label>
                <input
                  type="number"
                  value={newCost.quantity}
                  onChange={(e) => setNewCost({...newCost, quantity: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السعر للوحدة (ج.م)</label>
                <input
                  type="number"
                  value={newCost.unitPrice}
                  onChange={(e) => setNewCost({...newCost, unitPrice: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex space-x-2 space-x-reverse pt-4">
                <button
                  onClick={addCost}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setShowAddCost(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Revenue Modal */}
      {showAddRevenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">إضافة إيراد جديد</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المحصول</label>
                <input
                  type="text"
                  value={newRevenue.crop}
                  onChange={(e) => setNewRevenue({...newRevenue, crop: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="مثال: طماطم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الكمية (كجم)</label>
                <input
                  type="number"
                  value={newRevenue.quantity}
                  onChange={(e) => setNewRevenue({...newRevenue, quantity: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السعر للكيلو (ج.م)</label>
                <input
                  type="number"
                  value={newRevenue.pricePerUnit}
                  onChange={(e) => setNewRevenue({...newRevenue, pricePerUnit: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex space-x-2 space-x-reverse pt-4">
                <button
                  onClick={addRevenue}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setShowAddRevenue(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCalculator;
