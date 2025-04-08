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

// Define the type for the context
type FitnessContextType = {
  calorieEntries: CalorieEntry[];
  todaysEntries: CalorieEntry[];
  stats: FitnessStats;
  totalCaloriesToday: number;
  totalProteinToday: number;
  totalCarbsToday: number;
  totalFatToday: number;
  remainingCalories: number;
  addCalorieEntry: (entry: Omit<CalorieEntry, 'id'>) => void;
  removeCalorieEntry: (id: string) => void;
  updateWaterIntake: (amount: number) => void;
  updateDailySteps: (steps: number) => void;
  updateWeight: (weight: number) => void;
  updateCalorieGoal: (goal: number) => void;
  updateProteinGoal: (goal: number) => void;
  clearAllEntries: () => void;
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

  // Add a calorie entry
  const addCalorieEntry = (entry: Omit<CalorieEntry, 'id'>) => {
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
    toast.warn('All calorie entries cleared');
  };

  // Value for the context provider
  const value: FitnessContextType = {
    calorieEntries,
    todaysEntries,
    stats,
    totalCaloriesToday,
    totalProteinToday,
    totalCarbsToday,
    totalFatToday,
    remainingCalories,
    addCalorieEntry,
    removeCalorieEntry,
    updateWaterIntake,
    updateDailySteps,
    updateWeight,
    updateCalorieGoal,
    updateProteinGoal,
    clearAllEntries,
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
