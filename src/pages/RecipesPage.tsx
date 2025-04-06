
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecipes } from '../contexts/RecipeContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Clock, UtensilsCrossed, Search, Flame } from 'lucide-react';

const RecipesPage: React.FC = () => {
  const { recipes, filterRecipes, searchRecipes } = useRecipes();
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [dietType, setDietType] = useState<string>('');
  const [mealType, setMealType] = useState<string>('');
  
  useEffect(() => {
    handleSearch();
  }, [searchQuery, activeFilter, dietType, mealType]);
  
  const handleSearch = () => {
    let results = searchQuery ? searchRecipes(searchQuery) : recipes;
    
    if (activeFilter === 'favorites') {
      // In a real app, this would filter by user favorites
      results = results.filter(recipe => recipe.id % 3 === 0); // Simulated favorites
    }
    
    if (dietType) {
      results = filterRecipes({
        dietType: dietType as any,
        mealType: mealType as any
      });
    }
    
    if (mealType) {
      results = results.filter(recipe => recipe.mealType === mealType);
    }
    
    setFilteredRecipes(results);
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setDietType('');
    setMealType('');
    setFilteredRecipes(recipes);
  };
  
  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Healthy Recipes</h1>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Search recipes, ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 fitness-input"
        />
      </div>
      
      {/* Tabs and Filters */}
      <div className="mb-6">
        <Tabs 
          value={activeFilter} 
          onValueChange={setActiveFilter}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="all">All Recipes</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="filters" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Diet Type</label>
                <Select value={dietType} onValueChange={setDietType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All diets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All diets</SelectItem>
                    <SelectItem value="veg">Vegetarian</SelectItem>
                    <SelectItem value="nonveg">Non-Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Meal Type</label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All meals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All meals</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters} 
              className="w-full"
            >
              Reset Filters
            </Button>
          </TabsContent>
        </Tabs>
      </div>
      
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-8">
          <UtensilsCrossed className="mx-auto text-gray-400 mb-2" size={48} />
          <h3 className="text-lg font-medium">No recipes found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query</p>
          <Button 
            variant="link" 
            onClick={resetFilters} 
            className="mt-2 text-fitness-primary"
          >
            Show all recipes
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecipes.map((recipe) => (
            <Link to={`/recipes/${recipe.id}`} key={recipe.id}>
              <Card className="h-full overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="relative h-48">
                  <img 
                    src={recipe.image} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-white text-fitness-primary">
                    {recipe.dietType === 'veg' ? 'Vegetarian' : 
                     recipe.dietType === 'vegan' ? 'Vegan' : 'Non-Veg'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="absolute top-2 left-2 w-8 h-8 p-0 bg-white/70 rounded-full hover:bg-white"
                    onClick={(e) => {
                      e.preventDefault();
                      // In a real app, this would toggle favorite status
                      toast.success(`Added ${recipe.name} to favorites`);
                    }}
                  >
                    <Heart size={16} className="text-red-500" />
                  </Button>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-medium text-lg line-clamp-1">{recipe.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>{recipe.prepTime + recipe.cookTime} min</span>
                    </div>
                    <div className="flex items-center">
                      <Flame size={14} className="mr-1" />
                      <span>{recipe.calories} kcal</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs bg-gray-50">
                      {recipe.mealType}
                    </Badge>
                    {recipe.protein >= 20 && (
                      <Badge variant="outline" className="text-xs bg-gray-50">
                        High Protein
                      </Badge>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          Showing {filteredRecipes.length} of {recipes.length} recipes
        </p>
      </div>
    </div>
  );
};

export default RecipesPage;
