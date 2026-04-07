"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image'; 

export const VehiclemainCard = ({ vehicle, index, showCards }) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imgSrc, setImgSrc] = useState(vehicle.images?.[currentImageIndex] || "/car-placeholder.jpg"); // ✅ State for image src

  const totalImages = vehicle?.images?.length || 0;
  const hasMultipleImages = totalImages > 1;

  const changeImage = (direction) => {
    if (totalImages <= 1) return;

    setIsTransitioning(true);
    setTimeout(() => {
      const newIndex = direction === 'next' 
        ? (currentImageIndex + 1) % totalImages
        : (currentImageIndex - 1 + totalImages) % totalImages;
      
      setCurrentImageIndex(newIndex);
      setImgSrc(vehicle.images?.[newIndex] || "/car-placeholder.jpg");
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const nextImage = () => changeImage('next');
  const prevImage = () => changeImage('prev');

  // Mock features (आपके vehicle data के अनुसार adjust करें)
  const vehicleFeatures = [
    `${vehicle.fuelType || 'Petrol'}`,
    `${vehicle.seatingCapacity || '4'} Seater`,
    vehicle.ac ? 'AC' : 'Non-AC',
  ].filter(Boolean);

  return (
    <div
      className={`
        bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 
        transform group hover:border-orange-500/30 border border-gray-200 
        cursor-pointer overflow-hidden flex flex-col
        ${showCards 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-10 opacity-0'
        }
      `}
      style={{
        transitionDelay: `${index * 100}ms`
      }}
    >
      {/* Image Container with gradient overlay - Exactly like categories */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Image with navigation arrows - ✅ Fixed with Image component */}
        <div className="relative w-full h-full">
          <Image
            src={imgSrc}
            alt={`${vehicle.brand} ${vehicle.model}`}
            width={400}
            height={192}
            className={`
              w-full h-full object-cover transition-all duration-500
              ${isTransitioning ? 'scale-105 opacity-70' : 'scale-100 opacity-100'}
              group-hover:scale-110
            `}
            unoptimized={true}
            priority={false}
            onError={() => {
              setImgSrc("/car-placeholder.jpg");
            }}
          />
          
          {/* Overlay during transition */}
          {isTransitioning && (
            <div className="absolute inset-0 bg-black/20 transition-all duration-500"></div>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />

        {/* Left Arrow */}
        {hasMultipleImages && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
          >
            ‹
          </button>
        )}

        {/* Right Arrow */}
        {hasMultipleImages && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
          >
            ›
          </button>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm z-10">
            {currentImageIndex + 1} / {totalImages}
          </div>
        )}
      </div>

      {/* Content Section - Same as categories layout */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="space-y-4 flex-grow">
          {/* Vehicle Title and Description */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-gray-500 text-sm capitalize">
              {vehicle.type} • {vehicle.year || '2023'} • {vehicle.fuelType || 'Petrol'}
            </p>
          </div>

          {/* Features - Same style as categories */}
          <div className="flex gap-2 flex-wrap">
            {vehicleFeatures.map((feature, idx) => (
              <span
                key={idx}
                className="bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Price and Button Section */}
        <div className="pt-4 border-t border-gray-200/50 mt-auto">
          {/* Price */}
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-gray-500 text-sm">From</span>
            <span className="text-orange-500 font-bold text-2xl">₹{vehicle.rentPerDay}</span>
            <span className="text-gray-500 text-sm">/day</span>
          </div>

          {/* Distance if available */}
          {vehicle.distance && (
            <div className="text-center mb-3">
              <p className="text-blue-600 text-sm">
                📍 {vehicle.distance.toFixed(1)} km away
              </p>
            </div>
          )}

          {/* View Details Button */}
          <button
            onClick={() => router.push(`/book/${vehicle._id}`)}
            className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-all duration-300 cursor-pointer"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};