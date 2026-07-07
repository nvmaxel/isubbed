import Room from "@/components/Room";
import WelcomeView from "@/components/WelcomeView";

// /yes video: https://www.youtube.com/embed/dfOrX4_eZ50
export default function YesPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Room>
        <WelcomeView />
      </Room>
    </div>
  );
}
