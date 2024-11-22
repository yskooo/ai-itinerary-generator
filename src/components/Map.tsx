"use client";

import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { useMemo } from "react";
import { env } from "~/env";

const PHILIPPINES_CENTER = {
    lat: 12.8797,
    lng: 121.7740
};

const mapOptions = {
    disableDefaultUI: true,
    clickableIcons: true,
    scrollwheel: true,
    styles: [
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
        },
        {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
        },
        {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [{ color: "#ffffff" }, { lightness: 17 }]
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }]
        }
    ]
};

export default function Map() {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    });

    const center = useMemo(() => PHILIPPINES_CENTER, []);

    if (!isLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <GoogleMap
            zoom={6}
            center={center}
            mapContainerClassName="w-full h-screen"
            options={mapOptions}
        />
    );
}