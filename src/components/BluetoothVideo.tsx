
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothOff, 
  Video,
  VideoOff
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
  const [isBluetoothAvailable, setIsBluetoothAvailable] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  // Check if Bluetooth is available in the browser
  useEffect(() => {
    if (navigator.bluetooth) {
      setIsBluetoothAvailable(true);
    } else {
      setIsBluetoothAvailable(false);
    }
  }, []);

  // Setup video element ref
  useEffect(() => {
    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
      }
    };
  }, [videoElement]);

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
    setIsConnected(false);
    setConnectedDevice(null);
    if (videoElement) {
      videoElement.pause();
      setIsVideoPlaying(false);
    }
    toast.info("Disconnected from Bluetooth device");
  };

  // Toggle video playback
  const toggleVideo = () => {
    if (!isConnected) {
      toast.error("Please connect to a Bluetooth device first");
      return;
    }
    
    if (videoElement) {
      if (isVideoPlaying) {
        videoElement.pause();
        toast.info("Paused video playback");
      } else {
        videoElement.play()
          .then(() => {
            toast.success(`Playing audio through ${connectedDevice || 'Bluetooth device'}`);
          })
          .catch(error => {
            console.error('Video playback error:', error);
            toast.error("Failed to play video. Please try again.");
          });
      }
      setIsVideoPlaying(!isVideoPlaying);
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
              {isVideoPlaying ? (
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full h-full object-cover"
                  autoPlay
                  ref={ref => setVideoElement(ref)}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-800">
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt={videoTitle} 
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : null}
                  <div className="absolute text-center">
                    <VideoOff size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-300">
                      {isConnected ? 'Click play to start' : 'Connect to a Bluetooth device'}
                    </p>
                  </div>
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
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={toggleVideo} 
                      className="flex-1"
                      variant={isVideoPlaying ? "outline" : "default"}
                    >
                      {isVideoPlaying ? (
                        <>
                          <VideoOff className="mr-2 h-4 w-4" />
                          Pause Video
                        </>
                      ) : (
                        <>
                          <Video className="mr-2 h-4 w-4" />
                          Play Video
                        </>
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
