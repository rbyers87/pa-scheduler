import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type Report = Tables<'reports'>;

const Reports = ({ accessToken }: { accessToken: string }) => {
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Reports: Component mounted with session:", {
      userId: session?.user?.id,
      hasAccessToken: !!accessToken,
      role: session?.user?.user_metadata?.role
    });
  }, [session, accessToken]);

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.error("Reports: No valid session");
        throw new Error('Authentication required');
      }

      console.log("Reports: Fetching reports with session:", {
        userId: session.user.id,
        hasAccessToken: !!accessToken,
        role: session.user.user_metadata?.role
      });

      const { data, error: queryError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .throwOnError();

      if (queryError) {
        console.error("Reports: Error fetching reports:", queryError);
        throw queryError;
      }

      console.log("Reports: Successfully fetched reports:", {
        count: data?.length || 0
      });

      return data;
    },
    enabled: !!session?.user?.id && !!accessToken,
    meta: {
      onError: (error: any) => {
        console.error("Reports: Query error:", error);
        toast({
          title: "Error",
          description: "Failed to load reports. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleExportReports = async () => {
    try {
      // Implementation for report export
      console.log("Exporting reports...");
      toast({
        title: "Export Started",
        description: "Your reports are being exported...",
      });
    } catch (error) {
      console.error("Error exporting reports:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export reports. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="text-center py-4">
        Please log in to view reports.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <Button onClick={handleExportReports}>Export Reports</Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          Failed to load reports. Please try refreshing the page.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => console.log("Viewing report", report.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No reports available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Reports;