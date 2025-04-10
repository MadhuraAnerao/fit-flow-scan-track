import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();

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

      {/* Note: Bottom navigation is now handled by React Navigation in App.tsx */}
    </div>
  );
};
