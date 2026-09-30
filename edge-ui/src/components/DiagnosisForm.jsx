import React, { useState, useRef } from 'react';

export default function DiagnosisForm() {
    const [imageBlob, setImageBlob] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [diagnosis, setDiagnosis] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handlePhotoUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageBlob(e.target.files[0]);
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.onstop = () => {
                const audio = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audio);
                audioChunksRef.current = []; // reset
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
        }
    };

    const submitDiagnosis = async () => {
        if (!imageBlob || !audioBlob) {
            alert("Please provide both an image and an audio query.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("image", imageBlob, "crop.jpg");
        formData.append("audio", audioBlob, "query.webm");
        formData.append("coordinates", "-15.793889, -47.882778"); // Example: Cerrado, Brazil
        
        try {
            const response = await fetch("http://localhost:7880/api/v1/doctor/diagnose", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setDiagnosis(data);
        } catch (error) {
            console.error("Diagnosis failed:", error);
            alert("Failed to reach diagnosis engine.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded shadow max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Multimodal Crop Doctor</h2>
            
            <div className="mb-4">
                <label className="block mb-2 font-semibold">1. Snap Photo of Crop</label>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="w-full" />
                {imageBlob && <p className="text-sm text-green-600 mt-1">Photo captured!</p>}
            </div>
            
            <div className="mb-4">
                <label className="block mb-2 font-semibold">2. Ask Question (Voice)</label>
                <button 
                    onClick={toggleRecording} 
                    className={`px-4 py-2 text-white rounded ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}
                >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
                {audioBlob && !isRecording && <p className="text-sm text-green-600 mt-1">Audio recorded!</p>}
            </div>
            
            <button 
                onClick={submitDiagnosis} 
                disabled={loading}
                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded mt-2 disabled:opacity-50"
            >
                {loading ? "Diagnosing..." : "Get Prescription"}
            </button>

            {diagnosis && (
                <div className="mt-6 p-4 bg-gray-100 rounded">
                    <h3 className="font-bold text-lg">{diagnosis.disease_identification}</h3>
                    <p>Confidence: {(diagnosis.confidence_score * 100).toFixed(1)}%</p>
                    
                    <h4 className="font-bold mt-2">Organic Remedies:</h4>
                    <ul className="list-disc pl-5">
                        {diagnosis.organic_remedies?.map((rem, i) => (
                            <li key={i}><strong>{rem.name}:</strong> {rem.description}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
