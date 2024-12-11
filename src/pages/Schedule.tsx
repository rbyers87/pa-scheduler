import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Schedule = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Schedule</h1>
      <Card>
        <CardHeader>
          <CardTitle>Today's Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Schedule content will go here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;