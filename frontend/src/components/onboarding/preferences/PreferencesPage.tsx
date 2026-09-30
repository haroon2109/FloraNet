import React from 'react';
import PreferencesForm from './PreferencesForm';
import PreferencesIllustration from './PreferencesIllustration';
import OnboardingProgress from '../OnboardingProgress';
import PrivacyNotice from '../PrivacyNotice';
import SupportCard from '../SupportCard';
import Logo from '@/components/ui/Logo';

export default function PreferencesPage() {
  return (
    <div
      className="min-h-screen bg-[#F6F9F6] flex items-start justify-center p-0 md:p-6 lg:p-8"
      style={{ fontFamily: 'Inter, Geist Sans, sans-serif' }}
    >
      <div className="w-full max-w-[1380px] min-h-screen md:min-h-[90vh] bg-white md:rounded-[20px] md:border border-[#E1EAE2] shadow-[0_8px_30px_rgba(20,50,35,0.04)] overflow-hidden flex flex-col">

        {/* Main split — form + illustration */}
        <div className="flex flex-col lg:flex-row flex-1">

          {/* ── LEFT PANEL ── */}
          <div className="w-full lg:w-[50%] bg-white flex flex-col px-6 lg:px-[56px] pt-12 pb-6 overflow-y-auto">

            {/* Brand Header */}
            <div className="mb-10">
              <Logo className="w-8 h-8" withText={true} textColor="text-[#102A20]" />
              <p className="text-[14px] text-[#5B6A63] font-medium mt-2">
                Intelligence for Every Farm. Impact for Our Planet.
              </p>
            </div>

            {/* Progress Step 3 */}
            <OnboardingProgress currentStep={3} />

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-[32px] font-bold text-[#102A20] tracking-tight leading-tight mb-3">
                Customize your experience
              </h1>
              <p className="text-[15px] text-[#5B6A63] leading-relaxed max-w-[420px]">
                Tell us your preferences so we can tailor insights,<br />
                alerts and recommendations to you.
              </p>
            </div>

            {/* Form */}
            <PreferencesForm />

            {/* Support Card */}
            <div className="mt-8 mb-4">
              <SupportCard />
            </div>

          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="w-full lg:w-[50%] h-[500px] lg:h-auto">
            <PreferencesIllustration />
          </div>

        </div>

        {/* ── Privacy Strip Footer ── */}
        <div className="w-full px-6 lg:px-[56px] pb-8 bg-white">
          <PrivacyNotice />
        </div>

      </div>
    </div>
  );
}
