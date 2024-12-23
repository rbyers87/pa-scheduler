import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";

type Report = Tables<'reports'>;

const Index = ({ accessToken }: { accessToken: string }) => {
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Index: Component mounted with session:", {
      userId: session?.user?.id,
      hasAccessToken: !!accessToken,
      role: session?.user?.user_metadata?.role
    });
  }, [session, accessToken]);

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.error("Index: No valid session");
        throw new Error('Authentication required');
      }

      console.log("Index: Fetching reports with session:", {
        userId: session.user.id,
        hasAccessToken: !!accessToken
      });

      const { data, error: queryError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .throwOnError();

      if (queryError) {
        console.error("Index: Error fetching reports:", queryError);
        throw queryError;
      }

      console.log("Index: Successfully fetched reports:", {
        count: data?.length || 0
      });

      return (data || []) as Report[];
    },
    enabled: !!session?.user?.id && !!accessToken,
    meta: {
      onError: (error: any) => {
        console.error("Index: Query error:", error);
        toast({
          title: "Error",
          description: "Failed to load reports. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  if (!session?.user?.id) {
    return (
      <div className="text-center py-4">
        Please log in to view this page.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to Aladtec 2.0</h1>
      <div className="grid gap-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">
            Error loading reports. Please try again.
          </div>
        ) : reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} className="p-4 border rounded">
              <h3 className="font-semibold">{report.name}</h3>
              <p className="text-sm text-gray-500">
                Created: {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <div>No reports available.</div>
        )}
      </div>
    </div>
  );
};

export default Index;