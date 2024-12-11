import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TimeOff = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Time Off Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Request Time Off</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Time off request form will go here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeOff;