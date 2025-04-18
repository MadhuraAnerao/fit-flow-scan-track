
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
  register: (email: string, password: string, name: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserHealthInfo: (healthInfo: Partial<UserHealthInfo>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Map Supabase user and profile data to our AppUser type
  const mapUserToAppUser = async (authUser: User): Promise<AppUser | null> => {
    try {
      // Fetch the user profile from the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: authUser.id,
        name: profile.name || authUser.email?.split('@')[0] || 'User',
        email: profile.email || authUser.email || '',
        healthInfo: {
          height: profile.height || undefined,
          weight: profile.weight || undefined,
          allergies: profile.allergies || [],
          goal: profile.goal as 'gain' | 'loss' | 'maintain' | undefined,
          dietPreference: profile.diet_preference as 'veg' | 'nonveg' | 'vegan' | undefined,
          activityLevel: profile.activity_level as 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active' | undefined,
        },
        createdAt: new Date(profile.created_at)
      };
    } catch (error) {
      console.error('Error mapping user to AppUser:', error);
      return null;
    }
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
            mapUserToAppUser(newSession.user)
              .then(appUser => {
                if (appUser) {
                  setUser(appUser);
                } else {
                  setUser(null);
                }
              })
              .catch(() => setUser(null));
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
        mapUserToAppUser(currentSession.user)
          .then(appUser => {
            if (appUser) {
              setUser(appUser);
            } else {
              setUser(null);
            }
            setIsLoading(false);
          })
          .catch(() => {
            setUser(null);
            setIsLoading(false);
          });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
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
        toast.success('Account created successfully!');
        
        // Wait a moment for profile to be created via trigger
        return new Promise((resolve) => {
          setTimeout(async () => {
            const appUser = await mapUserToAppUser(data.user!);
            if (appUser) {
              setUser(appUser);
              resolve(true);
            } else {
              resolve(false);
            }
          }, 1000);
        });
      }
      
      return false;
    } catch (error) {
      toast.error('Registration failed: ' + (error as Error).message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const appUser = await mapUserToAppUser(data.user);
        if (appUser) {
          setUser(appUser);
          toast.success('Logged in successfully!');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      toast.error('Login failed: ' + (error as Error).message);
      return false;
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
      navigate('/login');
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Logout failed: ' + (error as Error).message);
    }
  };

  const updateUserHealthInfo = async (healthInfo: Partial<UserHealthInfo>) => {
    try {
      if (!user) throw new Error('No user is logged in');
      
      // Update the profiles table directly
      const { error } = await supabase
        .from('profiles')
        .update({
          height: healthInfo.height,
          weight: healthInfo.weight,
          allergies: healthInfo.allergies,
          goal: healthInfo.goal,
          diet_preference: healthInfo.dietPreference,
          activity_level: healthInfo.activityLevel
        })
        .eq('id', user.id);
      
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

  const value = {
    user,
    isLoading,
    register,
    login,
    logout,
    updateUserHealthInfo,
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
