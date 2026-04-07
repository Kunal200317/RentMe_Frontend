"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Calendar, MapPin, User, Car } from "lucide-react";

export default function BookingSuccessPage({ params }) {
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    
    const router = useRouter();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                fontSize: `${Math.random() * 20 + 10}px`
                            }}
                        >
                            {['🎉', '🎊', '✅', '🚗', '⭐'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            <div className="max-w-2xl w-full mt-12">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10"></div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                            </div>
                            
                            <h1 className="text-4xl font-bold text-white mb-3 animate-pulse">
                                Booking Confirmed!
                            </h1>
                            <p className="text-green-100 text-lg">
                                Your vehicle has been successfully booked
                            </p>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="p-8">
                        {/* Booking ID */}
                        {/* <div className="text-center mb-8">
                            <p className="text-gray-600 mb-2">Booking Reference</p>
                            <p className="text-2xl font-mono font-bold text-gray-800 bg-gray-100 py-2 px-4 rounded-lg inline-block">
                                #{id}
                            </p>
                        </div> */}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Car className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Vehicle</p>
                                    <p className="font-semibold text-gray-800">Honda City i-VTEC</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Owner</p>
                                    <p className="font-semibold text-gray-800">Rajesh Kumar</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Pickup Date</p>
                                    <p className="font-semibold text-gray-800">25 Dec 2024</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Amount Paid</p>
                                    <p className="font-semibold text-gray-800">₹2,500</p>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                What happens next?
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm">1</span>
                                    </div>
                                    <span className="text-gray-700">Owner will contact you within 1 hour</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm">2</span>
                                    </div>
                                    <span className="text-gray-700">Complete remaining payment at pickup</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm">3</span>
                                    </div>
                                    <span className="text-gray-700">Show your ID proof during pickup</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => router.push('/your-bookings')}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                            >
                                <span>View My Bookings</span>
                            </button>
                            
                            <button
                                onClick={() => router.push('/vehicles')}
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 border-2 border-gray-300"
                            >
                                Back to Home
                            </button>
                        </div>

                        {/* Support Info */}
                        <div className="text-center mt-6 pt-6 border-t border-gray-200">
                            <p className="text-gray-500 text-sm">
                                Need help? Contact us at{" "}
                                <span className="text-blue-500 font-semibold">support@carrental.com</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Floating celebration elements */}
                <div className="flex justify-center space-x-4 mt-6">
                    {['🎉', '🚗', '⭐', '🎊', '✅'].map((emoji, index) => (
                        <div
                            key={index}
                            className="text-2xl animate-float"
                            style={{ animationDelay: `${index * 0.2}s` }}
                        >
                            {emoji}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}