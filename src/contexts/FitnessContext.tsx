
import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Define the type for a single calorie entry
type CalorieEntry = {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

// Define the type for an activity entry
type ActivityEntry = {
  id: string;
  date: string;
  activityType: string;
  duration: number;
  caloriesBurned: number;
};

// Define the type for a note
type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
};

// Define the type for fitness stats
type FitnessStats = {
  dailySteps: number;
  weeklySteps: number[];
  caloriesBurned: number;
  waterIntake: number;
  sleepHours: number;
  weight: number;
  weightHistory: { date: string; weight: number }[];
  weightGoal: number;
  calorieGoal: number;
  proteinGoal: number;
};

// Weekly data summary type
type WeeklySummary = {
  date: string;
  intake: number;
  burned: number;
};

// Define the type for the context
type FitnessContextType = {
  calorieEntries: CalorieEntry[];
  activityEntries: ActivityEntry[];
  notes: Note[];
  todaysEntries: CalorieEntry[];
  stats: FitnessStats;
  isLoading: boolean;
  totalCaloriesToday: number;
  totalProteinToday: number;
  totalCarbsToday: number;
  totalFatToday: number;
  remainingCalories: number;
  addCalorieEntry: (entry: Omit<CalorieEntry, 'id'>) => Promise<void>;
  removeCalorieEntry: (id: string) => void;
  deleteCalorieEntry: (id: string) => void;
  addActivityEntry: (entry: Omit<ActivityEntry, 'id'>) => Promise<void>;
  deleteActivityEntry: (id: string) => void;
  addNote: (note: Omit<Note, 'id'>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateWaterIntake: (amount: number) => void;
  updateDailySteps: (steps: number) => void;
  updateWeight: (weight: number) => void;
  updateCalorieGoal: (goal: number) => void;
  updateProteinGoal: (goal: number) => void;
  clearAllEntries: () => void;
  getTotalCaloriesForDay: (date: string) => number;
  getTotalCaloriesBurnedForDay: (date: string) => number;
  getNetCaloriesForDay: (date: string) => number;
  getWeeklyCalorieSummary: () => WeeklySummary[];
};

// Initialize default values for the context
const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

// Provider component
export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for calorie entries
  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>(() => {
    const storedEntries = localStorage.getItem('calorieEntries');
    return storedEntries ? JSON.parse(storedEntries) : [];
  });

  // State for activity entries
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>(() => {
    const storedActivities = localStorage.getItem('activityEntries');
    return storedActivities ? JSON.parse(storedActivities) : [];
  });

  // State for notes
  const [notes, setNotes] = useState<Note[]>(() => {
    const storedNotes = localStorage.getItem('fitnessNotes');
    return storedNotes ? JSON.parse(storedNotes) : [];
  });

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for fitness stats
  const [stats, setStats] = useState<FitnessStats>(() => {
    const storedStats = localStorage.getItem('fitnessStats');
    return storedStats ? JSON.parse(storedStats) : {
      dailySteps: 0,
      weeklySteps: Array(7).fill(0),
      caloriesBurned: 0,
      waterIntake: 0,
      sleepHours: 7,
      weight: 70,
      weightHistory: [],
      weightGoal: 65,
      calorieGoal: 2000,
      proteinGoal: 100,
    };
  });

  // Update localStorage when calorieEntries changes
  useEffect(() => {
    localStorage.setItem('calorieEntries', JSON.stringify(calorieEntries));
  }, [calorieEntries]);

  // Update localStorage when activityEntries changes
  useEffect(() => {
    localStorage.setItem('activityEntries', JSON.stringify(activityEntries));
  }, [activityEntries]);

  // Update localStorage when notes changes
  useEffect(() => {
    localStorage.setItem('fitnessNotes', JSON.stringify(notes));
  }, [notes]);

  // Update localStorage when stats changes
  useEffect(() => {
    localStorage.setItem('fitnessStats', JSON.stringify(stats));
  }, [stats]);

  // Get today's date in YYYY-MM-DD format
  const today = format(new Date(), 'yyyy-MM-dd');

  // Filter calorie entries for today
  const todaysEntries = calorieEntries.filter(entry => entry.date.startsWith(today));

  // Calculate total calories, protein, carbs, and fat for today
  const totalCaloriesToday = todaysEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const totalProteinToday = todaysEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
  const totalCarbsToday = todaysEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
  const totalFatToday = todaysEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0);

  // Calculate remaining calories for the day
  const remainingCalories = stats.calorieGoal - totalCaloriesToday;

  // Get total calories for a specific day
  const getTotalCaloriesForDay = (date: string): number => {
    return calorieEntries.filter(entry => entry.date.startsWith(date))
      .reduce((sum, entry) => sum + entry.calories, 0);
  };

  // Get total calories burned for a specific day
  const getTotalCaloriesBurnedForDay = (date: string): number => {
    return activityEntries.filter(entry => entry.date.startsWith(date))
      .reduce((sum, entry) => sum + entry.caloriesBurned, 0);
  };

  // Get net calories for a specific day
  const getNetCaloriesForDay = (date: string): number => {
    return getTotalCaloriesForDay(date) - getTotalCaloriesBurnedForDay(date);
  };

  // Get weekly calorie summary
  const getWeeklyCalorieSummary = (): WeeklySummary[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'yyyy-MM-dd');
    }).reverse();

    return last7Days.map(date => ({
      date: format(new Date(date), 'E'),
      intake: getTotalCaloriesForDay(date),
      burned: getTotalCaloriesBurnedForDay(date)
    }));
  };

  // Add a calorie entry
  const addCalorieEntry = async (entry: Omit<CalorieEntry, 'id'>) => {
    // Ensure mealType is one of the valid options
    const validMealType = (entry.mealType as string) === 'breakfast' || 
                          (entry.mealType as string) === 'lunch' || 
                          (entry.mealType as string) === 'dinner' || 
                          (entry.mealType as string) === 'snack' 
                        ? entry.mealType 
                        : 'snack';

    const newEntry: CalorieEntry = {
      id: Date.now().toString(),
      date: entry.date,
      mealType: validMealType,
      foodName: entry.foodName,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat
    };

    setCalorieEntries(prevEntries => [...prevEntries, newEntry]);
    toast.success(`Added ${entry.foodName} to tracking`);
  };

  // Remove a calorie entry
  const removeCalorieEntry = (id: string) => {
    setCalorieEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    toast.info('Calorie entry removed');
  };

  // Delete a calorie entry (alias for removeCalorieEntry)
  const deleteCalorieEntry = (id: string) => {
    removeCalorieEntry(id);
  };

  // Add an activity entry
  const addActivityEntry = async (entry: Omit<ActivityEntry, 'id'>) => {
    const newEntry: ActivityEntry = {
      id: Date.now().toString(),
      date: entry.date,
      activityType: entry.activityType,
      duration: entry.duration,
      caloriesBurned: entry.caloriesBurned
    };

    setActivityEntries(prevEntries => [...prevEntries, newEntry]);
    toast.success(`Added ${entry.activityType} activity`);
  };

  // Delete an activity entry
  const deleteActivityEntry = (id: string) => {
    setActivityEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    toast.info('Activity entry removed');
  };

  // Add a note
  const addNote = async (note: Omit<Note, 'id'>) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: note.title,
      content: note.content,
      date: note.date
    };

    setNotes(prevNotes => [...prevNotes, newNote]);
    toast.success('Note added successfully');
  };

  // Delete a note
  const deleteNote = async (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    toast.info('Note removed');
  };

  // Update water intake
  const updateWaterIntake = (amount: number) => {
    setStats(prevStats => ({ ...prevStats, waterIntake: amount }));
  };

  // Update daily steps
  const updateDailySteps = (steps: number) => {
    setStats(prevStats => ({ ...prevStats, dailySteps: steps }));
  };

  // Update weight
  const updateWeight = (weight: number) => {
    // Get today's date in YYYY-MM-DD format
    const today = format(new Date(), 'yyyy-MM-dd');

    // Check if there's already a weight entry for today
    const existingEntryIndex = stats.weightHistory.findIndex(entry => entry.date === today);

    if (existingEntryIndex !== -1) {
      // Update the existing entry
      const newWeightHistory = [...stats.weightHistory];
      newWeightHistory[existingEntryIndex] = { date: today, weight: weight };

      setStats(prevStats => ({
        ...prevStats,
        weight: weight,
        weightHistory: newWeightHistory
      }));
    } else {
      // Add a new weight entry
      setStats(prevStats => ({
        ...prevStats,
        weight: weight,
        weightHistory: [...prevStats.weightHistory, { date: today, weight: weight }]
      }));
    }
    toast.success('Weight updated successfully!');
  };

  // Update calorie goal
  const updateCalorieGoal = (goal: number) => {
    setStats(prevStats => ({ ...prevStats, calorieGoal: goal }));
    toast.success('Calorie goal updated!');
  };

  // Update protein goal
  const updateProteinGoal = (goal: number) => {
    setStats(prevStats => ({ ...prevStats, proteinGoal: goal }));
    toast.success('Protein goal updated!');
  };

  // Clear all calorie entries
  const clearAllEntries = () => {
    setCalorieEntries([]);
    toast.warning('All calorie entries cleared');
  };

  // Value for the context provider
  const value: FitnessContextType = {
    calorieEntries,
    activityEntries,
    notes,
    todaysEntries,
    stats,
    isLoading,
    totalCaloriesToday,
    totalProteinToday,
    totalCarbsToday,
    totalFatToday,
    remainingCalories,
    addCalorieEntry,
    removeCalorieEntry,
    deleteCalorieEntry,
    addActivityEntry,
    deleteActivityEntry,
    addNote,
    deleteNote,
    updateWaterIntake,
    updateDailySteps,
    updateWeight,
    updateCalorieGoal,
    updateProteinGoal,
    clearAllEntries,
    getTotalCaloriesForDay,
    getTotalCaloriesBurnedForDay,
    getNetCaloriesForDay,
    getWeeklyCalorieSummary,
  };

  return (
    <FitnessContext.Provider value={value}>
      {children}
    </FitnessContext.Provider>
  );
};

// Custom hook to use the fitness context
export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (context === undefined) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
