
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <FitnessProvider>
          <ShakeDetectionProvider>
            <RecipeProvider>
              <div className="app-container">
                <Routes>
                  <Route path="/" element={user ? <HomePage /> : <LoginPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/qr-scanner" element={<QrScannerPage />} />
                  <Route path="/camera" element={<CameraPage />} />
                  <Route path="/recipes" element={<RecipesPage />} />
                  <Route path="/recipe/:id" element={<RecipeDetailPage />} />
                  <Route path="/videos" element={<RecipeVideosPage />} />
                  <Route path="/calories" element={<CalorieTrackingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </RecipeProvider>
          </ShakeDetectionProvider>
        </FitnessProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
