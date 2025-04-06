import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFitness } from '../contexts/FitnessContext';
import { useShakeDetection } from '../contexts/ShakeDetectionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { 
  LineChart, UtensilsCrossed, QrCode, 
  Camera, RefreshCw, TrendingUp, Award, Heart 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const motivationalQuotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "Don't wish for it, work for it.",
  "Strength does not come from the body. It comes from the will.",
  "You don't have to be extreme, just consistent.",
  "Good things come to those who sweat.",
  "Fitness is not about being better than someone else, it's about being better than you used to be.",
  "If it doesn't challenge you, it doesn't change you."
];

const HomePage = () => {
  const { user } = useAuth();
  const { isShakeEnabled, toggleShakeDetection } = useShakeDetection();
  const { 
    getTotalCaloriesForDay, 
    getTotalCaloriesBurnedForDay, 
    getNetCaloriesForDay 
  } = useFitness();
  
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const getCalorieGoal = () => {
    if (!user?.healthInfo) return 2000;
    
    const baseCalories = user.healthInfo.weight && user.healthInfo.weight < 70 ? 1800 : 2200;
    
    switch (user.healthInfo.goal) {
      case 'gain':
        return baseCalories + 300;
      case 'loss':
        return baseCalories - 300;
      default:
        return baseCalories;
    }
  };
  
  const calorieGoal = getCalorieGoal();
  const caloriesConsumed = getTotalCaloriesForDay(today);
  const caloriesBurned = getTotalCaloriesBurnedForDay(today);
  const netCalories = getNetCaloriesForDay(today);
  
  const calorieProgress = Math.min(Math.round((caloriesConsumed / calorieGoal) * 100), 100);
  
  const handleRefreshQuote = () => {
    const newIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[newIndex]);
    toast.success("New inspiration loaded!");
  };
  
  return (
    <div className="w-full min-h-screen bg-gray-50 pb-16">
      <section className="w-full fitness-gradient px-4 py-8 text-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {loading ? 'Loading...' : `Hi, ${user?.name?.split(' ')[0] || 'there'}!`}
            </h1>
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-white/20 hover:bg-white/30"
              onClick={toggleShakeDetection}
            >
              {isShakeEnabled ? 'Shake: ON' : 'Shake: OFF'}
            </Button>
          </div>
          <p className="mt-2 opacity-90">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          
          <Card className="mt-6 bg-white/10 border-none text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Today's Progress</p>
                  <h3 className="text-2xl font-bold mt-1">{caloriesConsumed} / {calorieGoal}</h3>
                  <p className="text-sm mt-1">Calories consumed</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="text-xl font-bold">{calorieProgress}%</span>
                </div>
              </div>
              
              <Progress value={calorieProgress} className="h-2 mt-4 bg-white/30" />
              
              <div className="flex justify-between mt-4 text-sm">
                <div>
                  <p>Burned</p>
                  <p className="font-semibold">{caloriesBurned} cal</p>
                </div>
                <div>
                  <p>Net</p>
                  <p className="font-semibold">{netCalories} cal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="px-4 py-6 -mt-5">
        <div className="grid grid-cols-4 gap-3">
          <Link to="/qr-scanner" className="flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow-sm">
            <QrCode size={24} className="text-fitness-primary" />
            <span className="text-xs mt-1">QR Scan</span>
          </Link>
          <Link to="/camera" className="flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow-sm">
            <Camera size={24} className="text-fitness-primary" />
            <span className="text-xs mt-1">Camera</span>
          </Link>
          <Link to="/recipes" className="flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow-sm">
            <UtensilsCrossed size={24} className="text-fitness-primary" />
            <span className="text-xs mt-1">Recipes</span>
          </Link>
          <Link to="/calories" className="flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow-sm">
            <LineChart size={24} className="text-fitness-primary" />
            <span className="text-xs mt-1">Calories</span>
          </Link>
        </div>
      </section>
      
      <section className="px-4 py-2">
        <Card className="fitness-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-lg flex items-center">
              <Heart className="mr-2 text-red-500" size={20} />
              Daily Motivation
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleRefreshQuote}
            >
              <RefreshCw size={16} />
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <blockquote className="italic text-gray-700 border-l-4 border-fitness-primary pl-4 py-2">
              "{quote}"
            </blockquote>
          </CardContent>
        </Card>
      </section>
      
      <section className="px-4 py-4">
        <h2 className="text-xl font-semibold mb-4">Features to Explore</h2>
        
        <div className="grid grid-cols-1 gap-4">
          <Link to="/qr-scanner">
            <Card className="fitness-card hover:shadow-md transition-all duration-300">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-fitness-light p-3 mr-4">
                  <QrCode className="text-fitness-primary" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">QR Code Scanner</h3>
                  <p className="text-sm text-gray-500">Scan QR codes for health tips</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/calories">
            <Card className="fitness-card hover:shadow-md transition-all duration-300">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-fitness-light p-3 mr-4">
                  <TrendingUp className="text-fitness-primary" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Calorie Tracking</h3>
                  <p className="text-sm text-gray-500">Monitor your daily calorie intake</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/recipes">
            <Card className="fitness-card hover:shadow-md transition-all duration-300">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-fitness-light p-3 mr-4">
                  <UtensilsCrossed className="text-fitness-primary" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Recipes</h3>
                  <p className="text-sm text-gray-500">Discover healthy meal ideas</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/profile">
            <Card className="fitness-card hover:shadow-md transition-all duration-300">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-fitness-light p-3 mr-4">
                  <Award className="text-fitness-primary" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Your Profile</h3>
                  <p className="text-sm text-gray-500">View your stats and achievements</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
      
      <section className="px-4 py-4 mb-16">
        <p className="text-center text-xs text-gray-500">
          FitFlow v1.0 • Remember to shake your device for surprise navigation!
        </p>
      </section>
    </div>
  );
};

export default HomePage;
