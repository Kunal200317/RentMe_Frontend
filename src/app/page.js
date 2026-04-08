"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const ProRideRentals = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const router = useRouter();

  const categories = [
    {
      name: "Economy",
      description: "Budget-friendly cars for daily commutes and city driving.",
      image: "/economy-car.jpg",
      features: ["5 Seats", "Manual", "AC"],
      price: "$29"
    },
    {
      name: "Luxury",
      description: "Premium vehicles for special occasions and business travel.",
      image: "/luxury-car.jpg",
      features: ["5 Seats", "Automatic", "Premium"],
      price: "$99"
    },
    {
      name: "SUV",
      description: "Spacious rides for family trips and off-road adventures.",
      image: "/suv-car.jpg",
      features: ["7 Seats", "4WD", "Spacious"],
      price: "$59"
    },
    {
      name: "Van",
      description: "Perfect for moving, large groups, and cargo transport.",
      image: "/van-car.jpg",
      features: ["9 Seats", "Diesel", "Large"],
      price: "$79"
    }
  ];

  const features = [
    {
      icon: "fa-solid fa-shield-halved",
      title: "Fully Insured",
      description: "Drive with peace of mind knowing all our rentals come with comprehensive coverage.",
      color: "blue"
    },
    {
      icon: "fa-solid fa-headset",
      title: "24/7 Support",
      description: "Our dedicated customer support team is always here to help you, day or night.",
      color: "purple"
    },
    {
      icon: "fa-solid fa-percent",
      title: "Best Prices",
      description: "We offer guaranteed competitive rates and transparent pricing with no hidden fees.",
      color: "green"
    },
    {
      icon: "fa-solid fa-location-dot",
      title: "50+ Locations",
      description: "With over 50 locations, you can easily pick up and drop off your vehicle anywhere.",
      color: "orange"
    },
    {
      icon: "fa-solid fa-mobile-screen-button",
      title: "Easy Process",
      description: "Our user-friendly platform makes booking a car a breeze in just 3 simple steps.",
      color: "pink"
    },
    {
      icon: "fa-solid fa-star",
      title: "Top Rated",
      description: "Rated 4.9 stars by over 50,000 satisfied customers. Your satisfaction is our priority.",
      color: "yellow"
    }
  ];

  const steps = [
    {
      number: "01",
      icon: "fa-solid fa-magnifying-glass",
      title: "Search",
      description: "Browse our fleet and select your perfect vehicle based on your needs."
    },
    {
      number: "02",
      icon: "fa-regular fa-calendar-check",
      title: "Book",
      description: "Complete your reservation in just a few clicks with secure online payment."
    },
    {
      number: "03",
      icon: "fa-solid fa-car-side",
      title: "Drive",
      description: "Pick up your car from the designated location and hit the road!"
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log({ pickupLocation, pickupDate, returnDate });
  };

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section with Animations */}
      <section
        className="relative min-h-screen w-full flex items-center justify-start bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: "url('hero-car.jpg')"
        }}
      >
        {/* Animated Background for Parallax Effect */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-parallax"
          style={{
            backgroundImage: "url('hero-car.jpg')",
            animation: 'parallax 20s linear infinite'
          }}
        />

        {/* Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20"></div>

        {/* Animated Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16">
          <div className="flex flex-col justify-center text-white space-y-8 animate-slide-up">
            <span className="bg-white/20 text-white px-4 py-2 rounded-full w-fit text-sm font-medium flex items-center space-x-2 animate-fade-in">
              <i className="fa-solid fa-location-dot text-orange-400"></i>
              <span>Available in 50+ Cities</span>
            </span>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight animate-slide-up-delay-1">
                Rent Your <br />
                <span className="text-orange-500 animate-pulse-slow">Perfect Ride</span>
              </h1>

              <p className="text-lg text-gray-100 max-w-xl leading-relaxed font-light tracking-wide animate-slide-up-delay-2">
                Choose from hundreds of vehicles. Book instantly, drive confidently, and explore without limits.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 animate-slide-up-delay-3">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-full transition flex items-center space-x-2 hover:scale-105 transform duration-300">
                <span>Book Now</span>
                <i className="fa-solid fa-arrow-right animate-bounce-x"></i>
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-8 py-4 rounded-full transition border border-white/30 flex items-center space-x-2 hover:scale-105 transform duration-300">
                <i className="fa-solid fa-play"></i>
                <span>How It Works</span>
              </button>
            </div>
          </div>

          {/* Quick Booking Form with Animation */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 self-center animate-slide-up-form">
            <h2 className="text-2xl font-bold text-gray-900">Quick Booking</h2>
            <form onSubmit={handleSearch} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Enter city or address"
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 focus:scale-105"
                  />
                  <i className="fa-solid fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      placeholder="dd-mm-yyyy"
                      className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 focus:scale-105"
                    />
                    <i className="fa-regular fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      placeholder="dd-mm-yyyy"
                      className="w-full border border-gray-300 rounded-xl px-4 py-4 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 focus:scale-105"
                    />
                    <i className="fa-regular fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition hover:scale-105 transform duration-300 shadow-lg hover:shadow-orange-500/30"
              >
                Search Vehicles
              </button>
            </form>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:flex">
          <div className="flex flex-col items-center text-white">
            <span className="text-sm mb-2 opacity-70">Scroll to explore</span>
            <i className="fa-solid fa-chevron-down text-orange-500"></i>
          </div>
        </div>
      </section>

      {/* Rest of the sections remain the same */}
      {/* Categories Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 animate-fade-in">
            Choose Your Category
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg animate-fade-in-delay">
            From compact cars to spacious vans, find the perfect vehicle for your journey.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-orange-500/30 border border-gray-200 cursor-pointer overflow-hidden flex flex-col animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="space-y-4 flex-grow">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                      <p className="text-gray-500 text-sm">{category.description}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {category.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200/50 mt-auto">
                    <div className="flex items-baseline justify-center gap-1 mb-4">
                      <span className="text-gray-500 text-sm">From</span>
                      <span className="text-orange-500 font-bold text-2xl">{category.price}</span>
                      <span className="text-gray-500 text-sm">/day</span>
                    </div>

                    <button className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-all hover:scale-105 transform duration-300">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 animate-fade-in">How It Works</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg animate-fade-in-delay">
            Get on the road in three simple steps.
          </p>

          <div className="relative mt-20">
            <div
              className="absolute top-1/2 left-0 w-full h-1 bg-orange-200 -translate-y-1/2 hidden md:block z-0"
              style={{ width: 'calc(100% - 100px)', left: '50px' }}
            ></div>

            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center space-y-4 relative group animate-fade-up" style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="bg-orange-500 text-white w-24 h-24 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-orange-200 relative group-hover:scale-110 transition-transform duration-300">
                    <i className={step.icon}></i>
                    <div className="absolute -top-3 -right-3 bg-black text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-white">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="font-bold text-2xl mt-4">{step.title}</h3>
                  <p className="text-gray-500 max-w-xs">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gray-50" id="services">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 animate-fade-in">Why Choose Us?</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg animate-fade-in-delay">
            We make car rental simple, safe, and affordable.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-lg text-left space-y-4 hover:-translate-y-2 transition duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`bg-${feature.color}-100 text-${feature.color}-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl`}>
                  <i className={feature.icon}></i>
                </div>
                <h3 className="font-bold text-xl">{feature.title}</h3>
                <p className="text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-500 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-bold text-xl">RentMe</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted partner for all your car rental needs. Explore the world with comfort and style.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-orange-500 transition">About Us</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Cars</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Services</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-orange-500 transition">Help Center</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-gray-800 text-white px-4 py-2 rounded-l-full focus:outline-none w-full"
              />
              <button className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-r-full transition">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; 2024 RentMe. All rights reserved.</p>
        </div>
      </footer>

      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes parallax {
          0% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1.1) translateY(-20px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseSlow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes bounceX {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(5px);
          }
        }

        .animate-parallax {
          animation: parallax 20s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slideUp 1s ease-out forwards;
        }

        .animate-slide-up-delay-1 {
          animation: slideUp 1s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay-2 {
          animation: slideUp 1s ease-out 0.6s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay-3 {
          animation: slideUp 1s ease-out 0.9s forwards;
          opacity: 0;
        }

        .animate-slide-up-form {
          animation: slideUp 1s ease-out 1.2s forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fadeIn 1.5s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fadeIn 1.5s ease-out 0.5s forwards;
          opacity: 0;
        }

        .animate-fade-up {
          animation: fadeUp 0.8s ease-out forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-pulse-slow {
          animation: pulseSlow 2s ease-in-out infinite;
        }

        .animate-bounce-x {
          animation: bounceX 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProRideRentals;