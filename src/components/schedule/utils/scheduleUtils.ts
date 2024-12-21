import { format } from "date-fns";
import { ScheduleData, TimeBlock } from "../types/TimeBlock";

export const generateTimeBlocks = (schedules: ScheduleData[], date: Date): TimeBlock[] => {
  const blocks: TimeBlock[] = [];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  for (let time = startOfDay.getTime(); time <= endOfDay.getTime(); time += 900000) {
    const blockTime = new Date(time);
    blocks.push({
      time: format(blockTime, "HH:mm"),
      schedules: [],
    });
  }

  schedules.forEach((schedule) => {
    if (!schedule.start_time || !schedule.end_time || !schedule.employee) return;

    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    const employeeName = `${schedule.employee.first_name} ${schedule.employee.last_name}`;

    blocks.forEach((block) => {
      if (!block.time) return;
      const blockTime = new Date(`${date.toISOString().split("T")[0]}T${block.time}:00`);
      if (blockTime >= startTime && blockTime < endTime) {
        block.schedules.push({
          scheduleId: schedule.id,
          employeeName: employeeName,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
        });
      }
    });
  });

  return blocks;
};