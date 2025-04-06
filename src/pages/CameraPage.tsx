
import React, { useState, useEffect } from 'react';
import { Camera as CameraPlugin, CameraResultType, CameraSource } from '@capacitor/camera';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, Upload, Image as ImageIcon, X, Save, Share2 } from 'lucide-react';

const CameraPage: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const takePicture = async () => {
    try {
      setLoading(true);
      const image = await CameraPlugin.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      
      if (image.webPath) {
        setPhotos(prev => [image.webPath, ...prev]);
        toast.success('Photo captured!');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      toast.error('Failed to capture photo');
    } finally {
      setLoading(false);
    }
  };
  
  const selectFromGallery = async () => {
    try {
      setLoading(true);
      const image = await CameraPlugin.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      
      if (image.webPath) {
        setPhotos(prev => [image.webPath, ...prev]);
        toast.success('Photo added from gallery!');
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      toast.error('Failed to select photo');
    } finally {
      setLoading(false);
    }
  };
  
  const deletePhoto = (photoToDelete: string) => {
    setPhotos(photos.filter(photo => photo !== photoToDelete));
    if (selectedPhoto === photoToDelete) {
      setSelectedPhoto(null);
    }
    toast.success('Photo deleted');
  };
  
  // Simulate saving the photo (in a real app, this would save to a server or database)
  const savePhoto = (photo: string) => {
    toast.success('Photo saved to your collection!');
  };
  
  // Simulate sharing the photo
  const sharePhoto = async (photo: string) => {
    try {
      toast.success('Sharing feature would open here');
      // In a real app, we would use a sharing API
    } catch (error) {
      toast.error('Failed to share image');
    }
  };
  
  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Food Camera</h1>
      
      {/* Camera buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button 
          onClick={takePicture} 
          disabled={loading}
          className="fitness-gradient"
        >
          <Camera className="mr-2" size={18} />
          Take Photo
        </Button>
        <Button 
          variant="outline" 
          onClick={selectFromGallery} 
          disabled={loading}
        >
          <Upload className="mr-2" size={18} />
          Upload
        </Button>
      </div>
      
      {loading && (
        <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-6">
          <div className="animate-pulse">Loading...</div>
        </div>
      )}
      
      {/* Selected photo view */}
      {selectedPhoto && (
        <Card className="mb-6">
          <CardContent className="p-3">
            <div className="relative">
              <img 
                src={selectedPhoto} 
                alt="Selected food" 
                className="w-full h-auto rounded-lg"
              />
              <Button 
                variant="destructive" 
                size="sm"
                className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full"
                onClick={() => setSelectedPhoto(null)}
              >
                <X size={16} />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => savePhoto(selectedPhoto)}
              >
                <Save size={16} className="mr-2" /> Save to Collection
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => sharePhoto(selectedPhoto)}
              >
                <Share2 size={16} className="mr-2" /> Share Recipe
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Photo gallery */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Food Photos</h2>
        
        {photos.length === 0 ? (
          <div className="bg-gray-100 rounded-lg h-48 flex flex-col items-center justify-center">
            <ImageIcon size={32} className="text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">No photos yet</p>
            <p className="text-gray-400 text-xs mt-2">Take a photo of your meal to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div 
                key={index} 
                className="relative aspect-square overflow-hidden rounded-lg"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo} 
                  alt={`Food ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="absolute top-1 right-1 w-6 h-6 p-0 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhoto(photo);
                  }}
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <p className="text-center text-xs text-gray-500">
          Take photos of your meals to keep track of what you eat or to share recipe ideas with friends.
        </p>
      </div>
    </div>
  );
};

export default CameraPage;
