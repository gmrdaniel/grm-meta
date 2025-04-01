
import FacebookPageInfoCard from "./FacebookPageInfoCard";
import FacebookReelsCard from "./FacebookReelsCard";

export default function FacebookApiTabs() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <FacebookPageInfoCard />
      <FacebookReelsCard />
    </div>
  );
}
