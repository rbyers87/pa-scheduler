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

const Reports = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!session) return;

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Error",
          description: "Failed to load reports.",
          variant: "destructive",
        });
      } else {
        setReports(data);
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
