import { RidingListManager } from "@/components/riding/RidingListManager";

export default function Index() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Daily Riding List</h1>
      <RidingListManager />
    </div>
  );
}