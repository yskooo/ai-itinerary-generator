"use client";
import { useState } from "react";
import Map from "~/components/Map";
import TravelChat from "~/components/TravelChat";
import { TTravelChat } from "~/components/TravelChat";
export default function Home() {
  const [mapMarkers, setMapMarkers] = useState<TTravelChat[]>([]);

  return (
    <div className="h-screen flex flex-col md:flex-row p-4 gap-4">
      <div className="flex-1 relative">
        <Map markers={mapMarkers} />
      </div>
      <div className="w-full md:w-1/3 h-[500px] md:h-full">
        <TravelChat onUpdateMap={setMapMarkers} />
      </div>
    </div>
  );
}
