"use client";
import { useState, useEffect } from "react";
import API from "@/utils/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showElements, setShowElements] = useState({
    logo: false,
    welcome: false,
    email: false,
    button: false,
    footer: false
  });

  const router = useRouter();

  useEffect(() => {
    // Staggered animation sequence
    setTimeout(() => setShowElements(prev => ({ ...prev, logo: true })), 100);
    setTimeout(() => setShowElements(prev => ({ ...prev, welcome: true })), 300);
    setTimeout(() => setShowElements(prev => ({ ...prev, email: true })), 500);
    setTimeout(() => setShowElements(prev => ({ ...prev, button: true })), 700);
    setTimeout(() => setShowElements(prev => ({ ...prev, footer: true })), 900);
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await API.post("/auth/send-otp", { email });
      setMsg(res.data.message || "OTP sent! Check your email.");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="videobg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50">
        {/* Logo/Header Section */}
        <div className={`
          text-center mb-8 transform transition-all duration-700 ease-out
          ${showElements.logo ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}>
          <div className="flex justify-center items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              RentMe
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Premium Car & Bike Rentals</p>
        </div>

        {/* Welcome Text */}
        <div className={`
          transform transition-all duration-700 ease-out
          ${showElements.welcome ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}>
          <h2 className="text-2xl font-semibold text-center mb-6 text-white">
            Welcome Back!
          </h2>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-6">
          {/* Email Input */}
          <div className={`
            relative transform transition-all duration-700 ease-out
            ${showElements.email ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          `}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full text-white px-4 py-4 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 bg-gray-700/80 backdrop-blur-sm placeholder-gray-400"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Submit Button */}
          <div className={`
            transform transition-all duration-700 ease-out
            ${showElements.button ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          `}>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-4 rounded-xl font-semibold hover:from-orange-500 hover:to-amber-500 transform transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none flex items-center justify-center space-x-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send Magic Link OTP</span>
                </>
              )}
            </button>
          </div>
        </form>

        {msg && (
          <div className={`mt-6 p-4 rounded-xl text-center text-sm font-medium transition-all duration-300 ${msg.includes("Error")
              ? "bg-red-900/50 text-red-300 border border-red-700/50"
              : "bg-green-900/50 text-green-300 border border-green-700/50"
            }`}>
            {msg}
          </div>
        )}

        {/* Footer */}
        <div className={`
          mt-8 text-center transform transition-all duration-700 ease-out
          ${showElements.footer ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}>
          <p className="text-xs text-gray-400">
            By continuing, you agree to our{" "}
            <a href="#" className="text-orange-400 hover:text-orange-300 hover:underline transition-colors">Terms</a> and{" "}
            <a href="#" className="text-orange-400 hover:text-orange-300 hover:underline transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}