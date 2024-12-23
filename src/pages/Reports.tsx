/**
 * Reports Page
 * 
 * Generates and displays various scheduling reports.
 * Features:
 * - Daily riding lists
 * - Schedule coverage reports
 * - Time off reports
 * - Export reports to print
 */

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";

type Report = Tables<'reports'>

const Reports = () => {
  const { session, accessToken } = useAuth();
  const { toast } = useToast();

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id || !accessToken) {
        throw new Error('No authenticated session');
      }

      console.log("Fetching reports for user:", session.user.id);
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching reports:", error);
        throw error;
      }

      console.log("Reports fetched successfully:", data);
      return data || [];
    },
    enabled: !!session?.user?.id && !!accessToken,
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      console.error("Reports query error:", error);
      toast({
        title: "Error",
        description: "Failed to load reports. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return <div>Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      <Button onClick={() => console.log("Exporting reports...")}>Export Reports</Button>
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
    </div>
  );
};

export default Reports;