"use client";
import React from "react";
import Image from 'next/image'; 

export default function VehicleCard({ vehicle }) {
  const { images, brand = "Unknown Brand", model = "Unknown Model", vehicleType = "Vehicle", rentPerDay, rent, location = "Location not specified", available = true } = vehicle || {};

  const firstImage = images?.[0] || "/car-placeholder.jpg";
  const finalRent = rentPerDay || rent || "N/A";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition mb-4">
      {/* ✅ Fixed with Image component */}
      <Image
        src={firstImage}
        alt={`${brand} ${model}`}
        width={400}
        height={192}
        className="w-full h-48 object-cover rounded-lg mb-3"
        unoptimized={true}
        priority={false}
        onError={(e) => {
          e.target.src = "/car-placeholder.jpg";
        }}
      />

      <h2 className="text-xl font-semibold text-gray-800">
        {brand} {model}
      </h2>

      <div className="flex flex-wrap gap-2 my-2 text-sm">
        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full capitalize">
          {vehicleType}
        </span>
        <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full">
          ₹{finalRent}/day
        </span>
      </div>

      <p className="text-gray-600 text-sm flex items-center gap-1">
        <span>📍</span>
        {location}
      </p>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <span
          className={`text-sm font-medium ${
            available ? "text-green-600" : "text-red-600"
          }`}
        >
          {available ? "Available" : "Not Available"}
        </span>

        <div className="flex gap-3 text-sm font-medium">
          <button className="text-blue-600 hover:text-blue-800">Edit</button>
          <button className="text-red-600 hover:text-red-800">Delete</button>
        </div>
      </div>
    </div>
  );
}