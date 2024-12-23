import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  session: any;
  user: any;
  accessToken: string | null;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  toast: ReturnType<typeof useToast>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        console.log("AuthProvider: Initial session check", { 
          hasSession: !!initialSession,
          error: sessionError ? 'Yes' : 'No'
        });
        
        if (sessionError) {
          console.error("Error getting initial session:", sessionError);
          setSession(null);
          setUser(null);
          setAccessToken(null);
        } else if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          setAccessToken(initialSession.access_token);
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        setSession(null);
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", { event, userId: currentSession?.user?.id });
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setAccessToken(currentSession.access_token);

          if (event === 'SIGNED_IN') {
            console.log("User signed in, navigating to home");
            navigate("/");
          }
        } else {
          console.log("No session in auth state change");
          setSession(null);
          setUser(null);
          setAccessToken(null);
          
          if (event === 'SIGNED_OUT') {
            console.log("User signed out, navigating to login");
            navigate("/login");
          }
        }
      }
    );

    return () => {
      console.log("AuthProvider: Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
      setAccessToken(data.session?.access_token || null);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setAccessToken(null);
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      // Still clear the state even if the API call fails
      setSession(null);
      setUser(null);
      setAccessToken(null);
      navigate("/login");
    }
  };

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ session, user, accessToken, signOut, login, toast }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};