'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon not showing in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map view changes
function ChangeView({ center, zoom }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    return null;
}

export default function MapComponent({ latitude, longitude, city, country, ip }) {
    const position = [latitude, longitude];
    const zoom = 10;

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            scrollWheelZoom={true}
        >
            <ChangeView center={position} zoom={zoom} />

            {/* OpenStreetMap tiles - FREE, no API key needed */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Location marker */}
            <Marker position={position}>
                <Popup>
                    <div className="text-center">
                        <strong className="text-lg">{ip}</strong>
                        <br />
                        <span className="text-gray-600">{city}, {country}</span>
                        <br />
                        <span className="text-xs text-gray-500">
                            {latitude.toFixed(4)}, {longitude.toFixed(4)}
                        </span>
                    </div>
                </Popup>
            </Marker>
        </MapContainer>
    );
}
