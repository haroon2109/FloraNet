import React, { useState } from 'react';

export default function AdvisoryDashboard() {
    const [location, setLocation] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAdvisory = async (lat, lon) => {
        setLoading(true);
        setError(null);
        try {
            const url = `http://localhost:7880/api/v1/satellite/advisory?lat=${lat}&lon=${lon}&soil_type=Clay%20Loam`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch advisory");
            const data = await response.json();
            setPlan(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLocate = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                setLocation({ lat, lon });
                getAdvisory(lat, lon);
            },
            () => {
                setError("Unable to retrieve your location");
                setLoading(false);
            }
        );
    };

    return (
        <div className="p-4 border rounded shadow max-w-md mx-auto mt-6 bg-white">
            <h2 className="text-xl font-bold mb-2 text-green-800">Satellite Regenerative Advisory</h2>
            <p className="text-sm text-gray-600 mb-4">
                Get a 3-Year crop rotation plan tailored to your farm's exact location based on real-time satellite telemetry.
            </p>
            
            <button 
                onClick={handleLocate} 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
                {loading && !plan ? "Acquiring Satellite Data..." : "Locate My Farm"}
            </button>

            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}

            {location && !loading && (
                <div className="mt-4 text-sm text-gray-700">
                    <strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                </div>
            )}

            {plan && (
                <div className="mt-6 border-t pt-4">
                    <h3 className="font-bold text-lg text-green-700">3-Year Regenerative Plan</h3>
                    <p className="mt-2 text-sm text-gray-800">{plan.plan_overview}</p>
                    
                    <div className="mt-4 bg-gray-50 p-3 rounded border">
                        <h4 className="font-semibold text-gray-700">Soil Health</h4>
                        <p className="text-sm mt-1">{plan.current_soil_health_assessment}</p>
                        <p className="text-sm mt-2 font-bold text-green-600">
                            Expected SOC Improvement: +{plan.estimated_soc_improvement_percent}%
                        </p>
                    </div>

                    <div className="mt-4 space-y-3">
                        {plan.phases?.map((phase, i) => (
                            <div key={i} className="p-3 border-l-4 border-green-500 bg-green-50 shadow-sm">
                                <span className="text-xs font-bold uppercase tracking-wider text-green-700">Phase {phase.phase_number} • {phase.season}</span>
                                <h4 className="font-bold mt-1 text-gray-900">{phase.recommended_crop}</h4>
                                <p className="text-sm text-gray-700 mt-1">{phase.justification}</p>
                                <span className="text-xs text-gray-500 block mt-2">Duration: {phase.estimated_duration_days} days</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
