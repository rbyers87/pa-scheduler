import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: any;
  user: any;
  accessToken: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        console.log("AuthProvider: Initial session retrieved", initialSession);
        
        if (sessionError) {
          console.error("Error getting initial session:", sessionError);
          throw sessionError;
        }

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          setAccessToken(initialSession.access_token);
        } else {
          console.log("No initial session found, redirecting to login");
          setSession(null);
          setUser(null);
          setAccessToken(null);
          navigate("/login");
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        setSession(null);
        setUser(null);
        setAccessToken(null);
        navigate("/login");
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setAccessToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ session, user, accessToken, signOut }}>
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
