"use client";
import React, { useEffect, useState } from "react";
import API from "@/utils/api";
import { useRouter } from "next/navigation";

export default function VehicleForm() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState({
    vehicleType: "",
    brand: "",
    model: "",
    rentPerDay: "",
    location: "",
    latitude: "",
    longitude: "",
    images: [],
  });

  const [msg, setMsg] = useState("");
  const [locLoading, setLocLoading] = useState(true);

  // ✅ Auto-fetch user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setVehicle((prev) => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6),
          }));
          setLocLoading(false);
        },
        (err) => {
          console.error("Location error:", err);
          setLocLoading(false);
        }
      );
    } else {
      console.warn("Geolocation not supported in this browser.");
      setLocLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setVehicle({ ...vehicle, images: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(vehicle).forEach(([key, value]) => {
        if (key === "images") {
          value.forEach((file) => formData.append("images", file));
        } else {
          formData.append(key, value);
        }
      });

      await API.post("/vehicles/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg("✅ Vehicle added successfully!");
      setTimeout(() => router.push("/owner/my-vehicles"), 1200);
    } catch (err) {
      console.error("Error Details:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
      setMsg(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-24 md:mt-32">
      <h1 className="text-2xl font-semibold mb-4">Add Vehicle</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          name="vehicleType"
          value={vehicle.vehicleType}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-black"
          required
        >
          <option value="">Select Vehicle Type</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="scooter">Scooter</option>
          <option value="suv">SUV</option>
          <option value="sedan">Sedan</option>
        </select>

        <input
          type="text"
          name="brand"
          placeholder="Brand (e.g., Maruti, Hyundai)"
          value={vehicle.brand}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-black"
          required
        />

        <input
          type="text"
          name="model"
          placeholder="Model (e.g., Swift, Creta)"
          value={vehicle.model}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-black"
          required
        />

        <input
          type="number"
          name="rentPerDay"
          placeholder="Rent per day (₹)"
          value={vehicle.rentPerDay}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-black"
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={vehicle.location}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-black"
          required
        />

        {/* ✅ Location status indicator */}
        {locLoading ? (
          <p className="text-sm text-gray-500">📍 Getting your location...</p>
        ) : vehicle.latitude && vehicle.longitude ? (
          <p className="text-sm text-green-600">
            ✅ Location captured: {vehicle.latitude}, {vehicle.longitude}
          </p>
        ) : (
          <p className="text-sm text-red-600">
            ⚠️ Location not available. Please enable GPS.
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Images (Max 5)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="w-full text-black border rounded px-3 py-2"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {vehicle.images.length} file(s) selected
          </p>
        </div>

        <button
          type="submit"
          disabled={locLoading}
          className={`w-full py-2 rounded text-white transition-colors ${locLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {locLoading ? "Getting Location..." : "Add Vehicle"}
        </button>
      </form>

      {msg && (
        <p
          className={`mt-3 text-center ${msg.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
