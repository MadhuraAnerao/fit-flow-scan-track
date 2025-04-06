
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Device } from '@capacitor/device';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
  healthInfo?: {
    height?: number;
    weight?: number;
    allergies?: string[];
    goal?: 'gain' | 'loss' | 'maintain';
    dietPreference?: 'veg' | 'nonveg' | 'vegan';
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  };
  createdAt: Date;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserHealthInfo: (healthInfo: Partial<User['healthInfo']>) => Promise<void>;
  checkBiometricAvailability: () => Promise<boolean>;
  authenticateWithBiometrics: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Mock user database for demo purposes
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      healthInfo: {
        height: 175,
        weight: 70,
        allergies: ['peanuts'],
        goal: 'maintain',
        dietPreference: 'nonveg',
        activityLevel: 'moderate'
      },
      createdAt: new Date('2023-01-15')
    }
  ];

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('fitnessAppUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        createdAt: new Date()
      };

      // Store user in localStorage (in a real app, this would be a backend API call)
      localStorage.setItem('fitnessAppUser', JSON.stringify(newUser));
      
      // Update state
      setUser(newUser);
      toast.success('Account created successfully!');
      
      // Navigate to onboarding
      navigate('/onboarding');
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
      // Simple mock login (in a real app, this would validate against a backend)
      const foundUser = mockUsers.find(u => u.email === email);
      if (!foundUser) {
        // For demo purposes, let's pretend any email/password works
        const demoUser: User = {
          id: '1',
          name: 'Demo User',
          email: email,
          healthInfo: {
            height: 175,
            weight: 70,
            allergies: ['peanuts'],
            goal: 'maintain',
            dietPreference: 'nonveg',
            activityLevel: 'moderate'
          },
          createdAt: new Date()
        };
        
        localStorage.setItem('fitnessAppUser', JSON.stringify(demoUser));
        setUser(demoUser);
        toast.success('Logged in successfully!');
        
        // Navigate to home or onboarding depending on whether health info exists
        navigate('/home');
      } else {
        localStorage.setItem('fitnessAppUser', JSON.stringify(foundUser));
        setUser(foundUser);
        toast.success('Logged in successfully!');
        
        // Navigate to home or onboarding depending on whether health info exists
        if (foundUser.healthInfo) {
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
    setUser(null);
    localStorage.removeItem('fitnessAppUser');
    navigate('/');
    toast.success('Logged out successfully!');
  };

  const updateUserHealthInfo = async (healthInfo: Partial<User['healthInfo']>) => {
    try {
      if (!user) throw new Error('No user is logged in');
      
      const updatedUser = {
        ...user,
        healthInfo: {
          ...user.healthInfo,
          ...healthInfo
        }
      };
      
      localStorage.setItem('fitnessAppUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
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
      // For this demo, we'll simulate successful authentication
      toast.success('Biometric authentication successful!');
      
      // Simulate logging in the last user
      const storedUser = localStorage.getItem('fitnessAppUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
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
