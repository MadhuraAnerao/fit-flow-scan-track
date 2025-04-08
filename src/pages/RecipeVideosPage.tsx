
import React, { useState, useEffect } from 'react';
import { BluetoothVideo } from '@/components/BluetoothVideo';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useShakeDetection } from '@/contexts/ShakeDetectionContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const videoData = [
  {
    id: 1,
    title: "Easy Chicken Stir Fry",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1603508102227-7e55dc53d69c?q=80&w=500",
    duration: "4:12",
    description: "Learn how to make this quick and delicious chicken stir fry in under 20 minutes."
  },
  {
    id: 2,
    title: "15-Minute HIIT Workout",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500",
    duration: "15:22",
    description: "A quick but effective high-intensity workout you can do anywhere."
  },
  {
    id: 3,
    title: "Healthy Breakfast Smoothie Bowl",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1591086432468-7b0a767afe5e?q=80&w=500",
    duration: "8:17",
    description: "Create a nutritious and delicious smoothie bowl that will give you energy all morning."
  },
  {
    id: 4,
    title: "Beginner's Guide to Yoga",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1588286840104-8957b019727f?q=80&w=500",
    duration: "22:05",
    description: "Start your yoga journey with these beginner-friendly poses and sequences."
  },
  {
    id: 5,
    title: "Healthy Dinner in 20 Minutes",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500",
    duration: "18:30",
    description: "Quick and nutritious dinner recipes perfect for busy weeknights."
  }
];

const RecipeVideosPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState(videoData);
  const { isTiltEnabled, toggleTiltDetection } = useShakeDetection();

  useEffect(() => {
    // Filter videos based on search query
    const filtered = videoData.filter(video => 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredVideos(filtered);
  }, [searchQuery]);

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-16">
      <section className="w-full fitness-gradient px-4 py-8 text-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Recipe Videos</h1>
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
            Connect your Bluetooth device to watch recipe tutorials
          </p>
        </div>
      </section>

      <section className="px-4 py-6 -mt-5">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg">Search Videos</CardTitle>
            <CardDescription>
              Find recipe videos or fitness tutorials
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
          Tilt your device or take steps to receive health reminders. Connect Bluetooth devices to enjoy audio through speakers or headphones.
        </p>
      </section>
    </div>
  );
};

export default RecipeVideosPage;
