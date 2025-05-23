
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User, Settings, LogOut, NotebookPen, Plus, Save,
  Edit2, Trash, UserCircle2, SlidersHorizontal, BellRing,
  Upload, Loader2
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, logout, updateUserHealthInfo } = useAuth();
  const { notes, addNote, deleteNote, isLoading: notesLoading } = useFitness();
  
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Fetch profile image on component mount
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user) {
        try {
          const { data: { publicUrl } } = supabase
            .storage
            .from('food_images')
            .getPublicUrl(`profile/${user.id}`);
            
          // Check if the image exists
          const checkImage = new Image();
          checkImage.onload = () => setProfileImage(publicUrl);
          checkImage.onerror = () => setProfileImage(null);
          checkImage.src = publicUrl;
        } catch (error) {
          console.error('Error fetching profile image:', error);
          setProfileImage(null);
        }
      }
    };
    
    fetchProfileImage();
  }, [user]);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) {
      return;
    }
    
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `profile/${user.id}`;
      
      const { error } = await supabase.storage
        .from('food_images')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase
        .storage
        .from('food_images')
        .getPublicUrl(fileName);
        
      setProfileImage(publicUrl);
      toast.success('Profile image updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }
  
  const handleAddNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }
    
    await addNote({
      title: noteTitle,
      content: noteContent,
      date: new Date().toISOString(),
    });
    
    setNoteTitle('');
    setNoteContent('');
    setAddNoteDialogOpen(false);
  };
  
  const userHealthInfo = user.healthInfo || {
    height: 0,
    weight: 0,
    goal: 'maintain',
    dietPreference: 'nonveg',
    activityLevel: 'moderate',
    allergies: []
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };
  
  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      {/* User Profile Card */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              {profileImage ? (
                <AvatarImage src={profileImage} />
              ) : (
                <AvatarFallback className="text-2xl bg-fitness-primary text-white">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <label 
              htmlFor="profileImageUpload" 
              className="absolute -bottom-2 -right-2 bg-fitness-primary text-white p-1 rounded-full cursor-pointer"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            </label>
            <input 
              id="profileImageUpload" 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="flex items-center gap-1">
            <UserCircle2 size={14} />
            Health Info
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-1">
            <NotebookPen size={14} />
            Notes
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings size={14} />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-6">
          {/* Health Information */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Health Information</CardTitle>
              <CardDescription>Your personal health details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium">{userHealthInfo.height} cm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{userHealthInfo.weight} kg</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Goal</p>
                <p className="font-medium capitalize">{userHealthInfo.goal} weight</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Diet Preference</p>
                <p className="font-medium capitalize">
                  {userHealthInfo.dietPreference === 'nonveg' 
                    ? 'Non-Vegetarian' 
                    : userHealthInfo.dietPreference}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Activity Level</p>
                <p className="font-medium capitalize">{userHealthInfo.activityLevel}</p>
              </div>
              
              {userHealthInfo.allergies && userHealthInfo.allergies.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Allergies</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {userHealthInfo.allergies.map((allergy, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => toast.info('Health information edit feature coming soon!')}
              >
                <Edit2 size={16} className="mr-2" />
                Edit Health Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-6">
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-lg font-semibold">Your Notes</h2>
            <Dialog open={addNoteDialogOpen} onOpenChange={setAddNoteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="fitness-gradient">
                  <Plus size={16} className="mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Title
                    </label>
                    <Input
                      id="title"
                      placeholder="Note title"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium">
                      Content
                    </label>
                    <Textarea
                      id="content"
                      placeholder="Write your note here..."
                      rows={5}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddNote} className="fitness-gradient">
                    <Save size={16} className="mr-2" />
                    Save Note
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {notesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg mt-4">
              <NotebookPen className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">No notes yet</p>
              <Button 
                variant="link" 
                className="text-fitness-primary"
                onClick={() => setAddNoteDialogOpen(true)}
              >
                Add your first note
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-md">{note.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={async () => {
                          await deleteNote(note.id);
                          toast.success('Note deleted');
                        }}
                      >
                        <Trash size={16} className="text-red-500" />
                      </Button>
                    </div>
                    <CardDescription>
                      {formatDistanceToNow(new Date(note.date), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <SlidersHorizontal size={18} className="mr-2" />
                App Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Notifications</label>
                  <p className="text-xs text-gray-500">
                    Receive reminders and updates
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Dark Mode</label>
                  <p className="text-xs text-gray-500">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full border-gray-200"
                onClick={() => toast.info('Profile edit feature coming soon!')}
              >
                <User size={16} className="mr-2" />
                Edit Profile
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-gray-200"
                onClick={() => toast.info('Notification settings feature coming soon!')}
              >
                <BellRing size={16} className="mr-2" />
                Notification Settings
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Log Out
              </Button>
            </CardContent>
          </Card>
          
          <div className="text-center text-xs text-gray-500 mt-8">
            <p>FitFlow App v1.0</p>
            <p className="mt-1">© 2023 FitFlow Health & Fitness</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
