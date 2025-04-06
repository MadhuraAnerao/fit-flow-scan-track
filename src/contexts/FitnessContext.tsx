
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { addDays, format, parseISO, startOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  addCalorieEntry: (entry: Omit<CalorieEntry, 'id'>) => Promise<void>;
  addActivityEntry: (entry: Omit<ActivityEntry, 'id'>) => Promise<void>;
  addNote: (note: Omit<FitnessNote, 'id'>) => Promise<void>;
  deleteCalorieEntry: (id: string) => Promise<void>;
  deleteActivityEntry: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getTotalCaloriesForDay: (date: string) => number;
  getTotalCaloriesBurnedForDay: (date: string) => number;
  getNetCaloriesForDay: (date: string) => number;
  getWeeklyCalorieSummary: () => { date: string; intake: number; burned: number }[];
  isLoading: boolean;
};

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>([]);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [notes, setNotes] = useState<FitnessNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase when user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setCalorieEntries([]);
        setActivityEntries([]);
        setNotes([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch calorie entries
        const { data: calorieData, error: calorieError } = await supabase
          .from('calorie_entries')
          .select('*')
          .order('date', { ascending: false });

        if (calorieError) throw calorieError;

        // Fetch activity entries
        const { data: activityData, error: activityError } = await supabase
          .from('activity_entries')
          .select('*')
          .order('date', { ascending: false });

        if (activityError) throw activityError;

        // Fetch notes
        const { data: notesData, error: notesError } = await supabase
          .from('fitness_notes')
          .select('*')
          .order('date', { ascending: false });

        if (notesError) throw notesError;

        // Transform data to match expected formats
        setCalorieEntries(calorieData.map(entry => ({
          id: entry.id,
          date: entry.date,
          mealType: entry.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          foodName: entry.food_name,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat
        })));

        setActivityEntries(activityData.map(entry => ({
          id: entry.id,
          date: entry.date,
          activityType: entry.activity_type,
          duration: entry.duration,
          caloriesBurned: entry.calories_burned
        })));

        setNotes(notesData.map(note => ({
          id: note.id,
          date: note.date,
          title: note.title,
          content: note.content
        })));
      } catch (error) {
        console.error('Error fetching fitness data:', error);
        toast.error('Failed to load fitness data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    
    // Set up realtime subscription for data changes
    if (user) {
      const calorieChannel = supabase
        .channel('calorieEntries')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'calorie_entries' }, 
          () => {
            fetchUserData();
          }
        )
        .subscribe();
        
      const activityChannel = supabase
        .channel('activityEntries')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'activity_entries' }, 
          () => {
            fetchUserData();
          }
        )
        .subscribe();
        
      const notesChannel = supabase
        .channel('fitnessNotes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'fitness_notes' }, 
          () => {
            fetchUserData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(calorieChannel);
        supabase.removeChannel(activityChannel);
        supabase.removeChannel(notesChannel);
      };
    }
  }, [user]);

  const addCalorieEntry = async (entry: Omit<CalorieEntry, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add entries');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('calorie_entries')
        .insert({
          user_id: user.id,
          date: entry.date,
          meal_type: entry.mealType,
          food_name: entry.foodName,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat
        })
        .select()
        .single();

      if (error) throw error;
      
      const newEntry: CalorieEntry = {
        id: data.id,
        date: data.date,
        mealType: data.meal_type,
        foodName: data.food_name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat
      };
      
      setCalorieEntries(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error('Error adding calorie entry:', error);
      toast.error('Failed to add calorie entry');
    }
  };

  const addActivityEntry = async (entry: Omit<ActivityEntry, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add entries');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('activity_entries')
        .insert({
          user_id: user.id,
          date: entry.date,
          activity_type: entry.activityType,
          duration: entry.duration,
          calories_burned: entry.caloriesBurned
        })
        .select()
        .single();

      if (error) throw error;
      
      const newEntry: ActivityEntry = {
        id: data.id,
        date: data.date,
        activityType: data.activity_type,
        duration: data.duration,
        caloriesBurned: data.calories_burned
      };
      
      setActivityEntries(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error('Error adding activity entry:', error);
      toast.error('Failed to add activity entry');
    }
  };

  const addNote = async (note: Omit<FitnessNote, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add notes');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fitness_notes')
        .insert({
          user_id: user.id,
          date: note.date,
          title: note.title,
          content: note.content
        })
        .select()
        .single();

      if (error) throw error;
      
      const newNote: FitnessNote = {
        id: data.id,
        date: data.date,
        title: data.title,
        content: data.content
      };
      
      setNotes(prev => [newNote, ...prev]);
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const deleteCalorieEntry = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete entries');
      return;
    }

    try {
      const { error } = await supabase
        .from('calorie_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCalorieEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting calorie entry:', error);
      toast.error('Failed to delete calorie entry');
    }
  };

  const deleteActivityEntry = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete entries');
      return;
    }

    try {
      const { error } = await supabase
        .from('activity_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setActivityEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting activity entry:', error);
      toast.error('Failed to delete activity entry');
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete notes');
      return;
    }

    try {
      const { error } = await supabase
        .from('fitness_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
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
    isLoading
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
