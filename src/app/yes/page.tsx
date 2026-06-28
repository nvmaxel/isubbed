import Room from "@/components/Room";
import WelcomeView from "@/components/WelcomeView";

export default function YesPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Room>
        <WelcomeView />
      </Room>
    </div>
  );
}
