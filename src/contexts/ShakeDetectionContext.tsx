
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Device } from '@capacitor/device';
import { Haptics } from '@capacitor/haptics';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type ShakeDetectionContextType = {
  isShakeEnabled: boolean;
  toggleShakeDetection: () => void;
  shakeThreshold: number;
  setShakeThreshold: (value: number) => void;
  lastShakeAction: Date | null;
  isTiltEnabled: boolean;
  toggleTiltDetection: () => void;
};

const ShakeDetectionContext = createContext<ShakeDetectionContextType | undefined>(undefined);

export const ShakeDetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isShakeEnabled, setIsShakeEnabled] = useState(true);
  const [isTiltEnabled, setIsTiltEnabled] = useState(true);
  const [shakeThreshold, setShakeThreshold] = useState(8); // Lower threshold for better detection
  const [lastShakeAction, setLastShakeAction] = useState<Date | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [lastTiltTime, setLastTiltTime] = useState(0);
  const navigate = useNavigate();
  
  // Shake detection logic with improved sensitivity
  useEffect(() => {
    if (!isShakeEnabled) return;
    
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastUpdate = 0;
    let shakeCount = 0;
    let lastShake = 0;
    
    const handleMotion = (event: DeviceMotionEvent) => {
      const currentTime = new Date().getTime();
      
      if ((currentTime - lastUpdate) > 100) {
        const diffTime = currentTime - lastUpdate;
        lastUpdate = currentTime;
        
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration) return;
        
        const x = acceleration.x || 0;
        const y = acceleration.y || 0;
        const z = acceleration.z || 0;
        
        // Calculate speed with more sensitivity to Z-axis (up/down) movement
        const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
        
        if (speed > shakeThreshold) {
          console.log('Shake detected! Speed:', speed, 'Threshold:', shakeThreshold);
          
          // Prevent shake detection from triggering too often
          if (currentTime - lastShake > 800) { // Reduced cooldown time
            shakeCount++;
            lastShake = currentTime;
            
            // Only need one strong shake to trigger
            if (shakeCount >= 1) {
              console.log('Shake action triggered!');
              handleShakeAction();
              shakeCount = 0;
            }
          }
        }
        
        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };
    
    // Check if device motion events are available
    if (typeof DeviceMotionEvent !== 'undefined') {
      console.log('DeviceMotion is available, adding event listener');
      window.addEventListener('devicemotion', handleMotion, true);
      
      // Try to request permission on iOS 13+
      try {
        // Use type assertion to access the requestPermission method
        // This avoids TS errors while allowing the code to work on iOS
        const DeviceMotionEventAny = DeviceMotionEvent as any;
        if (typeof DeviceMotionEventAny.requestPermission === 'function') {
          DeviceMotionEventAny.requestPermission()
            .then((response: string) => {
              if (response === 'granted') {
                console.log('Motion permission granted');
                window.addEventListener('devicemotion', handleMotion, true);
              } else {
                console.log('Motion permission denied');
                toast.error('Motion detection permission denied');
              }
            })
            .catch(console.error);
        }
      } catch (error) {
        console.error('Error requesting motion permission:', error);
      }
    } else {
      console.log('DeviceMotion is not available on this device');
      toast.warning('Shake detection not available on this device');
    }
    
    return () => {
      window.removeEventListener('devicemotion', handleMotion, true);
    };
  }, [isShakeEnabled, shakeThreshold]);
  
  // Tilt and step detection
  useEffect(() => {
    if (!isTiltEnabled) return;
    
    let lastAccX = 0;
    let lastAccY = 0;
    let lastAccZ = 0;
    let stepDetected = false;
    
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const currentTime = new Date().getTime();
      
      // Only process orientation events every 1000ms to avoid too many notifications
      if (currentTime - lastTiltTime < 1000) {
        return;
      }
      
      // Detect significant tilt based on beta (front-to-back) and gamma (left-to-right) values
      const beta = event.beta || 0; // Front-to-back tilt
      const gamma = event.gamma || 0; // Left-to-right tilt
      
      // Check for significant tilting movement
      if (Math.abs(beta) > 45 || Math.abs(gamma) > 45) {
        setLastTiltTime(currentTime);
        handleTiltAction();
      }
    };
    
    const handleMotionForSteps = (event: DeviceMotionEvent) => {
      const acceleration = event.acceleration;
      if (!acceleration) return;
      
      const x = acceleration.x || 0;
      const y = acceleration.y || 0;
      const z = acceleration.z || 0;
      
      // Simple step detection algorithm
      const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);
      const deltaX = Math.abs(x - lastAccX);
      const deltaY = Math.abs(y - lastAccY);
      const deltaZ = Math.abs(z - lastAccZ);
      const deltaAcceleration = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
      
      // Detect a step based on change in acceleration
      if (deltaAcceleration > 10 && !stepDetected) { // Threshold for step detection
        stepDetected = true;
        setStepCount(prev => prev + 1);
        
        // Show a health reminder every 10 steps
        if (stepCount % 10 === 0 && stepCount > 0) {
          handleStepAction();
        }
      } else if (deltaAcceleration < 2) {
        stepDetected = false;
      }
      
      lastAccX = x;
      lastAccY = y;
      lastAccZ = z;
    };
    
    if (typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    
    if (typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleMotionForSteps, true);
    }
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('devicemotion', handleMotionForSteps, true);
    };
  }, [isTiltEnabled, lastTiltTime, stepCount]);
  
  const handleShakeAction = async () => {
    try {
      // Vibrate device
      await Haptics.vibrate();
      
      // Show motivational notification
      const motivationalMessages = [
        "Keep going! You're doing great on your fitness journey!",
        "Don't forget to track your calories today!",
        "A little progress each day adds up to big results!",
        "Stay hydrated and keep moving!",
        "Remember your fitness goals for today!"
      ];
      
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      toast.info(randomMessage, {
        description: "Shake detected! Stay motivated!",
        duration: 5000
      });
      
      // Update last shake action time
      setLastShakeAction(new Date());
      
      // Navigate to a random page
      const randomPages = ['/home', '/recipes', '/calories', '/profile', '/qr-scanner'];
      const randomIndex = Math.floor(Math.random() * randomPages.length);
      navigate(randomPages[randomIndex]);
      
    } catch (error) {
      console.error("Error handling shake action:", error);
    }
  };
  
  const handleTiltAction = async () => {
    try {
      // Vibrate device
      await Haptics.vibrate();
      
      // Show health quotes
      const healthQuotes = [
        "The greatest wealth is health.",
        "Take care of your body. It's the only place you have to live.",
        "Healthy is an outfit that looks different on everybody.",
        "Health is not valued until sickness comes.",
        "An apple a day keeps the doctor away.",
        "Let food be thy medicine and medicine be thy food.",
        "Walking is man's best medicine.",
        "Health is a state of complete harmony of the body, mind, and spirit."
      ];
      
      const randomQuote = healthQuotes[Math.floor(Math.random() * healthQuotes.length)];
      toast.info(randomQuote, {
        description: "Health reminder",
        duration: 4000
      });
      
    } catch (error) {
      console.error("Error handling tilt action:", error);
    }
  };
  
  const handleStepAction = async () => {
    try {
      // Vibrate device gently
      await Haptics.vibrate();
      
      // Show step count and reminder
      const stepReminders = [
        "Great job! Keep walking for better health.",
        "You're on your way to your 10,000 steps goal!",
        "Walking improves circulation and mood.",
        "Every step counts towards a healthier you!",
        "Walking regularly reduces risk of chronic diseases."
      ];
      
      const randomReminder = stepReminders[Math.floor(Math.random() * stepReminders.length)];
      toast.success(`${stepCount} steps taken!`, {
        description: randomReminder,
        duration: 4000
      });
      
    } catch (error) {
      console.error("Error handling step action:", error);
    }
  };
  
  const toggleShakeDetection = () => {
    setIsShakeEnabled(prev => !prev);
    if (!isShakeEnabled) {
      toast.success("Shake detection enabled!");
    } else {
      toast.info("Shake detection disabled");
    }
  };
  
  const toggleTiltDetection = () => {
    setIsTiltEnabled(prev => !prev);
    if (!isTiltEnabled) {
      toast.success("Tilt and step detection enabled!");
    } else {
      toast.info("Tilt and step detection disabled");
    }
  };
  
  const value = {
    isShakeEnabled,
    toggleShakeDetection,
    shakeThreshold,
    setShakeThreshold,
    lastShakeAction,
    isTiltEnabled,
    toggleTiltDetection
  };
  
  return (
    <ShakeDetectionContext.Provider value={value}>
      {children}
    </ShakeDetectionContext.Provider>
  );
};

export const useShakeDetection = (): ShakeDetectionContextType => {
  const context = useContext(ShakeDetectionContext);
  if (context === undefined) {
    throw new Error('useShakeDetection must be used within a ShakeDetectionProvider');
  }
  return context;
};
