
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { addDays, format, parseISO, startOfDay } from 'date-fns';

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

type ActivityEntry = {
  id: string;
  date: string;
  activityType: string;
  duration: number; // in minutes
  caloriesBurned: number;
};

type FitnessNote = {
  id: string;
  date: string;
  title: string;
  content: string;
};

type FitnessContextType = {
  calorieEntries: CalorieEntry[];
  activityEntries: ActivityEntry[];
  notes: FitnessNote[];
  addCalorieEntry: (entry: Omit<CalorieEntry, 'id'>) => void;
  addActivityEntry: (entry: Omit<ActivityEntry, 'id'>) => void;
  addNote: (note: Omit<FitnessNote, 'id'>) => void;
  deleteCalorieEntry: (id: string) => void;
  deleteActivityEntry: (id: string) => void;
  deleteNote: (id: string) => void;
  getTotalCaloriesForDay: (date: string) => number;
  getTotalCaloriesBurnedForDay: (date: string) => number;
  getNetCaloriesForDay: (date: string) => number;
  getWeeklyCalorieSummary: () => { date: string; intake: number; burned: number }[];
};

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>([]);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [notes, setNotes] = useState<FitnessNote[]>([]);

  // Load data from localStorage on mount and when user changes
  useEffect(() => {
    if (user) {
      const storedCalorieEntries = localStorage.getItem(`fitnessApp_calories_${user.id}`);
      const storedActivityEntries = localStorage.getItem(`fitnessApp_activities_${user.id}`);
      const storedNotes = localStorage.getItem(`fitnessApp_notes_${user.id}`);
      
      if (storedCalorieEntries) setCalorieEntries(JSON.parse(storedCalorieEntries));
      if (storedActivityEntries) setActivityEntries(JSON.parse(storedActivityEntries));
      if (storedNotes) setNotes(JSON.parse(storedNotes));
    } else {
      // Reset state when user logs out
      setCalorieEntries([]);
      setActivityEntries([]);
      setNotes([]);
    }
  }, [user]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`fitnessApp_calories_${user.id}`, JSON.stringify(calorieEntries));
      localStorage.setItem(`fitnessApp_activities_${user.id}`, JSON.stringify(activityEntries));
      localStorage.setItem(`fitnessApp_notes_${user.id}`, JSON.stringify(notes));
    }
  }, [calorieEntries, activityEntries, notes, user]);

  const addCalorieEntry = (entry: Omit<CalorieEntry, 'id'>) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setCalorieEntries(prev => [...prev, newEntry]);
  };

  const addActivityEntry = (entry: Omit<ActivityEntry, 'id'>) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setActivityEntries(prev => [...prev, newEntry]);
  };

  const addNote = (note: Omit<FitnessNote, 'id'>) => {
    const newNote = {
      ...note,
      id: Date.now().toString(),
    };
    setNotes(prev => [...prev, newNote]);
  };

  const deleteCalorieEntry = (id: string) => {
    setCalorieEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const deleteActivityEntry = (id: string) => {
    setActivityEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const getTotalCaloriesForDay = (date: string) => {
    const dayStart = startOfDay(parseISO(date)).toISOString();
    return calorieEntries
      .filter(entry => startOfDay(parseISO(entry.date)).toISOString() === dayStart)
      .reduce((total, entry) => total + entry.calories, 0);
  };

  const getTotalCaloriesBurnedForDay = (date: string) => {
    const dayStart = startOfDay(parseISO(date)).toISOString();
    return activityEntries
      .filter(entry => startOfDay(parseISO(entry.date)).toISOString() === dayStart)
      .reduce((total, entry) => total + entry.caloriesBurned, 0);
  };

  const getNetCaloriesForDay = (date: string) => {
    return getTotalCaloriesForDay(date) - getTotalCaloriesBurnedForDay(date);
  };

  const getWeeklyCalorieSummary = () => {
    const today = new Date();
    const summary = [];

    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      summary.push({
        date: format(date, 'EEE'),
        intake: getTotalCaloriesForDay(dateStr),
        burned: getTotalCaloriesBurnedForDay(dateStr)
      });
    }

    return summary;
  };

  const value = {
    calorieEntries,
    activityEntries,
    notes,
    addCalorieEntry,
    addActivityEntry,
    addNote,
    deleteCalorieEntry,
    deleteActivityEntry,
    deleteNote,
    getTotalCaloriesForDay,
    getTotalCaloriesBurnedForDay,
    getNetCaloriesForDay,
    getWeeklyCalorieSummary,
  };

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>;
};

export const useFitness = (): FitnessContextType => {
  const context = useContext(FitnessContext);
  if (context === undefined) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
