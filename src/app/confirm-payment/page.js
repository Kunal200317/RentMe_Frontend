"use client";
import { useEffect, useState, useCallback } from "react"; // ✅ useCallback add karein
import { useRouter } from "next/navigation";
import Script from "next/script";
import API from "@/utils/api";
import Image from 'next/image'; // ✅ Image component import karein

export default function ConfirmBooking() {
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showContent, setShowContent] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [countdown, setCountdown] = useState(180); // 3 minutes in seconds
    const [countdownActive, setCountdownActive] = useState(true);

    // ✅ PAYMENT TIMEOUT FUNCTION with useCallback
    const handlePaymentTimeout = useCallback(async () => {
        try {
            const BookingID = localStorage.getItem("bookingId");
            if (BookingID) {
                await API.delete(`/bookings/rejected/${BookingID}`);
            }
            
            // Cleanup localStorage
            localStorage.removeItem("pendingBooking");
            localStorage.removeItem("bookingId");
            localStorage.removeItem("paymentCountdown");
            localStorage.removeItem("countdownStartTime");
            
            router.push("/vehicles");
        } catch (error) {
            console.error("Payment timeout error:", error);
        }
    }, [router]); 

    // ✅ REFRESH PROBLEM FIX: Countdown persist karo localStorage mein
    useEffect(() => {
        const savedCountdown = localStorage.getItem("paymentCountdown");
        const countdownStartTime = localStorage.getItem("countdownStartTime");
        
        if (savedCountdown && countdownStartTime) {
            const elapsed = Math.floor((Date.now() - parseInt(countdownStartTime)) / 1000);
            const remaining = Math.max(0, 180 - elapsed);
            
            if (remaining > 0) {
                setCountdown(remaining);
            } else {
                handlePaymentTimeout();
            }
        } else {
            // Naya countdown start karo
            localStorage.setItem("countdownStartTime", Date.now().toString());
            localStorage.setItem("paymentCountdown", "180");
        }
    }, [handlePaymentTimeout]); // ✅ handlePaymentTimeout dependency add karein

    useEffect(() => {
        const data = localStorage.getItem("pendingBooking");
        if (data) setBooking(JSON.parse(data));
    }, []);

    // ✅ COUNTDOWN TIMER (Fixed) - with proper dependencies
    useEffect(() => {
        if (!countdownActive || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                const newCountdown = prev - 1;
                localStorage.setItem("paymentCountdown", newCountdown.toString());
                
                if (newCountdown <= 0) {
                    clearInterval(timer);
                    handlePaymentTimeout();
                    return 0;
                }
                return newCountdown;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdownActive, countdown, handlePaymentTimeout]); // ✅ countdown and handlePaymentTimeout dependencies add karein

    const handleAdvancePayment = async () => {
        try {
            setIsPaying(true);
            setCountdownActive(false);
            
            const advanceAmount = (booking.totalPrice * 20) / 100;

            if (!booking) {
                alert("No booking data found");
                return;
            }

            const createResponse = await API.post("/payments/create", {
                bookingData: booking,
                amount: advanceAmount,
            });

            if (createResponse.data?.success === false) {
                alert(createResponse.data.message);
                return;
            }

            const { order, keyId } = createResponse.data;

            if (!order) {
                alert("Payment initialization failed");
                return;
            }

            const BookingID = localStorage.getItem("bookingId");
            
            const options = {
                key: keyId,
                amount: order.amount,
                currency: order.currency,
                name: "RentMe",
                description: `Advance for ${booking.brand} ${booking.model}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await API.post("/payments/verifyPayment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingData: booking,
                            amount: advanceAmount,
                            bookingId: BookingID,
                        });

                        if (verifyRes.data?.success) {
                            // ✅ Success pe cleanup
                            localStorage.removeItem("pendingBooking");
                            localStorage.removeItem("bookingId");
                            localStorage.removeItem("paymentCountdown");
                            localStorage.removeItem("countdownStartTime");
                            
                            router.push(`/booking-success/${verifyRes.data.booking._id}`);
                        } else {
                            alert("Payment verification failed");
                            setCountdownActive(true);
                        }
                    } catch (err) {
                        alert("Payment verification failed");
                        setCountdownActive(true);
                    }
                },
                prefill: {
                    name: booking.userName || "",
                    email: booking.userEmail || "",
                    contact: booking.userPhone || "",
                },
                theme: { color: "#2563eb" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            if (err.response?.status === 400) {
                alert(err.response.data.message);
            } else if (err.response?.data?.message) {
                alert(err.response.data.message);
            } else {
                alert("Payment failed. Please try again.");
            }
            setCountdownActive(true);
        } finally {
            setIsPaying(false);
        }
    };

    useEffect(() => {
        async function fetchVehicle() {
            if (!booking?.vehicleId) return;

            try {
                setLoading(true);
                const res = await API.get(`/vehicles/${booking?.vehicleId}`);
                setVehicle(res.data.vehicle);
                setTimeout(() => setShowContent(true), 300);
            } catch (err) {
                setError("Failed to load vehicle details");
            } finally {
                setLoading(false);
            }
        }

        fetchVehicle();
    }, [booking?.vehicleId]);

    // ✅ Countdown format
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (loading || !vehicle) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading vehicle details...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                {/* ✅ FIXED COUNTDOWN BANNER - Small & Always Visible */}
                <div className={`fixed top-20 right-6 z-50 transition-all duration-500 ${countdownActive ? 'opacity-100' : 'opacity-0'}`}>
                    <div className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center ${
                        countdown > 60 ? 'bg-orange-500' : 'bg-red-500 animate-pulse'
                    }`}>
                        {/* Countdown Text */}
                        <span className="text-white font-bold text-xs text-center leading-tight">
                            {formatTime(countdown)}
                        </span>
                        
                        {/* Circular Progress */}
                        <svg className="absolute inset-0 w-16 h-16 transform -rotate-90">
                            <circle
                                cx="32"
                                cy="32"
                                r="30"
                                stroke="white"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray="188.4"
                                strokeDashoffset={188.4 - (188.4 * countdown) / 180}
                            />
                        </svg>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                        Complete payment in {formatTime(countdown)}
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className={`text-center mb-8 transition-all duration-700 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <h1 className="text-4xl font-bold text-gray-800 ">
                            Confirm Your Booking 🚗
                        </h1>
                        <p className="text-gray-600 text-lg">Complete your booking with 20% advance payment</p>

                         {/* ✅ Countdown Message */}
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 inline-block">
                            <p className="text-yellow-700 text-sm">
                                <span className="font-bold">⚠️ Important:</span> Complete payment within 3 minutes to confirm your booking
                            </p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Side - Payment Form */}
                        <div className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-700 transform ${showContent ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">💳</span>
                                Payment Details
                            </h2>

                            {/* Booking Summary */}
                            <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Booking Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Pickup Date:</span>
                                        <span className="font-semibold text-gray-800">{booking?.startDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Dropoff Date:</span>
                                        <span className="font-semibold text-gray-800">{booking?.endDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Days:</span>
                                        <span className="font-semibold text-gray-800">{booking?.totalDays} days</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-300 pt-3">
                                        <span className="text-gray-600">Total Price:</span>
                                        <span className="font-semibold text-lg text-gray-800">₹{booking?.totalPrice}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Amount */}
                            <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600 mb-2">
                                        ₹{(booking?.totalPrice * 20 / 100).toFixed(2)}
                                    </div>
                                    <p className="text-green-700">20% Advance Payment</p>
                                    <p className="text-sm text-green-600 mt-1">Balance payable at pickup</p>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <button
                                onClick={handleAdvancePayment}
                                disabled={isPaying || countdown <= 0}
                                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                                    isPaying || countdown <= 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105'
                                } text-white shadow-lg`}
                            >
                                {isPaying ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </div>
                                ) : countdown <= 0 ? (
                                    'Time Expired'
                                ) : (
                                    'Pay 20% Advance & Confirm'
                                )}
                            </button>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
                                    {error}
                                </div>
                            )}

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                    <span>🔒</span>
                                    Secure payment powered by Razorpay
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Vehicle Details */}
                        <div className={`relative transition-all duration-700 transform ${showContent ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                            <div className="bg-white rounded-2xl shadow-xl p-8 h-full sticky top-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">🚗</span>
                                    Vehicle Details
                                </h2>

                                <div className="relative overflow-hidden rounded-xl mb-6 group">
                                    {/* ✅ FIXED: <img> to <Image> */}
                                    <Image
                                        src={vehicle.images?.[0] || "/car-placeholder.jpg"}
                                        alt={vehicle.brand || "Vehicle Image"}
                                        width={800}
                                        height={320}
                                        className="w-full h-64 object-cover rounded-xl group-hover:scale-110 transition-transform duration-700"
                                        priority={false}
                                        unoptimized={true}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-800">{vehicle.brand} {vehicle.model}</h3>
                                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium capitalize">
                                            {vehicle.type}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <span className="text-2xl">⛽</span>
                                            <div>
                                                <p className="text-sm text-gray-600">Fuel Type</p>
                                                <p className="font-semibold">{vehicle.fuelType || 'Petrol'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <span className="text-2xl">👥</span>
                                            <div>
                                                <p className="text-sm text-gray-600">Seats</p>
                                                <p className="font-semibold">{vehicle.seats || 5} People</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <span className="text-2xl">⚙️</span>
                                            <div>
                                                <p className="text-sm text-gray-600">Transmission</p>
                                                <p className="font-semibold">{vehicle.transmission || 'Manual'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <span className="text-2xl">💰</span>
                                            <div>
                                                <p className="text-sm text-gray-600">Daily Rate</p>
                                                <p className="font-semibold">₹{vehicle.rentPerDay}/day</p>
                                            </div>
                                        </div>
                                    </div>

                                    {vehicle.features && vehicle.features.length > 0 && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <h4 className="font-semibold text-gray-800 mb-3">Features</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {vehicle.features.slice(0, 4).map((feature, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </>
    );
}