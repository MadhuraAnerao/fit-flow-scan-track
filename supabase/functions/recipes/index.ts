
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

// Our own custom recipe database
const customRecipes = [
  {
    id: 10001,
    name: "Protein-Packed Quinoa Bowl",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 320,
    protein: 18,
    carbs: 42,
    fat: 12,
    ingredients: [
      "1 cup cooked quinoa",
      "1/2 cup black beans",
      "1/4 avocado, sliced",
      "1/4 cup diced bell peppers",
      "1/4 cup cherry tomatoes, halved",
      "1 tbsp olive oil",
      "1 tbsp lime juice",
      "2 tbsp chopped fresh cilantro",
      "Salt and pepper to taste"
    ],
    steps: [
      "Cook quinoa according to package instructions and let cool.",
      "In a bowl, combine quinoa, black beans, bell peppers, and tomatoes.",
      "Whisk together olive oil, lime juice, salt, and pepper in a small bowl.",
      "Drizzle dressing over the quinoa mixture and toss to combine.",
      "Top with avocado slices and cilantro before serving."
    ],
    prepTime: 15,
    cookTime: 20,
    servings: 1,
    dietType: "vegan",
    mealType: "lunch",
    source: "custom"
  },
  {
    id: 10002,
    name: "Green Smoothie Bowl",
    image: "https://images.unsplash.com/photo-1638437447781-93211d83caa1?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 280,
    protein: 14,
    carbs: 45,
    fat: 8,
    ingredients: [
      "1 frozen banana",
      "1 cup spinach",
      "1/2 cup kale",
      "1 scoop vanilla protein powder",
      "1/2 cup almond milk",
      "1 tbsp almond butter",
      "Toppings: granola, berries, chia seeds"
    ],
    steps: [
      "Add banana, spinach, kale, protein powder, almond milk, and almond butter to a blender.",
      "Blend until smooth, adding more almond milk if needed for desired consistency.",
      "Pour into a bowl and top with granola, berries, and chia seeds."
    ],
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    dietType: "veg",
    mealType: "breakfast",
    source: "custom"
  },
  {
    id: 10003,
    name: "Mediterranean Grilled Chicken Salad",
    image: "https://images.unsplash.com/photo-1599021419847-d8a7a6aba5b4?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 380,
    protein: 35,
    carbs: 15,
    fat: 22,
    ingredients: [
      "6 oz grilled chicken breast, sliced",
      "3 cups mixed greens",
      "1/4 cup cucumber, diced",
      "1/4 cup cherry tomatoes, halved",
      "2 tbsp red onion, thinly sliced",
      "2 tbsp kalamata olives, pitted",
      "1 oz feta cheese, crumbled",
      "2 tbsp olive oil",
      "1 tbsp red wine vinegar",
      "1 tsp dried oregano",
      "Salt and pepper to taste"
    ],
    steps: [
      "Season chicken breast with salt, pepper, and oregano. Grill until fully cooked, about 6-7 minutes per side.",
      "In a large bowl, combine mixed greens, cucumber, tomatoes, red onion, and olives.",
      "Whisk together olive oil, red wine vinegar, oregano, salt, and pepper to make the dressing.",
      "Slice the grilled chicken and add to the salad.",
      "Drizzle with dressing and sprinkle feta cheese on top."
    ],
    prepTime: 15,
    cookTime: 15,
    servings: 1,
    dietType: "nonveg",
    mealType: "lunch",
    source: "custom"
  },
  {
    id: 10004,
    name: "Sweet Potato and Black Bean Burrito",
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 420,
    protein: 16,
    carbs: 65,
    fat: 12,
    ingredients: [
      "1 medium sweet potato, diced",
      "1/2 cup black beans, rinsed and drained",
      "1/4 cup corn kernels",
      "1/4 cup red onion, diced",
      "1/4 cup bell pepper, diced",
      "1 clove garlic, minced",
      "1 tsp cumin",
      "1/2 tsp paprika",
      "1/4 tsp cayenne pepper (optional)",
      "2 tbsp cilantro, chopped",
      "1 large whole wheat tortilla",
      "1 tbsp Greek yogurt or sour cream",
      "1/4 avocado, sliced",
      "Lime wedges for serving"
    ],
    steps: [
      "Preheat oven to 400°F (200°C). Toss sweet potato with olive oil, salt, and pepper. Roast for 20-25 minutes until tender.",
      "In a skillet, sauté onion, bell pepper, and garlic until softened. Add cumin, paprika, and cayenne pepper.",
      "Add black beans and corn to the skillet. Cook for 2-3 minutes until heated through.",
      "Mix in the roasted sweet potatoes and cilantro.",
      "Warm the tortilla and fill with the sweet potato mixture.",
      "Top with Greek yogurt and avocado slices.",
      "Fold the sides of the tortilla and roll into a burrito.",
      "Serve with lime wedges on the side."
    ],
    prepTime: 15,
    cookTime: 30,
    servings: 1,
    dietType: "veg",
    mealType: "dinner",
    source: "custom"
  },
  {
    id: 10005,
    name: "Salmon with Lemon-Dill Sauce",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 350,
    protein: 32,
    carbs: 8,
    fat: 20,
    ingredients: [
      "6 oz salmon fillet",
      "1 tbsp olive oil",
      "1 lemon, half juiced and half sliced",
      "2 tbsp fresh dill, chopped",
      "1 clove garlic, minced",
      "3 tbsp Greek yogurt",
      "1 tsp Dijon mustard",
      "Salt and pepper to taste",
      "Asparagus or green vegetable of choice for serving"
    ],
    steps: [
      "Preheat oven to 375°F (190°C).",
      "Season salmon with salt, pepper, and half of the chopped dill.",
      "Place lemon slices on top of the salmon and bake for 12-15 minutes until cooked through.",
      "Meanwhile, prepare the sauce by mixing Greek yogurt, lemon juice, remaining dill, garlic, and Dijon mustard.",
      "Season the sauce with salt and pepper to taste.",
      "Serve the salmon with the lemon-dill sauce drizzled on top and your choice of vegetable on the side."
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    dietType: "nonveg",
    mealType: "dinner",
    source: "custom"
  },
  {
    id: 10006,
    name: "Overnight Chia Pudding",
    image: "https://images.unsplash.com/photo-1583096114844-06ce5a5f2171?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 240,
    protein: 12,
    carbs: 28,
    fat: 10,
    ingredients: [
      "1/4 cup chia seeds",
      "1 cup almond milk (or milk of choice)",
      "1 tbsp honey or maple syrup",
      "1/2 tsp vanilla extract",
      "Toppings: fresh berries, sliced banana, nuts, or granola"
    ],
    steps: [
      "In a jar or container, combine chia seeds, milk, sweetener, and vanilla extract.",
      "Stir well to combine, making sure there are no clumps of chia seeds.",
      "Cover and refrigerate overnight, or for at least 4 hours.",
      "Stir again before serving and add more milk if needed to reach desired consistency.",
      "Top with fresh berries, sliced banana, nuts, or granola before serving."
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    dietType: "vegan",
    mealType: "breakfast",
    source: "custom"
  },
  {
    id: 10007,
    name: "Vegetable Stir-Fry with Tofu",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 320,
    protein: 18,
    carbs: 30,
    fat: 15,
    ingredients: [
      "7 oz firm tofu, drained and cubed",
      "2 cups mixed vegetables (broccoli, bell peppers, carrots, snap peas)",
      "2 cloves garlic, minced",
      "1 tbsp ginger, grated",
      "2 tbsp soy sauce or tamari",
      "1 tbsp rice vinegar",
      "1 tsp sesame oil",
      "1 tbsp vegetable oil",
      "1 tbsp cornstarch (optional, for sauce thickening)",
      "Sesame seeds for garnish",
      "Green onions, sliced for garnish"
    ],
    steps: [
      "Press tofu between paper towels to remove excess moisture. Cut into cubes.",
      "Heat vegetable oil in a wok or large skillet over medium-high heat.",
      "Add tofu and cook until golden brown on all sides, about 5 minutes. Remove and set aside.",
      "In the same pan, add garlic and ginger. Sauté for 30 seconds until fragrant.",
      "Add vegetables and stir-fry for 3-5 minutes until crisp-tender.",
      "In a small bowl, whisk together soy sauce, rice vinegar, sesame oil, and cornstarch (if using).",
      "Return tofu to the pan, add the sauce, and toss to coat everything evenly.",
      "Cook for another 1-2 minutes until sauce thickens slightly.",
      "Garnish with sesame seeds and green onions before serving."
    ],
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    dietType: "vegan",
    mealType: "dinner",
    source: "custom"
  },
  {
    id: 10008,
    name: "Turkey and Vegetable Lettuce Wraps",
    image: "https://images.unsplash.com/photo-1529059997568-3d847b1154f0?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 280,
    protein: 24,
    carbs: 12,
    fat: 16,
    ingredients: [
      "8 oz ground turkey",
      "1 tbsp olive oil",
      "1 small onion, diced",
      "1 red bell pepper, diced",
      "1 carrot, grated",
      "2 cloves garlic, minced",
      "1 tbsp ginger, grated",
      "2 tbsp soy sauce",
      "1 tbsp hoisin sauce",
      "1 tsp sriracha or hot sauce (optional)",
      "8 large lettuce leaves (butter, romaine, or iceberg)",
      "1/4 cup chopped peanuts or cashews",
      "Fresh cilantro and lime wedges for serving"
    ],
    steps: [
      "Heat olive oil in a large skillet over medium-high heat.",
      "Add ground turkey and cook until no longer pink, breaking it up with a spatula.",
      "Add onion, bell pepper, and carrot. Cook until vegetables are softened, about 5 minutes.",
      "Stir in garlic and ginger. Cook for 30 seconds until fragrant.",
      "Add soy sauce, hoisin sauce, and sriracha if using. Stir to combine and cook for another 2 minutes.",
      "Spoon the turkey mixture into lettuce leaves.",
      "Top with chopped nuts and cilantro.",
      "Serve with lime wedges on the side."
    ],
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    dietType: "nonveg",
    mealType: "lunch",
    source: "custom"
  },
  {
    id: 10009,
    name: "Greek Yogurt Parfait",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 250,
    protein: 18,
    carbs: 32,
    fat: 6,
    ingredients: [
      "1 cup Greek yogurt (plain or vanilla)",
      "1/4 cup granola",
      "1/2 cup mixed berries (strawberries, blueberries, raspberries)",
      "1 tbsp honey or maple syrup",
      "1 tbsp chia seeds or flaxseeds (optional)"
    ],
    steps: [
      "In a glass or bowl, layer half of the Greek yogurt at the bottom.",
      "Add a layer of mixed berries.",
      "Sprinkle half of the granola and seeds if using.",
      "Repeat layers with remaining yogurt, berries, and granola.",
      "Drizzle honey or maple syrup on top before serving."
    ],
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    dietType: "veg",
    mealType: "breakfast",
    source: "custom"
  },
  {
    id: 10010,
    name: "Cauliflower Fried Rice",
    image: "https://images.unsplash.com/photo-1603048719539-9ecb4aa395e3?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 260,
    protein: 15,
    carbs: 20,
    fat: 14,
    ingredients: [
      "1 medium head cauliflower, riced (about 4 cups)",
      "2 eggs, beaten (omit for vegan version)",
      "1 tbsp sesame oil",
      "1 tbsp vegetable oil",
      "1 small onion, diced",
      "1 carrot, diced",
      "1/2 cup frozen peas",
      "2 cloves garlic, minced",
      "1 tbsp ginger, grated",
      "3 tbsp soy sauce or tamari",
      "1 tsp rice vinegar",
      "2 green onions, sliced",
      "Sesame seeds for garnish"
    ],
    steps: [
      "Pulse cauliflower florets in a food processor until they resemble rice grains.",
      "Heat 1/2 tbsp vegetable oil in a large skillet or wok. Add beaten eggs and scramble until cooked. Remove and set aside.",
      "In the same pan, heat remaining vegetable oil and sesame oil.",
      "Add onion, carrot, and garlic. Sauté for 3-4 minutes until softened.",
      "Add cauliflower rice and stir-fry for 5-7 minutes until tender but still slightly firm.",
      "Add peas, ginger, soy sauce, and rice vinegar. Stir to combine and cook for 2 more minutes.",
      "Fold in the scrambled eggs and green onions.",
      "Garnish with sesame seeds before serving."
    ],
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    dietType: "veg",
    mealType: "lunch",
    source: "custom"
  },
  {
    id: 10011,
    name: "Protein Blueberry Pancakes",
    image: "https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 320,
    protein: 22,
    carbs: 38,
    fat: 9,
    ingredients: [
      "1 cup rolled oats",
      "1 banana",
      "2 eggs",
      "1 scoop vanilla protein powder",
      "1/4 cup milk of choice",
      "1/2 tsp baking powder",
      "1/2 tsp cinnamon",
      "1/2 cup blueberries",
      "1 tsp coconut oil or cooking spray",
      "1 tbsp maple syrup or honey for serving"
    ],
    steps: [
      "Blend oats in a blender until they become a flour-like consistency.",
      "Add banana, eggs, protein powder, milk, baking powder, and cinnamon to the blender. Blend until smooth.",
      "Fold in blueberries gently (do not blend).",
      "Heat a non-stick pan over medium heat and add coconut oil or cooking spray.",
      "Pour 1/4 cup of batter for each pancake into the pan.",
      "Cook for 2-3 minutes per side until golden brown.",
      "Serve with a drizzle of maple syrup or honey."
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    dietType: "veg",
    mealType: "breakfast",
    source: "custom"
  },
  {
    id: 10012,
    name: "Stuffed Bell Peppers",
    image: "https://images.unsplash.com/photo-1607532684380-8e5c2a10b8c6?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 340,
    protein: 25,
    carbs: 30,
    fat: 14,
    ingredients: [
      "4 large bell peppers (any color), tops removed and seeded",
      "1 lb lean ground beef or turkey (or 2 cups cooked quinoa for vegan option)",
      "1 small onion, diced",
      "2 cloves garlic, minced",
      "1 cup cooked brown rice",
      "1 can (14 oz) diced tomatoes, drained",
      "1 tbsp tomato paste",
      "1 tsp Italian seasoning",
      "1/2 tsp paprika",
      "1/2 cup shredded cheese (omit for vegan option)",
      "2 tbsp fresh parsley, chopped",
      "Salt and pepper to taste",
      "1/4 cup water for the baking dish"
    ],
    steps: [
      "Preheat oven to 375°F (190°C).",
      "In a large skillet, cook ground meat until browned. If using quinoa, skip this step.",
      "Add onion and garlic to the skillet and cook until softened.",
      "Stir in cooked rice, diced tomatoes, tomato paste, Italian seasoning, paprika, salt, and pepper.",
      "If using quinoa instead of meat, add it now and mix well.",
      "Fill each bell pepper with the mixture and place them in a baking dish.",
      "Pour 1/4 cup water into the bottom of the dish.",
      "Cover with foil and bake for 30-35 minutes.",
      "Remove foil, sprinkle cheese on top (if using), and bake for another 5-10 minutes until cheese is melted and peppers are tender.",
      "Garnish with fresh parsley before serving."
    ],
    prepTime: 20,
    cookTime: 45,
    servings: 4,
    dietType: "nonveg",
    mealType: "dinner",
    source: "custom"
  },
  {
    id: 10013,
    name: "Chickpea and Spinach Curry",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 310,
    protein: 15,
    carbs: 45,
    fat: 10,
    ingredients: [
      "2 cans (15 oz each) chickpeas, drained and rinsed",
      "4 cups fresh spinach",
      "1 onion, diced",
      "3 cloves garlic, minced",
      "1 tbsp ginger, grated",
      "1 can (14 oz) diced tomatoes",
      "1 can (14 oz) coconut milk",
      "2 tbsp curry powder",
      "1 tsp cumin",
      "1/2 tsp turmeric",
      "1/4 tsp cayenne pepper (optional)",
      "2 tbsp olive oil",
      "Salt and pepper to taste",
      "Fresh cilantro for garnish",
      "Lime wedges for serving"
    ],
    steps: [
      "Heat olive oil in a large pot over medium heat.",
      "Add onion and cook until translucent, about 5 minutes.",
      "Add garlic and ginger, cook for 30 seconds until fragrant.",
      "Stir in curry powder, cumin, turmeric, and cayenne (if using). Toast spices for 1 minute.",
      "Add diced tomatoes and cook for 3-4 minutes, stirring occasionally.",
      "Add chickpeas and coconut milk. Bring to a simmer.",
      "Reduce heat to low and simmer for 15 minutes, stirring occasionally.",
      "Add spinach and stir until wilted, about 2 minutes.",
      "Season with salt and pepper to taste.",
      "Garnish with fresh cilantro and serve with lime wedges."
    ],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    dietType: "vegan",
    mealType: "dinner",
    source: "custom"
  },
  {
    id: 10014,
    name: "Baked Sweet Potato Fries",
    image: "https://images.unsplash.com/photo-1604506922700-c1fe1c83dea6?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 180,
    protein: 3,
    carbs: 30,
    fat: 7,
    ingredients: [
      "2 medium sweet potatoes, cut into 1/2-inch sticks",
      "1 tbsp olive oil",
      "1 tsp paprika",
      "1/2 tsp garlic powder",
      "1/2 tsp onion powder",
      "1/4 tsp cayenne pepper (optional)",
      "Salt and pepper to taste",
      "2 tbsp fresh parsley, chopped (optional)",
      "Greek yogurt or ketchup for dipping (optional)"
    ],
    steps: [
      "Preheat oven to 425°F (220°C). Line a baking sheet with parchment paper.",
      "In a large bowl, toss sweet potato sticks with olive oil and all seasonings until evenly coated.",
      "Arrange sweet potatoes in a single layer on the baking sheet, leaving space between each piece.",
      "Bake for 15 minutes, then flip and bake for another 10-15 minutes until crispy and golden brown.",
      "Sprinkle with additional salt and fresh parsley if desired.",
      "Serve with Greek yogurt or ketchup for dipping."
    ],
    prepTime: 10,
    cookTime: 30,
    servings: 2,
    dietType: "vegan",
    mealType: "snack",
    source: "custom"
  },
  {
    id: 10015,
    name: "Banana Oatmeal Protein Muffins",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&q=80&w=1000",
    calories: 150,
    protein: 8,
    carbs: 25,
    fat: 4,
    ingredients: [
      "2 ripe bananas, mashed",
      "2 eggs",
      "1/4 cup Greek yogurt",
      "1/4 cup honey or maple syrup",
      "1 tsp vanilla extract",
      "1.5 cups rolled oats",
      "1 scoop vanilla protein powder",
      "1 tsp baking powder",
      "1 tsp cinnamon",
      "1/4 tsp salt",
      "1/2 cup mix-ins of choice (chocolate chips, blueberries, chopped nuts)"
    ],
    steps: [
      "Preheat oven to 350°F (175°C). Line a muffin tin with paper liners or spray with cooking spray.",
      "In a large bowl, mash bananas well. Add eggs, Greek yogurt, honey, and vanilla extract. Mix until combined.",
      "In another bowl, combine oats, protein powder, baking powder, cinnamon, and salt.",
      "Add dry ingredients to wet ingredients and stir until just combined.",
      "Fold in your mix-ins of choice.",
      "Divide batter evenly among 12 muffin cups.",
      "Bake for 20-25 minutes until a toothpick inserted in the center comes out clean.",
      "Allow muffins to cool in the tin for 10 minutes before transferring to a wire rack to cool completely."
    ],
    prepTime: 15,
    cookTime: 25,
    servings: 12,
    dietType: "veg",
    mealType: "snack",
    source: "custom"
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse query parameters from URL
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // Get parameters from request
    let query = '';
    let bodyData = null;
    
    if (req.method === 'POST') {
      try {
        // Try to parse the request body if it exists
        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const text = await req.text();
          if (text && text.trim().length > 0) {
            bodyData = JSON.parse(text);
            query = bodyData?.query || '';
          }
        }
      } catch (error) {
        console.error('Error parsing request body:', error);
        // Continue without body data if parsing fails
      }
    } else {
      query = searchParams.get('query') || '';
    }
    
    const category = searchParams.get('category') || '';
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Filter custom recipes based on query if provided
    let filteredCustomRecipes = [...customRecipes];
    if (query) {
      filteredCustomRecipes = customRecipes.filter(recipe => 
        recipe.name.toLowerCase().includes(query.toLowerCase()) ||
        recipe.ingredients.some(i => i.toLowerCase().includes(query.toLowerCase())) ||
        recipe.dietType.toLowerCase().includes(query.toLowerCase()) ||
        recipe.mealType.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Fetch recipes from external API (TheMealDB)
    let apiRecipes = [];
    try {
      let apiUrl = 'https://www.themealdb.com/api/json/v1/1/';
      
      if (query) {
        apiUrl += `search.php?s=${encodeURIComponent(query)}`;
      } else if (category) {
        apiUrl += `filter.php?c=${encodeURIComponent(category)}`;
      } else {
        apiUrl += 'random.php';
      }
      
      console.log("Fetching from:", apiUrl);
      const response = await fetch(apiUrl);
      const data: RecipeApiResponse = await response.json();
      
      if (data.meals) {
        apiRecipes = await Promise.all(data.meals.map(async (meal) => {
          // Get nutrition data from NinjaAPI or use random values
          let nutritionData = {
            calories: Math.floor(Math.random() * 300) + 200, // Default random values
            protein_g: Math.floor(Math.random() * 20) + 10,
            fat_g: Math.floor(Math.random() * 15) + 5,
            carbohydrates_g: Math.floor(Math.random() * 30) + 20
          };
          
          // Get ingredients from meal object
          const ingredients = [];
          for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}` as keyof typeof meal];
            const measure = meal[`strMeasure${i}` as keyof typeof meal];
            
            if (ingredient && ingredient.trim() !== '') {
              ingredients.push(`${measure?.trim() || ''} ${ingredient.trim()}`);
            }
          }
          
          // Calculate prep time based on number of ingredients (simple heuristic)
          const prepTime = Math.max(10, ingredients.length * 2);
          const cookTime = Math.max(15, ingredients.length * 3);
          
          // Split instructions into steps
          const steps = meal.strInstructions
            .split(/\r\n|\r|\n/)
            .filter(step => step.trim() !== '')
            .map(step => step.trim());
          
          // Determine diet type based on category and ingredients
          let dietType = 'nonveg';
          const vegetarianCategories = ['Vegetarian', 'Vegan', 'Side', 'Breakfast', 'Dessert'];
          const nonVegIndicators = ['chicken', 'beef', 'pork', 'meat', 'fish', 'seafood', 'lamb'];
          
          if (vegetarianCategories.includes(meal.strCategory)) {
            dietType = 'veg';
            
            // Check for vegan indicators
            if (meal.strCategory === 'Vegan' || 
                !ingredients.some(i => i.toLowerCase().includes('egg') || 
                                    i.toLowerCase().includes('milk') ||
                                    i.toLowerCase().includes('cheese') ||
                                    i.toLowerCase().includes('butter'))) {
              dietType = 'vegan';
            }
          } else {
            // Check ingredients for non-veg indicators
            if (!ingredients.some(i => nonVegIndicators.some(nvi => i.toLowerCase().includes(nvi)))) {
              dietType = 'veg';
            }
          }
          
          // Determine meal type based on category
          let mealType = 'dinner';
          if (meal.strCategory === 'Breakfast') {
            mealType = 'breakfast';
          } else if (meal.strCategory === 'Dessert' || meal.strCategory === 'Side') {
            mealType = 'snack';
          } else if (meal.strCategory === 'Starter') {
            mealType = 'lunch';
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
          };
        }));
      }
    } catch (error) {
      console.error('API fetch error:', error);
    }
    
    // Combine our custom recipes with API recipes
    const combinedRecipes = [...filteredCustomRecipes, ...apiRecipes];
    
    return new Response(
      JSON.stringify({
        recipes: combinedRecipes,
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        recipes: customRecipes // Fallback to returning custom recipes on error
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
