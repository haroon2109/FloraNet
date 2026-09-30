"use client";

import React, { useState, useRef } from "react";
import { Mic, Square, Play } from "lucide-react";

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 border rounded-xl shadow-sm bg-white mt-4 text-center">
      <h3 className="text-lg font-semibold mb-2">Voice Symptoms</h3>
      <p className="text-sm text-gray-500 mb-4">Describe the issues you see in your regional language.</p>

      {!isRecording && !audioURL && (
        <button 
          onClick={startRecording}
          className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto hover:bg-blue-200 transition-colors"
        >
          <Mic size={32} />
        </button>
      )}

      {isRecording && (
        <div className="flex flex-col items-center w-full">
          {/* Animated Waveform */}
          <div className="flex items-center gap-1 h-12 mb-4">
            {[1, 2, 3, 4, 5, 6].map((i: any) => (
              <div 
                key={i}
                className="w-2 bg-red-500 rounded-full animate-wave"
                style={{
                  height: `${Math.max(20, Math.random() * 100)}%`,
                  animation: `wave ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
          <button 
            onClick={stopRecording}
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
          >
            <Square size={18} fill="currentColor" /> Stop Listening
          </button>
        </div>
      )}

      {audioURL && !isRecording && (
        <div className="flex flex-col items-center gap-3">
          <audio src={audioURL} controls className="w-full h-10" />
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => setAudioURL(null)}
              className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Discard
            </button>
            <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Send Audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
