
import React, { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { toast } from 'sonner';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Navigate } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';
import { useIsMobile } from '../hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, UserCircle2 } from 'lucide-react';

const ProtectedProfilePage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        if (isMobile) {
          const result = await NativeBiometric.isAvailable();
          setIsBiometricAvailable(result.isAvailable);
        } else {
          // For desktop, we'll skip biometric auth
          setIsBiometricAvailable(false);
          setIsAuthenticated(true);
        }
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking biometric availability:', error);
        setIsBiometricAvailable(false);
        setIsAuthenticated(true); // Allow access when biometric check fails
        setIsChecking(false);
      }
    };

    checkBiometricAvailability();
  }, [isMobile]);

  const handleBiometricAuth = async () => {
    try {
      if (!isBiometricAvailable) {
        setIsAuthenticated(true);
        return;
      }

      await NativeBiometric.verifyIdentity({
        reason: "Access your profile",
        title: "Biometric Authentication",
        subtitle: "Please authenticate to view your profile",
      });
      
      // If the verification passes, the above call doesn't throw an error
      // So we can assume authentication is successful
      setIsAuthenticated(true);
      toast.success("Authentication successful!");
    } catch (error) {
      console.error('Error during biometric auth:', error);
      toast.error("Authentication failed. Please try again.");
      
      // Fallback for testing or when biometrics fail
      if (!isMobile || process.env.NODE_ENV === 'development') {
        setIsAuthenticated(true);
        toast.info("Development mode: Authentication bypassed");
      }
    }
  };

  // For desktop testing, allow a button to bypass authentication
  const handleBypassAuth = () => {
    setIsAuthenticated(true);
    toast.info("Authentication bypassed for desktop testing");
  };

  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Checking authentication capabilities...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <Fingerprint size={24} />
              Biometric Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              Please authenticate to access your profile
            </p>
            <div className="flex flex-col gap-2 items-center">
              {isBiometricAvailable ? (
                <Button 
                  onClick={handleBiometricAuth}
                  className="fitness-gradient w-full max-w-xs"
                >
                  <Fingerprint size={18} className="mr-2" />
                  Authenticate with Biometrics
                </Button>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-amber-600">Biometric authentication not available on this device</p>
                  <Button 
                    onClick={handleBypassAuth}
                    className="fitness-gradient w-full max-w-xs"
                  >
                    <UserCircle2 size={18} className="mr-2" />
                    Continue to Profile
                  </Button>
                </div>
              )}
              
              {/* Always show bypass option on desktop for testing purposes */}
              {!isMobile && (
                <Button 
                  variant="outline" 
                  onClick={handleBypassAuth} 
                  className="mt-2 text-sm"
                >
                  Desktop Testing: Skip Authentication
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ProfilePage />;
};

export default ProtectedProfilePage;
