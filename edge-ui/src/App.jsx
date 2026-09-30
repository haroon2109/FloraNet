import React from 'react';
import DiagnosisForm from './components/DiagnosisForm';
import AdvisoryDashboard from './components/AdvisoryDashboard';
import PolicyDashboard from './components/PolicyDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-green-700">FloraNet Edge AI</h1>
          <p className="text-gray-600 mt-2">Multimodal Crop Doctor & Prescription Engine</p>
        </header>
        <main className="space-y-8">
          <DiagnosisForm />
          <AdvisoryDashboard />
          <PolicyDashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
