export interface TimeBlock {
  id?: string;
  time?: string;
  start_time?: string;
  end_time?: string;
  hasSchedule?: boolean;
  scheduleId?: string;
  employeeName?: string;
  employee?: {
    first_name: string;
    last_name: string;
  };
  schedules?: Array<{
    scheduleId: string;
    employeeName: string;
    start_time: string;
    end_time: string;
  }>;
}