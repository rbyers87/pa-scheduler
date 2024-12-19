import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  session: Session | null | undefined;
  user: User | null;
  access_token: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: undefined,
  user: null,
  access_token: null,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [access_token, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider: Setting up auth subscriptions");

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("AuthProvider: Initial session retrieved", initialSession);
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          setAccessToken(initialSession.access_token);
        } else {
          setSession(null);
          setUser(null);
          setAccessToken(null);
          console.log("AuthProvider: No initial session found");
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setSession(null);
        setUser(null);
        setAccessToken(null);
      }
    };

    initializeAuth();

    // Set up auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log("Auth state changed:", _event, currentSession);

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setAccessToken(currentSession.access_token);

          if (_event === 'SIGNED_IN') {
            console.log("User signed in, navigating to /");
            navigate("/", { replace: true });
          }
        } else {
          setSession(null);
          setUser(null);
          setAccessToken(null);

          if (_event === 'SIGNED_OUT') {
            console.log("User signed out, navigating to login");
            navigate("/login", { replace: true });
          }
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log("AuthProvider: Cleaning up subscriptions");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    access_token,
    signOut,
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