
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothOff, 
  Video,
  VideoOff,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';

// Add TypeScript interfaces for Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
    };
  }

  interface BluetoothDevice {
    name: string | null;
    gatt?: {
      connect(): Promise<BluetoothRemoteGATTServer>;
    };
    addEventListener(
      type: 'gattserverdisconnected', 
      listener: EventListener
    ): void;
    removeEventListener(
      type: 'gattserverdisconnected', 
      listener: EventListener
    ): void;
  }

  interface RequestDeviceOptions {
    acceptAllDevices?: boolean;
    filters?: Array<{ services: string[] }>;
    optionalServices?: string[];
  }

  interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
  }
}

interface BluetoothVideoProps {
  videoUrl: string;
  videoTitle: string;
  videoDuration: string;
  videoDescription?: string;
  thumbnailUrl?: string;
}

export const BluetoothVideo: React.FC<BluetoothVideoProps> = ({
  videoUrl,
  videoTitle,
  videoDuration,
  videoDescription,
  thumbnailUrl
}) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBluetoothAvailable, setIsBluetoothAvailable] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Check if Bluetooth is available in the browser
  useEffect(() => {
    if (navigator.bluetooth) {
      setIsBluetoothAvailable(true);
    } else {
      setIsBluetoothAvailable(false);
    }
  }, []);

  // Setup video element event listeners
  useEffect(() => {
    const video = videoRef.current;
    
    if (video) {
      const handleTimeUpdate = () => {
        const progress = (video.currentTime / video.duration) * 100;
        setVideoProgress(progress);
      };
      
      const handleEnded = () => {
        setIsVideoPlaying(false);
        toast.info("Video playback completed");
      };
      
      // Add event listeners
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      
      // Clean up
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [toast]);

  // Request Bluetooth device and connect
  const connectBluetooth = async () => {
    if (!navigator.bluetooth) {
      toast.error("Bluetooth not available on this device or browser");
      return;
    }

    try {
      setIsConnecting(true);
      toast.info("Searching for Bluetooth devices...");

      // Request a Bluetooth device with the appropriate services
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        // You can specify required services for audio devices
        // optionalServices: ['00001108-0000-1000-8000-00805f9b34fb'] // A2DP Sink service
      });

      if (device) {
        device.addEventListener('gattserverdisconnected', () => {
          setIsConnected(false);
          setConnectedDevice(null);
          toast.error(`${device.name || 'Device'} disconnected`);
          
          if (videoRef.current && isVideoPlaying) {
            videoRef.current.pause();
            setIsVideoPlaying(false);
          }
        });

        setConnectedDevice(device.name || 'Unknown Device');
        setIsConnected(true);
        toast.success(`Connected to ${device.name || 'Bluetooth Device'}`);
      }
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      toast.error("Failed to connect to Bluetooth device");
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from Bluetooth device
  const disconnectBluetooth = () => {
    if (videoRef.current && isVideoPlaying) {
      videoRef.current.pause();
    }
    setIsConnected(false);
    setConnectedDevice(null);
    setIsVideoPlaying(false);
    toast.info("Disconnected from Bluetooth device");
  };

  // Toggle video playback
  const toggleVideo = () => {
    if (!isConnected) {
      toast.error("Please connect to a Bluetooth device first");
      return;
    }
    
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        toast.info("Paused video playback");
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => {
            toast.success(`Playing audio through ${connectedDevice || 'Bluetooth device'}`);
            setIsVideoPlaying(true);
          })
          .catch(error => {
            console.error('Video playback error:', error);
            toast.error("Failed to play video. Please try again.");
          });
      }
    }
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      toast.info(isMuted ? "Audio unmuted" : "Audio muted");
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          {isConnected ? 
            <BluetoothConnected className="mr-2 text-blue-500" /> : 
            <Bluetooth className="mr-2 text-gray-500" />
          }
          {videoTitle}
        </CardTitle>
        <CardDescription>{videoDuration} • {videoDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isBluetoothAvailable ? (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <BluetoothOff className="h-4 w-4" />
            <AlertTitle>Bluetooth Not Available</AlertTitle>
            <AlertDescription>
              Bluetooth is not available on this device or browser.
              Try using a different browser or device with Bluetooth support.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="relative aspect-video rounded-md overflow-hidden bg-gray-100 mb-4">
              <video 
                ref={videoRef}
                src={videoUrl} 
                poster={thumbnailUrl}
                className="w-full h-full object-cover"
                playsInline
                controls={isVideoPlaying}
                muted={isMuted}
              />
              
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt={videoTitle} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                  ) : null}
                  <div className="absolute flex flex-col items-center">
                    <Play size={64} className="text-white opacity-80 hover:opacity-100 cursor-pointer" 
                         onClick={isConnected ? toggleVideo : connectBluetooth} />
                    <p className="text-white mt-2">
                      {isConnected ? 'Click to play' : 'Connect device to play'}
                    </p>
                  </div>
                </div>
              )}
              
              {isVideoPlaying && videoProgress > 0 && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-3">
              {isConnected ? (
                <>
                  <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md flex items-center">
                    <BluetoothConnected size={18} className="mr-2" />
                    <span>Connected to: {connectedDevice}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={toggleVideo} 
                      className="flex-1"
                      variant={isVideoPlaying ? "outline" : "default"}
                    >
                      {isVideoPlaying ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Play
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={toggleMute}
                      variant="outline"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button 
                      onClick={disconnectBluetooth}
                      variant="destructive"
                    >
                      <BluetoothOff className="mr-2 h-4 w-4" />
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <Button 
                  onClick={connectBluetooth} 
                  disabled={isConnecting}
                  className="w-full"
                >
                  <Bluetooth className="mr-2 h-4 w-4" />
                  {isConnecting ? "Connecting..." : "Connect Bluetooth Device"}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
