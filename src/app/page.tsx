import Map from "~/components/Map";
export default function Home() {
  return (
    <div className="h-screen flex">
      <div className="flex-1 relative">
        <Map />
      </div>
    </div>
  );
}
