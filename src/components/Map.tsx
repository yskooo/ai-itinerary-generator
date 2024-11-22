'use client';

import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { useState } from 'react';
import { env } from '~/env';
const containerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '500px'
};

const center = {
    lat: 14.5995, // Manila coordinates
    lng: 120.9842
};

export default function Map() {
    const [map, setMap] = useState<google.maps.Map | null>(null);

    return (
        <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
            <LoadScript googleMapsApiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={11}
                    onLoad={map => setMap(map)}
                >
                </GoogleMap>
            </LoadScript>
        </div>
    );
}