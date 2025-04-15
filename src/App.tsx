
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useIsMobile } from './hooks/use-mobile';
import { supabase } from './integrations/supabase/client';
import { AuthProvider } from './contexts/AuthContext';
import { FitnessProvider } from './contexts/FitnessContext';
import { ShakeDetectionProvider } from './contexts/ShakeDetectionContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { Layout } from './components/Layout';
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

  return (
    <Router>
      <AuthProvider>
        <FitnessProvider>
          <ShakeDetectionProvider>
            <RecipeProvider>
              {loading ? (
                <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading...</p>
                  </div>
                </div>
              ) : (
                <Routes>
                  <Route path="/login" element={<LoginPage />} />

                  <Route
                    path="/onboarding"
                    element={
                      user ? <OnboardingPage /> : <Navigate to="/login" />
                    }
                  />

                  <Route
                    path="/"
                    element={
                      user ? <Layout><Outlet /></Layout> : <Navigate to="/login" />
                    }
                  >
                    <Route index element={<HomePage />} />
                    <Route path="home" element={<HomePage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="tracking" element={<CalorieTrackingPage />} />
                    <Route path="calories" element={<CalorieTrackingPage />} />
                    <Route path="recipe-videos" element={<RecipeVideosPage />} />
                    <Route path="camera" element={<CameraPage />} />
                    <Route path="qr-scanner" element={<QrScannerPage />} />
                    <Route path="recipes" element={<RecipesPage />} />
                    <Route path="recipes/:id" element={<RecipeDetailPage />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              )}
            </RecipeProvider>
          </ShakeDetectionProvider>
        </FitnessProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
