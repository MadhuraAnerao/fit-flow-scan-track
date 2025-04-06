
import React, { useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { useFitness } from '../contexts/FitnessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Plus, Flame, Calendar, Trash2, ArrowRight, 
  CalendarDays, Dumbbell, PieChart, BarChart, TrendingUp
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CalorieTrackingPage: React.FC = () => {
  const { 
    calorieEntries, 
    activityEntries, 
    addCalorieEntry, 
    addActivityEntry, 
    deleteCalorieEntry, 
    deleteActivityEntry,
    getTotalCaloriesForDay,
    getTotalCaloriesBurnedForDay,
    getNetCaloriesForDay,
    getWeeklyCalorieSummary
  } = useFitness();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTab, setSelectedTab] = useState('daily');
  
  // New entry form states
  const [newFood, setNewFood] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [activityName, setActivityName] = useState('');
  const [activityDuration, setActivityDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false);
  const [addActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  
  // Calculate weekly dates
  const startOfCurrentWeek = startOfWeek(new Date());
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    return format(addDays(startOfCurrentWeek, i), 'yyyy-MM-dd');
  });
  
  const dailyCalorieEntries = calorieEntries.filter(
    entry => entry.date.startsWith(selectedDate)
  );
  
  const dailyActivityEntries = activityEntries.filter(
    entry => entry.date.startsWith(selectedDate)
  );
  
  const handleAddFood = () => {
    if (!newFood || !foodCalories) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    addCalorieEntry({
      date: new Date().toISOString(),
      mealType,
      foodName: newFood,
      calories: parseInt(foodCalories)
    });
    
    toast.success('Food added successfully!');
    setNewFood('');
    setFoodCalories('');
    setAddFoodDialogOpen(false);
  };
  
  const handleAddActivity = () => {
    if (!activityName || !activityDuration || !caloriesBurned) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    addActivityEntry({
      date: new Date().toISOString(),
      activityType: activityName,
      duration: parseInt(activityDuration),
      caloriesBurned: parseInt(caloriesBurned)
    });
    
    toast.success('Activity added successfully!');
    setActivityName('');
    setActivityDuration('');
    setCaloriesBurned('');
    setAddActivityDialogOpen(false);
  };
  
  const calorieGoal = 2000; // In a real app, this would be based on user settings
  const caloriesConsumed = getTotalCaloriesForDay(selectedDate);
  const caloriesBurned = getTotalCaloriesBurnedForDay(selectedDate);
  const netCalories = getNetCaloriesForDay(selectedDate);
  
  const calorieProgress = Math.min(Math.round((caloriesConsumed / calorieGoal) * 100), 100);
  
  // Weekly data for chart
  const weeklyData = getWeeklyCalorieSummary();
  
  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Calorie Tracking</h1>
      
      <Tabs 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="w-full mb-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Calendar size={16} />
            Daily View
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <CalendarDays size={16} />
            Weekly Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          {/* Date Selector */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedDate(today)}
            >
              Today
            </Button>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-fitness-light">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Consumed</p>
                <p className="text-xl font-bold">{caloriesConsumed}</p>
                <p className="text-xs">calories</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Burned</p>
                <p className="text-xl font-bold">{caloriesBurned}</p>
                <p className="text-xs">calories</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Net</p>
                <p className="text-xl font-bold">{netCalories}</p>
                <p className="text-xs">calories</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Progress Bar */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Daily Calorie Goal</span>
                <span className="text-fitness-primary">{caloriesConsumed} / {calorieGoal}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full fitness-gradient rounded-full"
                  style={{ width: `${calorieProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0</span>
                <span>{calorieGoal}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Food Entries */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Flame size={18} className="mr-2 text-fitness-primary" />
                Food Log
              </h2>
              
              <Dialog open={addFoodDialogOpen} onOpenChange={setAddFoodDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="fitness-gradient"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Food
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Food Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Food Name</Label>
                      <Input 
                        placeholder="e.g., Apple, Chicken Salad" 
                        value={newFood}
                        onChange={(e) => setNewFood(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Calories</Label>
                      <Input 
                        type="number" 
                        placeholder="e.g., 250" 
                        value={foodCalories}
                        onChange={(e) => setFoodCalories(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meal Type</Label>
                      <Select 
                        value={mealType} 
                        onValueChange={(value: any) => setMealType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddFood}>Add Food</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {dailyCalorieEntries.length === 0 ? (
              <div className="text-center py-4 border border-dashed rounded-lg">
                <p className="text-gray-500">No food entries for this day</p>
                <Button 
                  variant="link" 
                  className="text-fitness-primary"
                  onClick={() => setAddFoodDialogOpen(true)}
                >
                  Add your first meal
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyCalorieEntries.map((entry) => (
                  <Card key={entry.id} className="overflow-hidden">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-10 self-stretch ${
                          entry.mealType === 'breakfast' ? 'bg-yellow-400' :
                          entry.mealType === 'lunch' ? 'bg-green-400' :
                          entry.mealType === 'dinner' ? 'bg-blue-400' :
                          'bg-purple-400'
                        }`}></div>
                        <div>
                          <p className="font-medium">{entry.foodName}</p>
                          <p className="text-xs text-gray-500 capitalize">{entry.mealType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.calories} cal</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            deleteCalorieEntry(entry.id);
                            toast.success('Food entry deleted');
                          }}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Activities */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Dumbbell size={18} className="mr-2 text-fitness-primary" />
                Activity Log
              </h2>
              
              <Dialog open={addActivityDialogOpen} onOpenChange={setAddActivityDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="fitness-gradient"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Activity
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Activity</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Activity Name</Label>
                      <Input 
                        placeholder="e.g., Running, Yoga" 
                        value={activityName}
                        onChange={(e) => setActivityName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input 
                        type="number" 
                        placeholder="e.g., 30" 
                        value={activityDuration}
                        onChange={(e) => setActivityDuration(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Calories Burned</Label>
                      <Input 
                        type="number" 
                        placeholder="e.g., 150" 
                        value={caloriesBurned}
                        onChange={(e) => setCaloriesBurned(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddActivity}>Add Activity</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {dailyActivityEntries.length === 0 ? (
              <div className="text-center py-4 border border-dashed rounded-lg">
                <p className="text-gray-500">No activities for this day</p>
                <Button 
                  variant="link" 
                  className="text-fitness-primary"
                  onClick={() => setAddActivityDialogOpen(true)}
                >
                  Add your first activity
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyActivityEntries.map((entry) => (
                  <Card key={entry.id} className="overflow-hidden">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-10 self-stretch bg-red-400"></div>
                        <div>
                          <p className="font-medium">{entry.activityType}</p>
                          <p className="text-xs text-gray-500">{entry.duration} min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">-{entry.caloriesBurned} cal</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            deleteActivityEntry(entry.id);
                            toast.success('Activity deleted');
                          }}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="weekly">
          <div className="space-y-6">
            {/* Weekly Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart size={18} className="mr-2 text-fitness-primary" />
                  Weekly Calorie Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={weeklyData}
                      margin={{
                        top: 5,
                        right: 5,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="intake" name="Calories In" fill="#2DD4BF" />
                      <Bar dataKey="burned" name="Calories Burned" fill="#F87171" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Weekly Overview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp size={18} className="mr-2 text-fitness-primary" />
                  Weekly Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weekDates.map((date, index) => {
                    const formattedDate = format(new Date(date), 'EEE, MMM d');
                    const dayCalories = getTotalCaloriesForDay(date);
                    const dayBurned = getTotalCaloriesBurnedForDay(date);
                    const dayNet = getNetCaloriesForDay(date);
                    const isToday = date === today;
                    
                    return (
                      <div 
                        key={date} 
                        className={`p-3 rounded-lg ${
                          isToday ? 'bg-fitness-light' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {isToday && (
                              <div className="w-2 h-2 rounded-full bg-fitness-primary mr-2"></div>
                            )}
                            <span className={isToday ? 'font-semibold' : ''}>{formattedDate}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setSelectedDate(date)}
                          >
                            <ArrowRight size={14} />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                          <div>
                            <p className="text-gray-500">In</p>
                            <p>{dayCalories}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Burned</p>
                            <p>{dayBurned}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Net</p>
                            <p>{dayNet}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalorieTrackingPage;
