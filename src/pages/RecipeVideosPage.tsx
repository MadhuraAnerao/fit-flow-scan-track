
import React, { useState, useEffect } from 'react';
import { BluetoothVideo } from '@/components/BluetoothVideo';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useShakeDetection } from '@/contexts/ShakeDetectionContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChefHat, Headphones, PhoneCall, RotateCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

const videoData = [
  {
    id: 1,
    title: "Easy Chicken Stir Fry Recipe",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1603508102227-7e55dc53d69c?q=80&w=500",
    duration: "4:12",
    description: "Learn how to make this quick and delicious chicken stir fry in under 20 minutes with simple ingredients."
  },
  {
    id: 2,
    title: "15-Minute HIIT Workout for Weight Loss",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500",
    duration: "15:22",
    description: "A quick but effective high-intensity workout designed to boost metabolism and burn calories."
  },
  {
    id: 3,
    title: "Anti-Inflammatory Smoothie Bowl Recipe",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1591086432468-7b0a767afe5e?q=80&w=500",
    duration: "8:17",
    description: "Create a nutritious and anti-inflammatory smoothie bowl that will boost your immune system and fight inflammation."
  },
  {
    id: 4,
    title: "Yoga for Better Digestion",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1588286840104-8957b019727f?q=80&w=500",
    duration: "22:05",
    description: "Gentle yoga poses to improve digestion, reduce bloating and enhance your overall gut health."
  },
  {
    id: 5,
    title: "Mediterranean Diet 101: Healthy Dinner Ideas",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500",
    duration: "18:30",
    description: "Learn the basics of the heart-healthy Mediterranean diet with these simple dinner recipes."
  },
  {
    id: 6,
    title: "Meal Prep for Busy Week: Healthy Lunch Ideas",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500",
    duration: "12:45",
    description: "Prep 5 healthy lunches in under an hour to stay on track with your nutrition goals all week."
  },
  {
    id: 7,
    title: "Low-Impact Cardio Workout for Beginners",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=500",
    duration: "25:10",
    description: "A gentle cardio workout that's easy on the joints but effective for cardiovascular health and weight management."
  }
];

const RecipeVideosPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState(videoData);
  const { isTiltEnabled, toggleTiltDetection } = useShakeDetection();
  const [showBluetoothInfo, setShowBluetoothInfo] = useState(true);

  useEffect(() => {
    // Filter videos based on search query
    const filtered = videoData.filter(video => 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredVideos(filtered);
  }, [searchQuery]);
  
  const dismissBluetoothInfo = () => {
    setShowBluetoothInfo(false);
    localStorage.setItem('bluetoothInfoDismissed', 'true');
  };
  
  useEffect(() => {
    const dismissed = localStorage.getItem('bluetoothInfoDismissed') === 'true';
    setShowBluetoothInfo(!dismissed);
  }, []);
  
  const handleRotateDevice = () => {
    toast.info("Rotate your device for a better viewing experience", {
      description: "Turn your phone to landscape mode to enjoy videos in fullscreen",
      duration: 4000
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-16">
      <section className="w-full fitness-gradient px-4 py-8 text-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Recipe & Health Videos</h1>
            <div className="flex items-center space-x-2">
              <Switch 
                id="tilt-mode"
                checked={isTiltEnabled}
                onCheckedChange={toggleTiltDetection}
              />
              <Label htmlFor="tilt-mode" className="text-white text-sm">
                Tilt Detection
              </Label>
            </div>
          </div>
          <p className="opacity-90">
            Stream audio to your Bluetooth speakers or headphones
          </p>
          <div className="flex items-center mt-2 text-sm">
            <Headphones className="h-4 w-4 mr-1" />
            <span>Connect your device to listen through Bluetooth</span>
          </div>
        </div>
      </section>

      {showBluetoothInfo && (
        <section className="px-4 py-2">
          <Alert className="bg-blue-50 border-blue-200">
            <PhoneCall className="h-4 w-4" />
            <AlertTitle>Bluetooth Audio Support</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                Connect your Bluetooth headphones or speakers to stream audio. This feature works best on Chrome browser on Android, macOS, or Windows devices. Due to browser limitations, not all devices may connect successfully.
              </p>
              <div className="flex justify-between items-center mt-4">
                <Button onClick={handleRotateDevice} size="sm" variant="outline" className="text-xs">
                  <RotateCw className="h-3 w-3 mr-1" />
                  Rotate for fullscreen
                </Button>
                <Button onClick={dismissBluetoothInfo} size="sm" variant="outline" className="text-xs">
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </section>
      )}

      <section className="px-4 py-6 -mt-5">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg">Search Videos</CardTitle>
            <CardDescription>
              Find nutrition videos, recipes, or fitness tutorials
            </CardDescription>
            <Input 
              placeholder="Search videos..." 
              className="mt-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardHeader>
        </Card>
      </section>

      <section className="px-4 py-4">
        <Link to="/recipes" className="block w-full mb-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 border-fitness-primary text-fitness-primary hover:bg-fitness-primary/10"
          >
            <ChefHat className="h-4 w-4" />
            View All Recipes with Nutritional Info
          </Button>
        </Link>
      </section>

      <section className="px-4 py-2">
        <div className="grid gap-4">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <BluetoothVideo
                key={video.id}
                videoUrl={video.url}
                videoTitle={video.title}
                videoDuration={video.duration}
                videoDescription={video.description}
                thumbnailUrl={video.thumbnailUrl}
              />
            ))
          ) : (
            <p className="text-center py-8 text-gray-500">
              No videos found matching your search.
            </p>
          )}
        </div>
      </section>

      <section className="px-4 py-4 mb-16">
        <p className="text-center text-xs text-gray-500">
          Connect your Bluetooth devices to enjoy video content through your paired speakers or headphones.
          <br />Tilt your device or press the 'T' key on desktop to see health tips.
          <br />Shake your device or press the 'S' key on desktop for navigation shortcuts.
        </p>
      </section>
    </div>
  );
};

export default RecipeVideosPage;
