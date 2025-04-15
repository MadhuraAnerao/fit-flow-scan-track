
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useShakeDetection } from '@/contexts/ShakeDetectionContext';
import { RotateCcw, PhoneShake } from 'lucide-react';

export const ShakeReminder: React.FC = () => {
  const [showShakeDialog, setShowShakeDialog] = useState(false);
  const [showTiltDialog, setShowTiltDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: '',
    description: ''
  });
  const { isShakeEnabled, isTiltEnabled } = useShakeDetection();
  
  // Listen for custom events from ShakeDetectionContext
  useEffect(() => {
    const handleShakeDetected = (event: CustomEvent<{ message: string }>) => {
      if (!isShakeEnabled) return;
      
      setDialogContent({
        title: 'Shake Detected!',
        description: event.detail.message || 'Try shaking your device for random navigation!'
      });
      setShowShakeDialog(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setShowShakeDialog(false);
      }, 3000);
    };
    
    const handleTiltDetected = (event: CustomEvent<{ message: string }>) => {
      if (!isTiltEnabled) return;
      
      setDialogContent({
        title: 'Device Tilted!',
        description: event.detail.message || 'Health reminder: Remember to maintain good posture.'
      });
      setShowTiltDialog(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setShowTiltDialog(false);
      }, 3000);
    };
    
    // Add event listeners
    window.addEventListener('shakeDetected' as any, handleShakeDetected as EventListener);
    window.addEventListener('tiltDetected' as any, handleTiltDetected as EventListener);
    
    // Show initial info toast
    if (isShakeEnabled || isTiltEnabled) {
      setTimeout(() => {
        toast.info(
          isShakeEnabled && isTiltEnabled 
            ? 'Shake & tilt your device for features!' 
            : isShakeEnabled 
              ? 'Shake your device to navigate!' 
              : 'Tilt your device for health tips!'
        );
      }, 2000);
    }
    
    return () => {
      window.removeEventListener('shakeDetected' as any, handleShakeDetected as EventListener);
      window.removeEventListener('tiltDetected' as any, handleTiltDetected as EventListener);
    };
  }, [isShakeEnabled, isTiltEnabled]);
  
  return (
    <>
      <AlertDialog open={showShakeDialog} onOpenChange={setShowShakeDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PhoneShake className="text-primary" />
              {dialogContent.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showTiltDialog} onOpenChange={setShowTiltDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="text-amber-500" />
              {dialogContent.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ShakeReminder;
