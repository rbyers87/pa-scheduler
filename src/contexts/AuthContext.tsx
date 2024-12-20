import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { ToastProps } from "@/components/ui/toast";

interface AuthContextType {
  session: Session | null | undefined;
  user: User | null;
  accessToken: string | null;
  signOut: () => Promise<void>;
  toast: (props: ToastProps) => {
    id: string;
    dismiss: () => void;
    update: (props: ToastProps) => void;
  };
}

const AuthContext = createContext<AuthContextType>({
  session: undefined,
  user: null,
  accessToken: null,
  signOut: async () => {},
  toast: () => ({ id: "", dismiss: () => {}, update: () => {} }),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider: Setting up auth subscriptions");

    const initializeAuth = async () => {
      try {
        // Get the initial session
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

    // Set up the auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setAccessToken(currentSession.access_token);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log("User signed in or token refreshed, navigating to /");
            navigate("/");
          }
        } else {
          console.log("No session in auth state change");
          setSession(null);
          setUser(null);
          setAccessToken(null);
          
          if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            console.log("User signed out or deleted, navigating to login");
            navigate("/login");
          }
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log("AuthProvider: Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
      });
      
      // Clear local state
      setSession(null);
      setUser(null);
      setAccessToken(null);
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    accessToken,
    signOut,
    toast,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};