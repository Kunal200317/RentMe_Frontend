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
      <div className="relative h-64 md:h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Image with navigation arrows - ✅ Fixed with Image component */}
        <div className="relative w-full h-full">
          <Image
            src={imgSrc}
            alt={`${vehicle.brand} ${vehicle.model}`}
            width={400}
            height={256}
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
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
          >
            ›
          </button>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm z-10">
            {currentImageIndex + 1} / {totalImages}
          </div>
        )}
      </div>

      {/* Content Section - Same as categories layout */}
      <div className="p-6 md:p-5 flex flex-col flex-grow">
        <div className="space-y-4 flex-grow">
          {/* Vehicle Title and Description */}
          <div className="space-y-2">
            <h3 className="text-2xl md:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-gray-500 text-sm font-medium capitalize">
              {vehicle.type} • {vehicle.year || '2023'} • {vehicle.fuelType || 'Petrol'}
            </p>
          </div>

          {/* Features - Same style as categories */}
          <div className="flex gap-2 flex-wrap">
            {vehicleFeatures.map((feature, idx) => (
              <span
                key={idx}
                className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-orange-100"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Price and Button Section */}
        <div className="pt-4 border-t border-gray-100 mt-6 md:mt-4">
          {/* Price */}
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Per Day</span>
              <span className="text-orange-600 font-extrabold text-2xl">₹{vehicle.rentPerDay}</span>
            </div>
            {vehicle.distance && (
              <div className="flex items-center gap-1 text-blue-600 font-bold text-sm bg-blue-50 px-2 py-1 rounded-lg">
                📍 {vehicle.distance.toFixed(1)} km
              </div>
            )}
          </div>

          {/* View Details Button */}
          <button
            onClick={() => router.push(`/book/${vehicle._id}`)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 md:py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform active:scale-95"
          >
            Book This Ride
          </button>
        </div>
      </div>
    </div>
  );
};