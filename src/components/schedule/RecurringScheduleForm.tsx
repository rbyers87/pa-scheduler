const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!userProfile || !["admin", "supervisor"].includes(userProfile.role)) {
    toast({
      title: "Permission Denied",
      description: "Only administrators and supervisors can create recurring schedules",
      variant: "destructive",
    });
    return;
  }

  if (!selectedShift || !selectedEmployee || selectedDays.length === 0 || !beginDate) {
    toast({
      title: "Error",
      description: "Please fill in all required fields",
      variant: "destructive",
    });
    return;
  }

  try {
    // Use beginDate to set the start time and end time
    const currentDate = new Date(beginDate); // Start date from input
    const startTime = new Date(currentDate.setHours(0, 0, 0, 0)).toISOString(); // Start of the day, formatted as ISO string
    const endTime = new Date(currentDate.setHours(23, 59, 59, 999)).toISOString(); // End of the day, formatted as ISO string

    console.log("Creating recurring schedule:", {
      employee_id: selectedEmployee,
      shift_id: selectedShift,
      days: selectedDays,
      begin_date: beginDate,
      start_time: startTime,
      end_time: endTime,
    });

    const { error } = await supabase.from("recurring_schedules").insert({
      employee_id: selectedEmployee,
      shift_id: selectedShift,
      days: selectedDays,
      begin_date: beginDate,
      start_time: startTime, // Pass the ISO formatted date
      end_time: endTime, // Pass the ISO formatted date
    });

    if (error) throw error;

    toast({
      title: "Success",
      description: "Recurring schedule created successfully",
    });

    // Reset form
    setSelectedShift(undefined);
    setSelectedDays([]);
    setSelectedEmployee(undefined);
    setBeginDate(new Date().toISOString().split('T')[0]);
    setEndDate(undefined);
  } catch (error) {
    console.error("Error creating recurring schedule:", error);
    toast({
      title: "Error",
      description: "Failed to create recurring schedule",
      variant: "destructive",
    });
  }
};
