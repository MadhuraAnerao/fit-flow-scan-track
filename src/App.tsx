
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useIsMobile } from './hooks/use-mobile';
import { supabase } from './integrations/supabase/client';
import { AuthProvider } from './contexts/AuthContext';
import { FitnessProvider } from './contexts/FitnessContext';
import { ShakeDetectionProvider } from './contexts/ShakeDetectionContext';
import { RecipeProvider } from './contexts/RecipeContext';

// Pages
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import RecipeVideosPage from './pages/RecipeVideosPage';
import NotFound from './pages/NotFound';
import ProfilePage from './pages/ProfilePage';
import CalorieTrackingPage from './pages/CalorieTrackingPage';
import CameraPage from './pages/CameraPage';
import QrScannerPage from './pages/QrScannerPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';

// Navigation setup
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab navigator for main app screens
const TabNavigator = () => {
  return (
    <Tab.Navigator
      id="MainTabNavigator"
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6', // fitness-primary
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomePage} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="QR Scanner" 
        component={QrScannerPage} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="qrcode" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraPage} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="camera" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Recipes" 
        component={RecipesPage} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="utensils" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Videos" 
        component={RecipeVideosPage} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="video" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Calories" 
        component={CalorieTrackingPage} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfilePage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Helper component for tab icons
const TabIcon = ({ icon, color, size }) => {
  // In Expo we would use the Expo vector icons
  // For now using placeholder for compile
  return <View style={{ width: size, height: size }}><Text style={{ color }}>{icon}</Text></View>;
};

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up auth subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AuthProvider>
        <FitnessProvider>
          <ShakeDetectionProvider>
            <RecipeProvider>
              <Stack.Navigator
                initialRouteName={user ? "MainTabs" : "Login"}
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="Login" component={LoginPage} />
                <Stack.Screen name="Onboarding" component={OnboardingPage} />
                <Stack.Screen name="MainTabs" component={TabNavigator} />
                <Stack.Screen name="RecipeDetail" component={RecipeDetailPage} />
                <Stack.Screen name="NotFound" component={NotFound} />
              </Stack.Navigator>
            </RecipeProvider>
          </ShakeDetectionProvider>
        </FitnessProvider>
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;
