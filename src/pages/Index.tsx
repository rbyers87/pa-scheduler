import { DailyBlocksView } from "@/components/schedule/DailyBlocksView";

export default function Index({ accessToken }: { accessToken: string }) {
  return (
    <div className="container mx-auto py-6">
      <DailyBlocksView date={new Date()} />
    </div>
  );
}