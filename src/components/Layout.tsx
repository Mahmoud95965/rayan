import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, User, Sprout } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-green-600 ml-2" />
              <h1 className="text-2xl font-bold text-green-800">ريّان</h1>
              <span className="text-sm text-gray-500 mr-2">المنصة الزراعية الذكية</span>
            </div>

            {/* Navigation */}
            {user && (
              <div className="flex items-center space-x-4 space-x-reverse">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <Bell className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <User className="h-8 w-8 text-gray-400 bg-gray-200 rounded-full p-1" />
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {userProfile?.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500">مزارع</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 منصة ريّان الزراعية الذكية - مخصصة لمزارعي صعيد مصر</p>
            <p className="mt-1 text-sm">تطوير فريق ريّان للتكنولوجيا الزراعية</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;