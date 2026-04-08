"use client";
import { useState, useRef, useEffect } from "react";
import API from "@/utils/api";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const emailFromURL = searchParams.get('email');
    const [email, setEmail] = useState(emailFromURL || "");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [isEmailRegistered, setIsEmailRegistered] = useState(false);
    const router = useRouter();
    const inputRefs = useRef([]);

    // Check if email is already registered
    useEffect(() => {
        const checkEmailRegistration = async () => {
            if (email && email.includes('@')) {
                try {
                    const res = await API.post("/auth/check-email", { email });
                    if (res.data.registered) {
                        setIsEmailRegistered(true);
                        setName(res.data.user.name || "");
                        setRole(res.data.user.role || "");
                    } else {
                        setIsEmailRegistered(false);
                        setName("");
                        setRole("");
                    }
                } catch (err) {
                    console.log("Email check failed");
                    setIsEmailRegistered(false);
                }
            }
        };

        if (emailFromURL) {
            checkEmailRegistration();
        }
    }, [emailFromURL, email]);

    // Auto-focus logic for OTP boxes
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        
        // Reset fields if email is changed and was previously registered
        if (isEmailRegistered && newEmail !== emailFromURL) {
            setIsEmailRegistered(false);
            setName("");
            setRole("");
        }
    };

  const handleLoginSuccess = async (userData, token) => {
  // 1. Data save karo
  localStorage.setItem("token", token);
  localStorage.setItem("userData", JSON.stringify(userData));
  
  // 2. First login flag set karo (1 minute ke liye)
  localStorage.setItem("firstLogin", "true");

};

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const otpString = otp.join("");
            const res = await API.post("/auth/verify-otp", { 
                email, 
                otp: otpString, 
                name, 
                role 
            });
            const redirect = searchParams.get('redirect');
            handleLoginSuccess(res.data.user, res.data.token);
            setMsg("✅ Verified successfully!");
            setLoading(false);
            // Redirect to original destination or default
            const targetUrl = redirect || "/vehicles?fresh=true";
            setTimeout(() => router.push(targetUrl), 2000);
        } catch (err) {
            setMsg(err.response?.data?.message || "Invalid OTP");
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50 transform transition-all duration-300">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            Verify OTP
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm">Complete your registration</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    {/* Email Field - Conditionally Locked */}
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            readOnly={isEmailRegistered}
                            required
                            placeholder="Enter your email"
                            className={`w-full text-white px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 backdrop-blur-sm placeholder-gray-400 ${
                                isEmailRegistered 
                                    ? "border-green-500/50 bg-green-900/20 cursor-not-allowed" 
                                    : "border-gray-600 bg-gray-700/80 focus:border-green-500 focus:ring-green-500/20"
                            }`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {isEmailRegistered ? (
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            )}
                        </div>
                        {isEmailRegistered && (
                            <p className="text-green-400 text-xs mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Registered email - details auto-filled
                            </p>
                        )}
                    </div>

                    {/* Name Field */}
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your full name"
                            className="w-full text-white px-4 py-4 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 bg-gray-700/80 backdrop-blur-sm placeholder-gray-400"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="relative">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={isEmailRegistered}
                            required
                            className="w-full text-white px-4 py-4 border-2 border-gray-600 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 bg-gray-700/80 backdrop-blur-sm appearance-none"
                        >
                            <option value="" className="text-gray-400">Select your role</option>
                            <option value="user" className="text-gray-800">User - Rent Vehicles</option>
                            <option value="owner" className="text-gray-800">Owner - List Vehicles</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* OTP Boxes */}
                    <div className="space-y-4">
                        <label className="text-gray-300 text-sm font-medium">Enter OTP</label>
                        <div className="flex justify-between space-x-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-12 text-center text-xl font-bold text-white bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all duration-200 backdrop-blur-sm"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Verify Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-500 hover:to-emerald-500 transform transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none flex items-center justify-center space-x-2 shadow-lg"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Verify & Continue</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Message Display */}
                {msg && (
                    <div className={`mt-6 p-4 rounded-xl text-center text-sm font-medium transition-all duration-300 ${
                        msg.includes("✅") 
                            ? "bg-green-900/50 text-green-300 border border-green-700/50" 
                            : "bg-red-900/50 text-red-300 border border-red-700/50"
                    }`}>
                        {msg}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        Don&apos;t receive OTP?{" "}
                        <button className="text-green-400 hover:text-green-300 hover:underline transition-colors">
                            Resend OTP
                        </button>
                    </p>
                </div>
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
        </div>
    );
}