
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
    title: "Perfect Healthy Smoothie",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    duration: "3:45",
    description: "Learn how to make the perfect protein-packed smoothie for post-workout recovery."
  },
  {
    id: 2,
    title: "15-Minute HIIT Workout",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    duration: "15:22",
    description: "A quick but effective high-intensity workout you can do anywhere."
  },
  {
    id: 3,
    title: "Easy Meal Prep for the Week",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    duration: "8:17",
    description: "Prepare a week's worth of healthy meals in under an hour."
  },
  {
    id: 4,
    title: "Beginner's Guide to Yoga",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    duration: "22:05",
    description: "Start your yoga journey with these beginner-friendly poses."
  },
  {
    id: 5,
    title: "Healthy Dinner in 20 Minutes",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
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
