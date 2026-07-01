"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Leaf, MapPin, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
    ssr: false,
    loading: () => <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>
});

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        farming_method: "integrated",
        primary_language: "en",
        location: {
            label: "",
            district: "",
            latitude: 0,
            longitude: 0,
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith("location.")) {
            const locField = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [locField]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                latitude: lat,
                longitude: lng
            }
        }));
    };

    const nextStep = () => {
        if (step === 1 && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError("");
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step !== 3) {
            nextStep();
            return;
        }

        if (!formData.location.latitude || !formData.location.longitude) {
            setError("Please drop a pin on the map to set your location");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/register", {
                email: formData.email,
                phone: formData.phone || undefined,
                password: formData.password,
                full_name: formData.full_name,
                farming_method: formData.farming_method,
                primary_language: formData.primary_language,
                location: formData.location
            });
            localStorage.setItem("access_token", res.data.access_token);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Registration failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
                <Leaf className="w-12 h-12 text-green-600 mb-4" />
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>
                <div className="mt-4 flex space-x-2 text-sm">
                    <span className={`px-2 py-1 rounded-full ${step >= 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>1. Account</span>
                    <span className={`px-2 py-1 rounded-full ${step >= 2 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>2. Profile</span>
                    <span className={`px-2 py-1 rounded-full ${step >= 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>3. Farm</span>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input required type="password" name="password" minLength={8} value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <input required type="password" name="confirmPassword" minLength={8} value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Farming Method</label>
                                    <select name="farming_method" value={formData.farming_method} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
                                        <option value="integrated">Integrated</option>
                                        <option value="organic">Organic</option>
                                        <option value="conventional">Conventional</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Primary Language</label>
                                    <select name="primary_language" value={formData.primary_language} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
                                        <option value="en">English</option>
                                        <option value="si">Sinhala</option>
                                        <option value="ta">Tamil</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Farm/Location Label</label>
                                    <input required type="text" name="location.label" placeholder="e.g. Home Garden, North Field" value={formData.location.label} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">District</label>
                                    <input required type="text" name="location.district" placeholder="e.g. Anuradhapura" value={formData.location.district} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pinpoint Farm on Map</label>
                                    <MapPicker onLocationSelect={handleLocationSelect} />
                                    {formData.location.latitude !== 0 && (
                                        <p className="mt-2 text-xs text-green-600 flex items-center">
                                            <CheckCircle2 className="w-4 h-4 mr-1" /> Location selected
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            {step > 1 ? (
                                <button type="button" onClick={prevStep} className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                                </button>
                            ) : <div></div>}
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
                            >
                                {step < 3 ? (
                                    <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
                                ) : (
                                    loading ? "Registering..." : "Complete Registration"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
