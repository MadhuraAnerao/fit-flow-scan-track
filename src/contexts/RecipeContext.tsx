import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for recipe data
export type Recipe = {
  id: number;
  name: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  steps: string[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  dietType: 'veg' | 'nonveg' | 'vegan';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  source?: 'api' | 'user';
};

type RecipeContextType = {
  recipes: Recipe[];
  userRecipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  addUserRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  getRecipeById: (id: number) => Recipe | undefined;
  searchRecipes: (query: string) => Promise<Recipe[]>;
  filterRecipes: (filters: RecipeFilters) => Recipe[];
  refreshRecipes: () => Promise<void>;
};

type RecipeFilters = {
  dietType?: 'veg' | 'nonveg' | 'vegan';
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  maxCalories?: number;
};

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

// Mock recipe data with better images
const mockRecipes: Recipe[] = [
  {
    id: 1,
    name: "Greek Yogurt with Honey and Berries",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=500",
    calories: 220,
    protein: 15,
    carbs: 30,
    fat: 5,
    ingredients: [
      "1 cup Greek yogurt",
      "1 tbsp honey",
      "1/2 cup mixed berries",
      "1 tbsp chia seeds"
    ],
    steps: [
      "Add Greek yogurt to a bowl",
      "Drizzle honey over yogurt",
      "Top with mixed berries and chia seeds"
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    dietType: "veg",
    mealType: "breakfast"
  },
  {
    id: 2,
    name: "Grilled Chicken Salad",
    image: "https://images.unsplash.com/photo-1580013759032-c96505e24c1f?q=80&w=500",
    calories: 350,
    protein: 35,
    carbs: 15,
    fat: 18,
    ingredients: [
      "4 oz grilled chicken breast",
      "2 cups mixed greens",
      "1/4 cup cherry tomatoes",
      "1/4 cucumber",
      "1 tbsp olive oil",
      "1 tbsp balsamic vinegar",
      "Salt and pepper to taste"
    ],
    steps: [
      "Grill chicken breast until fully cooked",
      "Chop vegetables and mix in a bowl",
      "Slice chicken and add to salad",
      "Whisk olive oil and vinegar for dressing",
      "Drizzle dressing over salad and toss"
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    dietType: "nonveg",
    mealType: "lunch"
  },
  {
    id: 3,
    name: "Lentil Soup",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=500",
    calories: 280,
    protein: 18,
    carbs: 40,
    fat: 3,
    ingredients: [
      "1 cup dried lentils",
      "1 onion, diced",
      "2 carrots, diced",
      "2 stalks celery, diced",
      "2 cloves garlic, minced",
      "4 cups vegetable broth",
      "1 tsp cumin",
      "1 bay leaf",
      "Salt and pepper to taste"
    ],
    steps: [
      "Sauté onion, carrots, celery, and garlic until softened",
      "Add lentils, broth, and spices",
      "Bring to a boil, then simmer for 25-30 minutes",
      "Remove bay leaf before serving"
    ],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    dietType: "vegan",
    mealType: "dinner"
  },
  {
    id: 4,
    name: "Banana Oatmeal Smoothie",
    image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?q=80&w=500",
    calories: 280,
    protein: 12,
    carbs: 50,
    fat: 5,
    ingredients: [
      "1 ripe banana",
      "1/2 cup rolled oats",
      "1 cup almond milk",
      "1 tbsp peanut butter",
      "1/2 tsp cinnamon",
      "Ice cubes"
    ],
    steps: [
      "Add all ingredients to a blender",
      "Blend until smooth",
      "Add more milk if needed for desired consistency"
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    dietType: "vegan",
    mealType: "breakfast"
  },
  {
    id: 5,
    name: "Salmon with Roasted Vegetables",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=500",
    calories: 420,
    protein: 35,
    carbs: 20,
    fat: 22,
    ingredients: [
      "6 oz salmon fillet",
      "1 cup broccoli florets",
      "1 cup sliced bell peppers",
      "1/2 onion, sliced",
      "2 tbsp olive oil",
      "1 lemon",
      "2 cloves garlic, minced",
      "Salt, pepper, and herbs to taste"
    ],
    steps: [
      "Preheat oven to 400°F (200°C)",
      "Toss vegetables with olive oil, garlic, salt, and pepper",
      "Roast vegetables for 10 minutes",
      "Add salmon to the pan, season with salt and pepper",
      "Roast for another 12-15 minutes until salmon is cooked through",
      "Squeeze lemon over salmon before serving"
    ],
    prepTime: 10,
    cookTime: 25,
    servings: 1,
    dietType: "nonveg",
    mealType: "dinner"
  },
  {
    id: 6,
    name: "Quinoa Vegetable Bowl",
    image: "https://source.unsplash.com/random/300x200/?quinoa-bowl",
    calories: 340,
    protein: 12,
    carbs: 58,
    fat: 10,
    ingredients: [
      "1 cup cooked quinoa",
      "1 cup roasted mixed vegetables",
      "1/4 avocado, sliced",
      "1/4 cup chickpeas",
      "1 tbsp tahini dressing",
      "Fresh herbs for garnish"
    ],
    steps: [
      "Cook quinoa according to package instructions",
      "Roast vegetables at 400°F (200°C) for 20 minutes",
      "Assemble bowl with quinoa at the base",
      "Top with roasted vegetables, chickpeas, and avocado",
      "Drizzle with tahini dressing and garnish with fresh herbs"
    ],
    prepTime: 10,
    cookTime: 25,
    servings: 1,
    dietType: "vegan",
    mealType: "lunch"
  },
  {
    id: 7,
    name: "Turkey and Avocado Wrap",
    image: "https://source.unsplash.com/random/300x200/?wrap",
    calories: 380,
    protein: 28,
    carbs: 30,
    fat: 18,
    ingredients: [
      "1 whole wheat tortilla",
      "3 oz sliced turkey breast",
      "1/2 avocado, sliced",
      "1/4 cup shredded lettuce",
      "2 slices tomato",
      "1 tbsp hummus",
      "Salt and pepper to taste"
    ],
    steps: [
      "Spread hummus evenly over tortilla",
      "Layer turkey, avocado, lettuce, and tomato",
      "Season with salt and pepper",
      "Roll tightly and slice in half"
    ],
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    dietType: "nonveg",
    mealType: "lunch"
  },
  {
    id: 8,
    name: "Berry Protein Smoothie",
    image: "https://source.unsplash.com/random/300x200/?berry-smoothie",
    calories: 240,
    protein: 20,
    carbs: 25,
    fat: 5,
    ingredients: [
      "1 scoop vanilla protein powder",
      "1 cup mixed berries",
      "1 cup unsweetened almond milk",
      "1/2 banana",
      "Ice cubes"
    ],
    steps: [
      "Add all ingredients to a blender",
      "Blend until smooth and creamy",
      "Add more ice for a thicker consistency if desired"
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    dietType: "veg",
    mealType: "breakfast"
  },
  {
    id: 9,
    name: "Vegetable Stir Fry",
    image: "https://source.unsplash.com/random/300x200/?stir-fry",
    calories: 300,
    protein: 10,
    carbs: 40,
    fat: 8,
    ingredients: [
      "2 cups mixed vegetables (bell peppers, broccoli, carrots)",
      "1 cup tofu, cubed",
      "2 cloves garlic, minced",
      "1 tbsp ginger, minced",
      "2 tbsp soy sauce",
      "1 tbsp sesame oil",
      "1 cup cooked brown rice"
    ],
    steps: [
      "Heat sesame oil in a wok or large pan",
      "Add garlic and ginger, sauté until fragrant",
      "Add tofu and cook until golden",
      "Add vegetables and stir fry until tender-crisp",
      "Add soy sauce and toss to combine",
      "Serve over cooked brown rice"
    ],
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    dietType: "vegan",
    mealType: "dinner"
  },
  {
    id: 10,
    name: "Overnight Oats with Fruit",
    image: "https://source.unsplash.com/random/300x200/?oats",
    calories: 350,
    protein: 12,
    carbs: 55,
    fat: 8,
    ingredients: [
      "1/2 cup rolled oats",
      "1/2 cup milk of choice",
      "1/2 cup Greek yogurt",
      "1 tbsp chia seeds",
      "1 tbsp maple syrup",
      "1/2 cup mixed berries",
      "1/4 cup chopped nuts"
    ],
    steps: [
      "Mix oats, milk, yogurt, chia seeds, and maple syrup in a jar",
      "Refrigerate overnight or for at least 4 hours",
      "Top with berries and nuts before serving"
    ],
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    dietType: "veg",
    mealType: "breakfast"
  },
  {
    id: 11,
    name: "Baked Salmon with Asparagus",
    image: "https://source.unsplash.com/random/300x200/?baked-salmon",
    calories: 380,
    protein: 30,
    carbs: 15,
    fat: 20,
    ingredients: [
      "1 salmon fillet (6 oz)",
      "1 bunch asparagus",
      "1 lemon",
      "2 cloves garlic, minced",
      "2 tbsp olive oil",
      "Salt and pepper to taste",
      "Fresh dill for garnish"
    ],
    steps: [
      "Preheat oven to 400°F (200°C)",
      "Place salmon and asparagus on a baking sheet",
      "Drizzle with olive oil and season with garlic, salt, and pepper",
      "Squeeze half a lemon over salmon and asparagus",
      "Bake for 15-18 minutes",
      "Garnish with fresh dill and lemon slices"
    ],
    prepTime: 10,
    cookTime: 18,
    servings: 1,
    dietType: "nonveg",
    mealType: "dinner"
  },
  {
    id: 12,
    name: "Chickpea and Vegetable Curry",
    image: "https://source.unsplash.com/random/300x200/?curry",
    calories: 320,
    protein: 15,
    carbs: 45,
    fat: 10,
    ingredients: [
      "1 can chickpeas, drained",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "1 tbsp ginger, minced",
      "1 can diced tomatoes",
      "1 cup mixed vegetables",
      "2 tbsp curry powder",
      "1 cup vegetable broth",
      "1/4 cup coconut milk",
      "Fresh cilantro for garnish"
    ],
    steps: [
      "Sauté onion, garlic, and ginger until softened",
      "Add curry powder and toast for 1 minute",
      "Add chickpeas, vegetables, diced tomatoes, and broth",
      "Simmer for 20 minutes until vegetables are tender",
      "Stir in coconut milk and heat through",
      "Garnish with fresh cilantro"
    ],
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    dietType: "vegan",
    mealType: "dinner"
  },
  {
    id: 13,
    name: "Avocado Toast with Poached Egg",
    image: "https://source.unsplash.com/random/300x200/?avocado-toast",
    calories: 300,
    protein: 15,
    carbs: 25,
    fat: 18,
    ingredients: [
      "2 slices whole grain bread",
      "1 ripe avocado",
      "2 eggs",
      "1 tbsp lemon juice",
      "Red pepper flakes",
      "Salt and pepper to taste"
    ],
    steps: [
      "Toast the bread until golden brown",
      "Mash avocado with lemon juice, salt, and pepper",
      "Spread avocado mixture on toast",
      "Poach eggs for 3-4 minutes until whites are set but yolk is runny",
      "Top each toast with a poached egg",
      "Season with red pepper flakes and additional salt and pepper if desired"
    ],
    prepTime: 10,
    cookTime: 10,
    servings: 1,
    dietType: "veg",
    mealType: "breakfast"
  },
  {
    id: 14,
    name: "Turkey Chili",
    image: "https://source.unsplash.com/random/300x200/?chili",
    calories: 350,
    protein: 30,
    carbs: 35,
    fat: 10,
    ingredients: [
      "1 lb ground turkey",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "1 bell pepper, diced",
      "1 can diced tomatoes",
      "1 can kidney beans, drained",
      "2 tbsp chili powder",
      "1 tbsp cumin",
      "1 cup chicken broth",
      "Salt and pepper to taste",
      "Optional toppings: Greek yogurt, cilantro, green onions"
    ],
    steps: [
      "Brown turkey in a large pot, breaking it into crumbles",
      "Add onion, garlic, and bell pepper, sauté until softened",
      "Stir in chili powder and cumin, cook for 1 minute",
      "Add diced tomatoes, kidney beans, and chicken broth",
      "Simmer for 30 minutes, stirring occasionally",
      "Season with salt and pepper to taste",
      "Serve with optional toppings"
    ],
    prepTime: 15,
    cookTime: 40,
    servings: 4,
    dietType: "nonveg",
    mealType: "lunch"
  },
  {
    id: 15,
    name: "Spinach and Feta Stuffed Chicken",
    image: "https://source.unsplash.com/random/300x200/?stuffed-chicken",
    calories: 400,
    protein: 45,
    carbs: 5,
    fat: 22,
    ingredients: [
      "2 chicken breasts",
      "2 cups fresh spinach",
      "1/4 cup feta cheese, crumbled",
      "2 cloves garlic, minced",
      "2 tbsp olive oil",
      "1 tsp dried oregano",
      "Salt and pepper to taste",
      "Kitchen twine or toothpicks"
    ],
    steps: [
      "Preheat oven to 375°F (190°C)",
      "Butterfly chicken breasts and pound to even thickness",
      "Sauté spinach and garlic until wilted",
      "Mix spinach with feta cheese",
      "Spread mixture over chicken breasts",
      "Roll up and secure with twine or toothpicks",
      "Season with oregano, salt, and pepper",
      "Heat olive oil in an oven-safe pan and sear chicken on all sides",
      "Transfer to oven and bake for 20-25 minutes until cooked through"
    ],
    prepTime: 20,
    cookTime: 30,
    servings: 2,
    dietType: "nonveg",
    mealType: "dinner"
  }
];

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch recipes from API on component mount
  useEffect(() => {
    refreshRecipes();
  }, []);
  
  // Fetch recipes from our Supabase Function (that calls external APIs)
  const refreshRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('recipes');
      
      if (error) {
        console.error('Error fetching recipes:', error);
        setError('Failed to fetch recipes. Using local data instead.');
        return;
      }
      
      if (data && data.recipes) {
        setRecipes(data.recipes);
      } else {
        console.warn('No recipes returned from API');
        setError('No recipes were returned. Using local data instead.');
      }
    } catch (err) {
      console.error('Error in recipe fetch:', err);
      setError('An unexpected error occurred. Using local data instead.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new user recipe
  const addUserRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe = {
      ...recipe,
      id: Date.now(),
      source: 'user' as const,
    };
    setUserRecipes(prev => [...prev, newRecipe]);
    toast.success(`Added "${recipe.name}" to your recipes!`);
  };
  
  // Get recipe by ID from both preloaded and user recipes
  const getRecipeById = (id: number) => {
    const allRecipes = [...recipes, ...userRecipes];
    return allRecipes.find(recipe => recipe.id === id);
  };
  
  // Search recipes by name
  const searchRecipes = async (query: string) => {
    if (!query.trim()) return [...recipes, ...userRecipes];
    
    try {
      setIsLoading(true);
      
      // Call our Supabase function with the search query
      const { data, error } = await supabase.functions.invoke('recipes', {
        body: { query: query.trim() }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      let searchResults: Recipe[] = [];
      
      // Add API results
      if (data && data.recipes) {
        searchResults = data.recipes;
      }
      
      // Add user recipes that match the query
      const matchingUserRecipes = userRecipes.filter(recipe => 
        recipe.name.toLowerCase().includes(query.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(query.toLowerCase()))
      );
      
      return [...searchResults, ...matchingUserRecipes];
    } catch (err) {
      console.error('Error searching recipes:', err);
      
      // Fallback to local search if API fails
      const allRecipes = [...recipes, ...userRecipes];
      query = query.toLowerCase();
      
      return allRecipes.filter(recipe => 
        recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter recipes based on criteria
  const filterRecipes = (filters: RecipeFilters) => {
    const allRecipes = [...recipes, ...userRecipes];
    
    return allRecipes.filter(recipe => {
      // Filter by diet type
      if (filters.dietType && recipe.dietType !== filters.dietType) {
        return false;
      }
      
      // Filter by meal type
      if (filters.mealType && recipe.mealType !== filters.mealType) {
        return false;
      }
      
      // Filter by max calories
      if (filters.maxCalories && recipe.calories > filters.maxCalories) {
        return false;
      }
      
      return true;
    });
  };
  
  const value = {
    recipes,
    userRecipes,
    isLoading,
    error,
    addUserRecipe,
    getRecipeById,
    searchRecipes,
    filterRecipes,
    refreshRecipes
  };
  
  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};
