import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

type Report = Tables<'reports'>;

const Index = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Index: Component mounted with session:", {
      userId: session?.user?.id,
      role: session?.user?.user_metadata?.role
    });
  }, [session]);

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      console.log("Index: Starting reports fetch");
      
      const { data, error: queryError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
        .throwOnError();

      if (queryError) {
        console.error("Index: Error fetching reports:", queryError);
        throw queryError;
      }

      console.log("Index: Successfully fetched reports:", {
        count: data?.length || 0
      });

      return data || [];
    },
    meta: {
      onError: (error: any) => {
        console.error("Index: Query error:", error);
        toast({
          title: "Error",
          description: "Failed to load recent reports. Please try again.",
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 rounded-md bg-red-50">
              Error loading reports. Please try again.
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report: Report) => (
                <div key={report.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">{report.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {format(new Date(report.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 p-4">
              No reports available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;