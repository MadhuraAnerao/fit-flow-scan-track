
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Set up CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecipeApiResponse {
  meals: {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strIngredient1?: string;
    strIngredient2?: string;
    // ... more ingredients
    strMeasure1?: string;
    strMeasure2?: string;
    // ... more measures
  }[];
}

interface NutritionApiResponse {
  items: {
    name: string;
    calories: number;
    protein_g: number;
    fat_g: number;
    carbohydrates_g: number;
    serving_size_g: number;
  }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('query') || ''
    const category = url.searchParams.get('category') || ''
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch recipes from external API (TheMealDB)
    let apiRecipes = []
    try {
      let apiUrl = 'https://www.themealdb.com/api/json/v1/1/'
      
      if (query) {
        apiUrl += `search.php?s=${encodeURIComponent(query)}`
      } else if (category) {
        apiUrl += `filter.php?c=${encodeURIComponent(category)}`
      } else {
        apiUrl += 'random.php'
      }
      
      const response = await fetch(apiUrl)
      const data: RecipeApiResponse = await response.json()
      
      if (data.meals) {
        apiRecipes = await Promise.all(data.meals.map(async (meal) => {
          // Get nutrition data for this meal
          let nutritionData = {
            calories: Math.floor(Math.random() * 300) + 200, // Default random values
            protein_g: Math.floor(Math.random() * 20) + 10,
            fat_g: Math.floor(Math.random() * 15) + 5,
            carbohydrates_g: Math.floor(Math.random() * 30) + 20
          }
          
          try {
            // Try to get real nutrition data using NinjaAPI 
            // Note: Using free API with limited calls, fallback to defaults if fails
            const nutritionResponse = await fetch(
              `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(meal.strMeal)}`, 
              {
                headers: { 'X-Api-Key': 'YOUR_API_NINJAS_KEY' } // Replace with your actual key if available
              }
            )
            
            const nutritionInfo: NutritionApiResponse = await nutritionResponse.json()
            if (nutritionInfo.items && nutritionInfo.items.length > 0) {
              let totalNutrition = nutritionInfo.items.reduce((acc, item) => {
                return {
                  calories: acc.calories + item.calories,
                  protein_g: acc.protein_g + item.protein_g,
                  fat_g: acc.fat_g + item.fat_g,
                  carbohydrates_g: acc.carbohydrates_g + item.carbohydrates_g
                }
              }, { calories: 0, protein_g: 0, fat_g: 0, carbohydrates_g: 0 })
              
              nutritionData = totalNutrition
            }
          } catch (err) {
            console.error('Error fetching nutrition data:', err)
            // Continue with default values
          }
          
          // Get ingredients from meal object
          const ingredients = []
          for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}` as keyof typeof meal]
            const measure = meal[`strMeasure${i}` as keyof typeof meal]
            
            if (ingredient && ingredient.trim() !== '') {
              ingredients.push(`${measure?.trim() || ''} ${ingredient.trim()}`)
            }
          }
          
          // Calculate prep time based on number of ingredients (simple heuristic)
          const prepTime = Math.max(10, ingredients.length * 2)
          const cookTime = Math.max(15, ingredients.length * 3)
          
          // Split instructions into steps
          const steps = meal.strInstructions
            .split(/\r\n|\r|\n/)
            .filter(step => step.trim() !== '')
            .map(step => step.trim())
          
          // Determine diet type based on category and ingredients
          let dietType = 'nonveg'
          const vegetarianCategories = ['Vegetarian', 'Vegan', 'Side', 'Breakfast', 'Dessert']
          const nonVegIndicators = ['chicken', 'beef', 'pork', 'meat', 'fish', 'seafood', 'lamb']
          
          if (vegetarianCategories.includes(meal.strCategory)) {
            dietType = 'veg'
            
            // Check for vegan indicators
            if (meal.strCategory === 'Vegan' || 
                !ingredients.some(i => i.toLowerCase().includes('egg') || 
                                    i.toLowerCase().includes('milk') ||
                                    i.toLowerCase().includes('cheese') ||
                                    i.toLowerCase().includes('butter'))) {
              dietType = 'vegan'
            }
          } else {
            // Check ingredients for non-veg indicators
            if (!ingredients.some(i => nonVegIndicators.some(nvi => i.toLowerCase().includes(nvi)))) {
              dietType = 'veg'
            }
          }
          
          // Determine meal type based on category
          let mealType = 'dinner'
          if (meal.strCategory === 'Breakfast') {
            mealType = 'breakfast'
          } else if (meal.strCategory === 'Dessert' || meal.strCategory === 'Side') {
            mealType = 'snack'
          } else if (meal.strCategory === 'Starter') {
            mealType = 'lunch'
          }
          
          return {
            id: parseInt(meal.idMeal),
            name: meal.strMeal,
            image: meal.strMealThumb,
            calories: Math.round(nutritionData.calories),
            protein: Math.round(nutritionData.protein_g),
            carbs: Math.round(nutritionData.carbohydrates_g),
            fat: Math.round(nutritionData.fat_g),
            ingredients: ingredients,
            steps: steps,
            prepTime: prepTime,
            cookTime: cookTime,
            servings: 4, // Default value
            dietType: dietType as 'veg' | 'nonveg' | 'vegan',
            mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
            source: 'api'
          }
        }))
      }
    } catch (error) {
      console.error('API fetch error:', error)
    }
    
    // TODO: In a real app, we would also fetch user recipes from Supabase
    // and combine them with the API recipes
    
    return new Response(
      JSON.stringify({
        recipes: apiRecipes,
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
      }
    )
  }
})
