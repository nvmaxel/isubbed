import Room from "@/components/Room";
import HonestView from "@/components/HonestView";

export default function NoPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Room>
        <HonestView />
      </Room>
    </div>
  );
}
