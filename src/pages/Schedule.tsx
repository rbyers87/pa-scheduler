import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { ScheduleList } from "@/components/ScheduleList";

const Schedule = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Schedule Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <ScheduleCalendar />
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Employee Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleList />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Schedule;