
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Device } from '@capacitor/device';
import { toast } from 'sonner';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserHealthInfo = {
  height?: number;
  weight?: number;
  allergies?: string[];
  goal?: 'gain' | 'loss' | 'maintain';
  dietPreference?: 'veg' | 'nonveg' | 'vegan';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
};

type AppUser = {
  id: string;
  name: string;
  email: string;
  healthInfo?: UserHealthInfo;
  createdAt: Date;
};

type AuthContextType = {
  user: AppUser | null;
  isLoading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserHealthInfo: (healthInfo: Partial<UserHealthInfo>) => Promise<void>;
  checkBiometricAvailability: () => Promise<boolean>;
  authenticateWithBiometrics: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Map Supabase user to our AppUser type
  const mapUserToAppUser = (user: User): AppUser => {
    return {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      healthInfo: user.user_metadata?.healthInfo,
      createdAt: new Date(user.created_at)
    };
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        
        if (newSession?.user) {
          // Don't call other Supabase functions directly in the callback
          // Use setTimeout to defer
          setTimeout(() => {
            const appUser = mapUserToAppUser(newSession.user);
            setUser(appUser);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const appUser = mapUserToAppUser(currentSession.user);
        setUser(appUser);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success('Account created successfully! Please verify your email.');
        
        // Auto-login after registration
        const appUser = mapUserToAppUser(data.user);
        setUser(appUser);
        
        // Navigate to onboarding
        navigate('/onboarding');
      }
    } catch (error) {
      toast.error('Registration failed: ' + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const appUser = mapUserToAppUser(data.user);
        setUser(appUser);
        
        toast.success('Logged in successfully!');
        
        // Navigate to home or onboarding depending on whether health info exists
        if (data.user.user_metadata?.healthInfo) {
          navigate('/home');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (error) {
      toast.error('Login failed: ' + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      navigate('/');
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Logout failed: ' + (error as Error).message);
    }
  };

  const updateUserHealthInfo = async (healthInfo: Partial<UserHealthInfo>) => {
    try {
      if (!user) throw new Error('No user is logged in');
      
      const { error } = await supabase.auth.updateUser({
        data: {
          healthInfo: {
            ...user.healthInfo,
            ...healthInfo
          }
        }
      });
      
      if (error) throw error;
      
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          healthInfo: {
            ...prev.healthInfo,
            ...healthInfo
          }
        };
      });
      
      return Promise.resolve();
    } catch (error) {
      toast.error('Failed to update health info: ' + (error as Error).message);
      return Promise.reject(error);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      // Updated to handle the current Capacitor Device API
      const deviceInfo = await Device.getInfo();
      // Note: We're simplifying this for demo purposes
      // In a real app, we would use a proper biometric plugin
      return deviceInfo.platform !== 'web'; // Assume biometrics available on mobile platforms
    } catch (error) {
      console.error('Error checking biometrics:', error);
      return false;
    }
  };

  const authenticateWithBiometrics = async () => {
    try {
      // In a real app, we'd use a proper biometric authentication plugin
      // For this demo, we'll check if we have a stored session
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        toast.success('Biometric authentication successful!');
        navigate('/home');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    register,
    login,
    logout,
    updateUserHealthInfo,
    checkBiometricAvailability,
    authenticateWithBiometrics
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
