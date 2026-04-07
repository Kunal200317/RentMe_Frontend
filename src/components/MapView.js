"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Red circular icon for vehicles
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Blue icon for user location
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🗺️ Distance calculation
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 🗺️ Auto-fit map to show user + vehicles
function FitMap({ vehicles, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation && vehicles.length === 0) return;

    const points = [
      ...(userLocation ? [userLocation] : []),
      ...vehicles.map((v) => {
        // Different coordinate formats handle karein
        if (v.locationGeo && v.locationGeo.coordinates) {
          return [v.locationGeo.coordinates[1], v.locationGeo.coordinates[0]]; // [lat, lng]
        } else if (v.lat && v.lng) {
          return [v.lat, v.lng]; // Direct lat,lng
        } else if (v.latitude && v.longitude) {
          return [v.latitude, v.longitude]; // latitude,longitude
        }
        return null;
      }).filter(Boolean),
    ];

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [vehicles, userLocation, map]);

  return null;
}

// ✅ Main MapView component
export default function MapView({ vehicles = [] }) {
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        console.log("📍 User actual coordinates:", userLat, userLng);
        setUserLocation([userLat, userLng]);

        // Get address for verification
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLat}&longitude=${userLng}&localityLanguage=en`
          );
          const data = await response.json();
          console.log("🏠 User location address:", data);
          setUserAddress(`${data.city}, ${data.locality}, ${data.countryName}`);
        } catch (error) {
          console.log("❌ Could not fetch address");
        }
      },
      (error) => {
        console.error("❌ Error getting location:", error);
      }
    );
  }, []);



  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-md relative">
      {/* Location Info Overlay */}
      {userAddress && (
        <div className="absolute top-2 left-3 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
          <div className="text-sm font-semibold text-gray-800">
            📍 Your Location: {userAddress}
          </div>
        </div>
      )}

      <MapContainer
        center={userLocation }
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        <FitMap vehicles={vehicles} userLocation={userLocation} />

    

        {/* Vehicle markers */}
        {vehicles.map((v) => {
          let vehicleLat, vehicleLng;

          if (v.locationGeo && v.locationGeo.coordinates) {
            // Format: { locationGeo: { coordinates: [lng, lat] } }
            vehicleLng = v.locationGeo.coordinates[0];
            vehicleLat = v.locationGeo.coordinates[1];
          } else if (v.lat && v.lng) {
            // Format: { lat: xx, lng: xx }
            vehicleLat = v.lat;
            vehicleLng = v.lng;
          } else if (v.latitude && v.longitude) {
            // Format: { latitude: xx, longitude: xx }
            vehicleLat = v.latitude;
            vehicleLng = v.longitude;
          } else {
            console.warn("❌ Vehicle has no coordinates:", v);
            return null;
          }

          const distance = userLocation
            ? getDistanceFromLatLonInKm(
              userLocation[0],
              userLocation[1],
              vehicleLat,
              vehicleLng
            ).toFixed(2)
            : null;

          return (
            <Marker key={v._id} position={[vehicleLat, vehicleLng]} icon={redIcon}>
              <Popup>
                <div className="text-center">
                  <b>{v.brand} {v.model}</b> <br />
                  Rent: ₹{v.rentPerDay}/day <br />
                  Type: {v.vehicleType || v.type} <br />
                  {distance && <span>📍 {distance} km away</span>}
                </div>
              </Popup>
            </Marker>
          );
          
        })}

        {/* User marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <b>📍 You are here</b><br />
                {userAddress || "Your current location"}
              </div>
            </Popup>
          </Marker>
        )}
        
      </MapContainer>

    </div>
  );
}