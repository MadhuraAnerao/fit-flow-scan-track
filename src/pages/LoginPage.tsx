
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fingerprint, Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, checkBiometricAvailability, authenticateWithBiometrics, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkBiometrics = async () => {
      const available = await checkBiometricAvailability();
      setIsBiometricAvailable(available);
    };
    
    checkBiometrics();

    // If user is already logged in, redirect to home
    if (user) {
      navigate('/home');
    }
  }, [checkBiometricAvailability, user, navigate]);

  const validateForm = () => {
    if (!email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    
    if (!password.trim() || password.length < 6) {
      toast.error('Please enter a password (minimum 6 characters)');
      return false;
    }
    
    if (!isLogin && !name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Error is already handled in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setIsSubmitting(true);
      const success = await authenticateWithBiometrics();
      if (!success) {
        toast.error('Biometric authentication failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-fitness-light to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-fitness-dark mb-2">FitFlow</h1>
          <p className="text-gray-600">Your personal health and fitness companion</p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-fitness-secondary">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Sign in to track your health journey' 
                : 'Join us to start your fitness journey'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </TabsTrigger>
                <TabsTrigger 
                  value="biometric" 
                  disabled={!isBiometricAvailable || !isLogin} 
                  className="flex items-center gap-2"
                >
                  <Fingerprint size={16} />
                  Biometric
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input 
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <Input 
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <Input 
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full fitness-gradient"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 
                      (isLogin ? 'Signing In...' : 'Creating Account...') : 
                      (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="biometric">
                <div className="flex flex-col items-center justify-center py-6">
                  <Fingerprint size={64} className="text-fitness-primary mb-4" />
                  <p className="text-center text-gray-600 mb-4">
                    Use your fingerprint or face recognition to sign in quickly and securely.
                  </p>
                  <Button 
                    onClick={handleBiometricLogin} 
                    className="fitness-gradient"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Authenticating...' : 'Authenticate'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-fitness-secondary"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
