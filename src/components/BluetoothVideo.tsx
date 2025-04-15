
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothOff, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Plus,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Add TypeScript interfaces for Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
      getAvailability(): Promise<boolean>;
    };
  }

  interface BluetoothDevice {
    name: string | null;
    id?: string;
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
    filters?: Array<{ services?: string[], name?: string, namePrefix?: string }>;
    optionalServices?: string[];
  }

  interface BluetoothRemoteGATTServer {
    connected: boolean;
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

interface KnownDevice {
  name: string;
  id?: string;
}

export const BluetoothVideo: React.FC<BluetoothVideoProps> = ({
  videoUrl,
  videoTitle,
  videoDuration,
  videoDescription,
  thumbnailUrl
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBluetoothAvailable, setIsBluetoothAvailable] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [currentBluetoothDevice, setCurrentBluetoothDevice] = useState<BluetoothDevice | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [knownDevices, setKnownDevices] = useState<KnownDevice[]>(() => {
    const saved = localStorage.getItem('knownBluetoothDevices');
    return saved ? JSON.parse(saved) : [];
  });
  const [newDeviceName, setNewDeviceName] = useState<string>('');
  const [isAddingDevice, setIsAddingDevice] = useState<boolean>(false);

  // Check if Bluetooth is available in the browser
  useEffect(() => {
    const checkBluetoothAvailability = async () => {
      if (navigator.bluetooth) {
        try {
          // Check if Bluetooth is available on this device
          const isAvailable = await navigator.bluetooth.getAvailability();
          setIsBluetoothAvailable(isAvailable);
          
          if (isAvailable) {
            console.log("Bluetooth is available on this device");
          } else {
            console.log("Bluetooth is not available on this device");
          }
        } catch (error) {
          console.error("Error checking Bluetooth availability:", error);
          setIsBluetoothAvailable(false);
        }
      } else {
        console.log("Web Bluetooth API is not supported in this browser");
        setIsBluetoothAvailable(false);
      }
    };
    
    checkBluetoothAvailability();
  }, []);

  // Save known devices to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('knownBluetoothDevices', JSON.stringify(knownDevices));
  }, [knownDevices]);

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
      
      const handlePlay = () => {
        setIsVideoPlaying(true);
      };
      
      const handlePause = () => {
        setIsVideoPlaying(false);
      };
      
      // Add event listeners
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      
      // Clean up
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, []);

  // Disconnect device when component unmounts
  useEffect(() => {
    return () => {
      if (currentBluetoothDevice?.gatt?.connected) {
        try {
          currentBluetoothDevice.gatt.disconnect();
        } catch (error) {
          console.error("Error disconnecting device:", error);
        }
      }
    };
  }, [currentBluetoothDevice]);

  const addKnownDevice = () => {
    if (newDeviceName.trim()) {
      setKnownDevices([...knownDevices, { name: newDeviceName.trim() }]);
      setNewDeviceName('');
      setIsAddingDevice(false);
      toast.success(`Added ${newDeviceName.trim()} to known devices`);
    }
  };

  const removeKnownDevice = (index: number) => {
    const updatedDevices = [...knownDevices];
    const removedDevice = updatedDevices[index];
    updatedDevices.splice(index, 1);
    setKnownDevices(updatedDevices);
    toast.info(`Removed ${removedDevice.name} from known devices`);
  };

  // Scan for available Bluetooth devices
  const scanForDevices = async () => {
    if (!navigator.bluetooth) {
      toast.error("Bluetooth not available on this device or browser");
      return;
    }

    try {
      setIsScanning(true);
      toast.info("Scanning for Bluetooth audio devices...");

      // Request a Bluetooth device that supports audio output
      const device = await navigator.bluetooth.requestDevice({
        // Accept all devices if we're just scanning
        acceptAllDevices: true,
        // Optionally filter for audio devices
        // filters: [
        //   { services: ['0000110b-0000-1000-8000-00805f9b34fb'] } // A2DP Source service
        // ],
        // Include audio services
        optionalServices: [
          '0000110b-0000-1000-8000-00805f9b34fb', // A2DP Source
          '0000110c-0000-1000-8000-00805f9b34fb', // A2DP Sink
          '0000110e-0000-1000-8000-00805f9b34fb', // AVRCP Target
          '0000111e-0000-1000-8000-00805f9b34fb'  // Handsfree
        ]
      });

      if (device) {
        // Add to known devices if not already there
        const deviceExists = knownDevices.some(d => 
          (d.id && d.id === device.id) || (d.name && d.name === device.name)
        );
        
        if (!deviceExists && device.name) {
          setKnownDevices(prev => [...prev, { 
            name: device.name || "Unknown Device", 
            id: device.id 
          }]);
          toast.success(`Added ${device.name} to your devices`);
        }
        
        // Try to connect to this device
        await connectToBluetoothDevice(device);
      }
    } catch (error) {
      console.error("Bluetooth scanning error:", error);
      toast.error("Failed to scan for Bluetooth devices. Make sure Bluetooth is enabled on your device.");
    } finally {
      setIsScanning(false);
    }
  };

  // Connect to a Bluetooth device by name
  const connectToDevice = async (deviceName: string) => {
    if (!navigator.bluetooth) {
      toast.error("Bluetooth not available on this device or browser");
      return;
    }

    try {
      setIsConnecting(true);
      toast.info(`Searching for ${deviceName}...`);

      // Request a Bluetooth device with the specific name
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: deviceName }],
        // Include audio services
        optionalServices: [
          '0000110b-0000-1000-8000-00805f9b34fb', // A2DP Source
          '0000110c-0000-1000-8000-00805f9b34fb', // A2DP Sink
          '0000110e-0000-1000-8000-00805f9b34fb', // AVRCP Target
          '0000111e-0000-1000-8000-00805f9b34fb'  // Handsfree
        ]
      });

      if (device) {
        await connectToBluetoothDevice(device);
      }
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      toast.error(`Failed to find or connect to ${deviceName}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect to a Bluetooth device object
  const connectToBluetoothDevice = async (device: BluetoothDevice) => {
    try {
      setIsConnecting(true);
      toast.info(`Connecting to ${device.name || 'device'}...`);

      // Set up disconnect listener
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setConnectedDevice(null);
        setCurrentBluetoothDevice(null);
        toast.error(`${device.name || 'Device'} disconnected`);
        
        if (videoRef.current && isVideoPlaying) {
          videoRef.current.pause();
          setIsVideoPlaying(false);
        }
      });

      // Try to connect to GATT server
      if (device.gatt) {
        const server = await device.gatt.connect();
        if (server.connected) {
          // If connection is successful
          setCurrentBluetoothDevice(device);
          setConnectedDevice(device.name || 'Unknown Device');
          setIsConnected(true);
          
          // If device has an ID and isn't already in known devices with that ID, update it
          if (device.id) {
            const existingDeviceIndex = knownDevices.findIndex(d => 
              (d.name === device.name) || (d.id && d.id === device.id)
            );
            
            if (existingDeviceIndex >= 0) {
              const updatedDevices = [...knownDevices];
              updatedDevices[existingDeviceIndex].id = device.id;
              updatedDevices[existingDeviceIndex].name = device.name || updatedDevices[existingDeviceIndex].name;
              setKnownDevices(updatedDevices);
            }
          }
          
          toast.success(`Connected to ${device.name || 'Bluetooth Device'}`);
        } else {
          throw new Error("Failed to establish connection");
        }
      } else {
        throw new Error("Device does not support GATT connection");
      }
    } catch (error) {
      console.error("Error connecting to device:", error);
      toast.error(`Failed to connect to ${device.name || 'device'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from Bluetooth device
  const disconnectBluetooth = () => {
    if (currentBluetoothDevice?.gatt) {
      try {
        currentBluetoothDevice.gatt.disconnect();
      } catch (error) {
        console.error("Error disconnecting:", error);
      }
    }
    
    if (videoRef.current && isVideoPlaying) {
      videoRef.current.pause();
    }
    
    setIsConnected(false);
    setConnectedDevice(null);
    setCurrentBluetoothDevice(null);
    setIsVideoPlaying(false);
    toast.info("Disconnected from Bluetooth device");
  };

  // Toggle video playback
  const toggleVideo = () => {
    if (!isConnected && videoRef.current) {
      // Allow playback even without Bluetooth for testing purposes
      toast.info("Playing without Bluetooth connection");
      togglePlay();
      return;
    }
    
    // With Bluetooth connected
    togglePlay();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        toast.info("Paused video playback");
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => {
            const deviceName = connectedDevice || 'your device';
            toast.success(`Playing audio through ${deviceName}`);
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
              Try using Chrome on Android, macOS, or Windows for Bluetooth support.
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
                    <div 
                      className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition-colors"
                      onClick={toggleVideo}
                    >
                      <Play size={32} className="text-white ml-1" />
                    </div>
                    <p className="text-white mt-2 text-center px-4">
                      {isConnected ? 'Connected to ' + connectedDevice : 'Click to play'}
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
              <div className="flex justify-between gap-3">
                <Button 
                  onClick={scanForDevices} 
                  className="w-full" 
                  variant="outline"
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Bluetooth className="mr-2 h-4 w-4" />
                      Scan for Devices
                    </>
                  )}
                </Button>
                
                <Dialog open={isAddingDevice} onOpenChange={setIsAddingDevice}>
                  <DialogTrigger asChild>
                    <Button className="w-1/2" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Device
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Bluetooth Device</DialogTitle>
                      <DialogDescription>
                        Enter the name of your Bluetooth device to add it to your known devices list.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="device-name">Device Name</Label>
                      <Input 
                        id="device-name"
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        placeholder="e.g., My Bluetooth Speaker"
                        className="mt-2"
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setIsAddingDevice(false)} variant="outline">Cancel</Button>
                      <Button onClick={addKnownDevice} disabled={!newDeviceName.trim()}>Add Device</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {knownDevices.length > 0 ? (
                <div className="bg-gray-50 p-3 rounded-md mb-2">
                  <h3 className="text-sm font-medium mb-2">Your Paired Devices</h3>
                  <div className="space-y-2">
                    {knownDevices.map((device, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span>{device.name}</span>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => connectToDevice(device.name)}
                            disabled={isConnecting || (isConnected && connectedDevice === device.name)}
                            size="sm" 
                            variant={connectedDevice === device.name ? "outline" : "default"}
                          >
                            {isConnecting && connectedDevice !== device.name ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : connectedDevice === device.name ? (
                              'Connected'
                            ) : (
                              'Connect'
                            )}
                          </Button>
                          <Button 
                            onClick={() => removeKnownDevice(index)}
                            size="sm" 
                            variant="destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert className="mb-2">
                  <AlertTitle>No paired devices</AlertTitle>
                  <AlertDescription>
                    Scan for Bluetooth devices or add them manually using the buttons above.
                  </AlertDescription>
                </Alert>
              )}
              
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
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={toggleVideo}
                    className="w-full"
                    variant="outline"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Play Without Bluetooth
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    For best experience, connect to a Bluetooth audio device
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
