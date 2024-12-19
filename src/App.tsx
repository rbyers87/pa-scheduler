import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";  // Assuming AuthContext is where the accessToken is provided
import { useNavigate } from "react-router-dom";
import HomePage from "@/components/HomePage";  // Example component
import LoginPage from "@/components/LoginPage";  // Example component
import ProtectedPage from "@/components/ProtectedPage";  // Example component
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client
import { useToast } from "@/components/ui/use-toast"; // Assuming you use toast notifications

const App = () => {
  const { session, accessToken, user } = useAuth();  // Access session and accessToken from context
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle accessToken or session updates if needed
    if (accessToken) {
      console.log("Access token is available:", accessToken);

      // Optionally, set the Supabase session using the accessToken (if not already set)
      supabase.auth.setAuth(accessToken);  // Sets the token to Supabase client if needed
    }
  }, [accessToken]);

  useEffect(() => {
    if (session && user) {
      // User is authenticated, you can handle logic like redirecting to home or protected pages
      console.log("User is authenticated:", user);
    } else {
      // User is not authenticated, redirect to login
      console.log("User is not authenticated, redirecting to login...");
      navigate("/login", { replace: true });
    }
  }, [session, user, navigate]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={session ? <HomePage /> : <LoginPage />}
        />
        <Route
          path="/protected"
          element={session ? <ProtectedPage /> : <LoginPage />}
        />
      </Routes>
    </Router>
  );
};

export default App;
