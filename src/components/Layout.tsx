
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, Camera, QrCode, UtensilsCrossed, 
  LineChart, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "QR Scanner", path: "/qr-scanner", icon: QrCode },
    { name: "Camera", path: "/camera", icon: Camera },
    { name: "Recipes", path: "/recipes", icon: UtensilsCrossed },
    { name: "Calories", path: "/calories", icon: LineChart },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Main content */}
      <div className="flex-1 pb-16">
        {children}
      </div>

      {/* Bottom navigation bar for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full ${
                  isActive 
                    ? "text-fitness-primary" 
                    : "text-gray-500 hover:text-fitness-secondary"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
