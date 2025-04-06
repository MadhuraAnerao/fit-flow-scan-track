
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '../contexts/RecipeContext';
import { useFitness } from '../contexts/FitnessContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Clock,
  Users,
  ChevronLeft,
  Heart,
  Plus,
  Check,
  Share2,
  Printer,
  UtensilsCrossed,
  Circle,
  Flame,
  Award,
  Dumbbell
} from 'lucide-react';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getRecipeById } = useRecipes();
  const { addCalorieEntry } = useFitness();
  const navigate = useNavigate();
  
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [tracked, setTracked] = useState(false);
  
  useEffect(() => {
    if (id) {
      const recipeData = getRecipeById(parseInt(id));
      if (recipeData) {
        setRecipe(recipeData);
        // Simulate random favorite status
        setFavorite(Math.random() > 0.5);
      } else {
        toast.error('Recipe not found');
        navigate('/recipes');
      }
      setLoading(false);
    }
  }, [id, getRecipeById, navigate]);
  
  const handleBack = () => {
    navigate('/recipes');
  };
  
  const toggleFavorite = () => {
    setFavorite(!favorite);
    toast.success(favorite ? 'Removed from favorites' : 'Added to favorites');
  };
  
  const trackMeal = () => {
    if (!recipe) return;
    
    addCalorieEntry({
      date: new Date().toISOString(),
      mealType: recipe.mealType,
      foodName: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat
    });
    
    setTracked(true);
    toast.success('Added to today\'s calorie tracking');
  };
  
  const shareRecipe = () => {
    // In a real app, this would use the Web Share API
    toast.success('Recipe share functionality would appear here');
  };
  
  const printRecipe = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading recipe...</div>
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
        <Button onClick={handleBack}>Go Back to Recipes</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 pb-20">
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-1">
          <ChevronLeft size={16} />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
            onClick={toggleFavorite}
          >
            <Heart size={16} className={favorite ? 'text-red-500 fill-red-500' : ''} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
            onClick={shareRecipe}
          >
            <Share2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
            onClick={printRecipe}
          >
            <Printer size={16} />
          </Button>
        </div>
      </div>
      
      {/* Recipe Image */}
      <div className="relative rounded-xl overflow-hidden h-64 mb-4">
        <img 
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-4 right-4 bg-white text-fitness-primary">
          {recipe.dietType === 'veg' ? 'Vegetarian' : 
           recipe.dietType === 'vegan' ? 'Vegan' : 'Non-Veg'}
        </Badge>
      </div>
      
      {/* Recipe Title & Add to Tracking Button */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{recipe.name}</h1>
        <div className="flex justify-between items-center">
          <div className="flex gap-3 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex items-center">
              <Users size={14} className="mr-1" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
          
          <Button
            onClick={trackMeal}
            disabled={tracked}
            className={tracked ? 'bg-green-500 hover:bg-green-600' : 'fitness-gradient'}
          >
            {tracked ? (
              <>
                <Check size={16} className="mr-2" />
                Added
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Track Meal
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Nutrition Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold flex items-center mb-3">
            <Flame size={18} className="mr-2 text-fitness-primary" />
            Nutrition Information
          </h2>
          
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Calories</p>
              <p className="font-semibold">{recipe.calories}</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Protein</p>
              <p className="font-semibold">{recipe.protein}g</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Carbs</p>
              <p className="font-semibold">{recipe.carbs}g</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Fat</p>
              <p className="font-semibold">{recipe.fat}g</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
            <p>Per serving</p>
            {recipe.protein >= 20 && (
              <Badge variant="outline" className="text-xs bg-white">
                <Award size={12} className="mr-1 text-fitness-secondary" />
                High Protein
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Ingredients */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center mb-3">
          <UtensilsCrossed size={18} className="mr-2 text-fitness-primary" />
          Ingredients
        </h2>
        
        <div className="space-y-2">
          {recipe.ingredients.map((ingredient: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <Circle size={6} className="text-fitness-primary" />
              <span>{ingredient}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center mb-3">
          <Dumbbell size={18} className="mr-2 text-fitness-primary" />
          Instructions
        </h2>
        
        <div className="space-y-4">
          {recipe.steps.map((step: string, index: number) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full fitness-gradient flex items-center justify-center text-white text-sm">
                {index + 1}
              </div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Preparation Time */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center mb-3">
          <Clock size={18} className="mr-2 text-fitness-primary" />
          Preparation Time
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Prep Time</p>
            <p className="font-medium">{recipe.prepTime} minutes</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Cook Time</p>
            <p className="font-medium">{recipe.cookTime} minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
