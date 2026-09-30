import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function PolicyDashboard() {
    const [outbreaks, setOutbreaks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:7880/api/v1/exchange/outbreaks')
            .then(res => res.json())
            .then(data => {
                setOutbreaks(data.outbreaks);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const exportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({"@context": "https://schema.org/", "@type": "Dataset", outbreaks}));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", "agrin_exchange.jsonld");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="p-4 border rounded shadow mx-auto mt-6 bg-white w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">AgriN Policy Dashboard</h2>
                    <p className="text-sm text-gray-500">Cross-Border Disease Monitoring (BRICS)</p>
                </div>
                <button 
                    onClick={exportData}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Export JSON-LD
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2 h-96 rounded overflow-hidden border">
                    <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {outbreaks.map((ob, idx) => (
                            <Marker key={idx} position={[ob.location.latitude, ob.location.longitude]}>
                                <Popup>
                                    <strong>{ob.name}</strong><br/>
                                    Severity: {ob.severity}<br/>
                                    Reported: {new Date(ob.dateReported).toLocaleDateString()}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
                
                <div className="border rounded p-4 h-96 overflow-y-auto bg-gray-50">
                    <h3 className="font-bold text-gray-700 mb-3 sticky top-0 bg-gray-50 pb-2 border-b">Recent Alerts</h3>
                    {loading ? (
                        <p className="text-gray-500 text-sm">Loading data exchange...</p>
                    ) : (
                        <ul className="space-y-3">
                            {outbreaks.map((ob, idx) => (
                                <li key={idx} className="bg-white p-2 rounded shadow-sm border-l-4 border-red-500">
                                    <p className="font-bold text-sm">{ob.name}</p>
                                    <p className="text-xs text-gray-600">Severity: <span className="font-semibold text-red-600">{ob.severity}</span></p>
                                    <p className="text-xs text-gray-500 truncate">{ob.reportedBy}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
