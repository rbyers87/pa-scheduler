import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Employees = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Employee Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Employee list will go here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;