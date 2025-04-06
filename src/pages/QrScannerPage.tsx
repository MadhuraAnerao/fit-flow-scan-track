
import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Scan, Download, Copy, RefreshCw } from 'lucide-react';

// Health tips for QR code generation
const healthTips = [
  "Drink at least 8 glasses of water each day to stay hydrated.",
  "Aim for 7-9 hours of sleep every night for optimal recovery.",
  "Take short walking breaks every hour when sitting for long periods.",
  "Include a variety of colorful vegetables in your daily meals.",
  "Practice mindful eating by savoring each bite and avoiding distractions.",
  "Regular strength training helps maintain muscle mass and boosts metabolism.",
  "Consider adding more plant-based proteins to your diet for heart health.",
  "Stretching before bed can improve sleep quality and reduce muscle tension.",
  "Remember the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.",
  "Small changes add up - take the stairs instead of the elevator when possible.",
  "Meal prep on weekends can help you maintain healthy eating habits all week.",
  "A 10-minute morning meditation can reduce stress and improve focus throughout the day."
];

const QrScannerPage: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [scannedResult, setScannedResult] = useState('');
  const [activeTab, setActiveTab] = useState('scan');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  
  // Generate a random health tip when the component loads
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * healthTips.length);
    setQrCodeValue(healthTips[randomIndex]);
  }, []);
  
  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('reader');
      }
      
      setScanning(true);
      
      const qrCodeSuccessCallback = (decodedText: string) => {
        stopScanner();
        setScannedResult(decodedText);
        toast.success('QR code scanned successfully!');
      };
      
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        qrCodeSuccessCallback,
        undefined
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      toast.error('Failed to start camera. Please check permissions.');
      setScanning(false);
    }
  };
  
  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
    setScanning(false);
  };
  
  const generateNewQrCode = () => {
    const randomIndex = Math.floor(Math.random() * healthTips.length);
    setQrCodeValue(healthTips[randomIndex]);
    toast.success('New health tip QR code generated!');
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrCodeValue);
    toast.success('Health tip copied to clipboard!');
  };
  
  const downloadQrCode = () => {
    if (!qrContainerRef.current) return;
    
    const svg = qrContainerRef.current.querySelector('svg');
    if (!svg) return;
    
    // Create a canvas element to convert SVG to image
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context?.drawImage(img, 0, 0);
      
      // Create download link
      const a = document.createElement('a');
      a.download = 'health-tip-qr-code.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      
      toast.success('QR code downloaded!');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };
  
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);
  
  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6">QR Scanner</h1>
      
      <Tabs 
        defaultValue="scan" 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value);
          if (value === 'scan') {
            setScannedResult('');
          }
          if (scanning) {
            stopScanner();
          }
        }}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Scan size={16} />
            Scan QR Code
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <QRCode size={16} value="icon" />
            Generate QR
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Health Tip QR Code</CardTitle>
              <CardDescription>
                Position the QR code within the frame to scan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div 
                  id="reader" 
                  className={`w-full h-64 bg-gray-100 rounded-lg overflow-hidden ${
                    scanning ? '' : 'flex items-center justify-center'
                  }`}
                >
                  {!scanning && !scannedResult && (
                    <div className="text-gray-500 text-center p-4">
                      <QRCode value="Scan me" size={100} className="mx-auto mb-2 opacity-50" />
                      <p>Camera preview will appear here</p>
                    </div>
                  )}
                </div>
                
                {scanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-fitness-primary rounded-lg"></div>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                {!scanning && !scannedResult ? (
                  <Button 
                    onClick={startScanner} 
                    className="fitness-gradient w-full"
                  >
                    Start Scanning
                  </Button>
                ) : scanning ? (
                  <Button 
                    onClick={stopScanner} 
                    variant="outline" 
                    className="w-full"
                  >
                    Stop Scanner
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      setScannedResult('');
                      startScanner();
                    }} 
                    className="fitness-gradient w-full"
                  >
                    Scan Again
                  </Button>
                )}
              </div>
              
              {scannedResult && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Health Tip</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{scannedResult}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Health Tip QR Code</CardTitle>
              <CardDescription>
                Share this QR code to spread health awareness.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={qrContainerRef}
                className="p-4 bg-white rounded-lg flex items-center justify-center"
              >
                <QRCode 
                  value={qrCodeValue}
                  size={200}
                  className="mx-auto"
                />
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-sm mb-2">Health Tip:</h3>
                <p className="text-sm text-gray-700">{qrCodeValue}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-4">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={copyToClipboard}
                >
                  <Copy size={16} />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={downloadQrCode}
                >
                  <Download size={16} />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={generateNewQrCode}
                >
                  <RefreshCw size={16} />
                  New Tip
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <p className="text-center text-xs text-gray-500 mt-8">
        Scan any generated QR code to view the health tip. Generate your own codes to share with friends.
      </p>
    </div>
  );
};

export default QrScannerPage;
