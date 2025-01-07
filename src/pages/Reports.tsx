import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Download } from "lucide-react";
import { format } from "date-fns";

type Report = Tables<'reports'>;

const Reports = ({ accessToken }: { accessToken: string }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    console.log("Reports: Component mounted with session:", {
      userId: session?.user?.id,
      hasAccessToken: !!accessToken,
      role: session?.user?.user_metadata?.role
    });
  }, [session, accessToken]);

  const { data: reports = [], isLoading, error, refetch } = useQuery({
    queryKey: ['reports', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.error("Reports: No valid session");
        throw new Error('Authentication required');
      }

      console.log("Reports: Fetching reports for user:", session.user.id);

      const { data, error: queryError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

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
      setIsExporting(true);
      console.log("Reports: Starting export process");

      // Here we'll format the reports data for export
      const exportData = reports.map(report => ({
        name: report.name,
        created_at: format(new Date(report.created_at), 'yyyy-MM-dd HH:mm:ss'),
        updated_at: format(new Date(report.updated_at), 'yyyy-MM-dd HH:mm:ss')
      }));

      // Create a Blob with the JSON data
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reports-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Reports: Export completed successfully");
      toast({
        title: "Export Successful",
        description: "Your reports have been exported.",
      });
    } catch (error) {
      console.error("Reports: Error during export:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
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
        <Button 
          onClick={handleExportReports} 
          disabled={isExporting || reports.length === 0}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Reports
            </>
          )}
        </Button>
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
              <TableHead>Created Date</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{format(new Date(report.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(report.updated_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        console.log("Reports: Viewing report", report.id);
                        // Implement view functionality
                        toast({
                          title: "View Report",
                          description: "Report viewer coming soon.",
                        });
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
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