export interface Schedule {
  date: Date;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  shiftName?: string;
}

export interface BenefitBalance {
  vacation_hours: number;
  sick_hours: number;
  comp_hours: number;
  holiday_hours: number;
}