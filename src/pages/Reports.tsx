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

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Report = Tables<'reports'>

const Reports = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!session?.user?.id) return;

      console.log("Fetching reports for user:", session.user.id);
      
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*');

        if (error) {
          console.error("Error fetching reports:", error);
          toast({
            title: "Error",
            description: "Failed to load reports.",
            variant: "destructive",
          });
        } else {
          console.log("Reports fetched successfully:", data);
          setReports(data || []);
        }
      } catch (error) {
        console.error("Error in fetchReports:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    };

    fetchReports();
  }, [session, toast]);

  const handleExport = () => {
    // Logic to export reports to print
    console.log("Exporting reports...");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      <Button onClick={handleExport}>Export Reports</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Report Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.name}</TableCell>
              <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => console.log("Viewing report", report.id)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {reports.length === 0 && (
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