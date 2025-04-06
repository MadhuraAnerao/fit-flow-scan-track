
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";
import QrScannerPage from "./pages/QrScannerPage";
import CameraPage from "./pages/CameraPage";
import RecipesPage from "./pages/RecipesPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import CalorieTrackingPage from "./pages/CalorieTrackingPage";
import ProfilePage from "./pages/ProfilePage";

// Context providers
import { AuthProvider } from "./contexts/AuthContext";
import { FitnessProvider } from "./contexts/FitnessContext";
import { RecipeProvider } from "./contexts/RecipeContext";
import { ShakeDetectionProvider } from "./contexts/ShakeDetectionContext";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />
      <Route path="/home" element={
        <ProtectedRoute>
          <Layout>
            <HomePage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/qr-scanner" element={
        <ProtectedRoute>
          <Layout>
            <QrScannerPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/camera" element={
        <ProtectedRoute>
          <Layout>
            <CameraPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/recipes" element={
        <ProtectedRoute>
          <Layout>
            <RecipesPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/recipes/:id" element={
        <ProtectedRoute>
          <Layout>
            <RecipeDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/calories" element={
        <ProtectedRoute>
          <Layout>
            <CalorieTrackingPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <ProfilePage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <FitnessProvider>
            <RecipeProvider>
              <ShakeDetectionProvider>
                <AppRoutes />
                <Toaster />
                <Sonner />
              </ShakeDetectionProvider>
            </RecipeProvider>
          </FitnessProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
