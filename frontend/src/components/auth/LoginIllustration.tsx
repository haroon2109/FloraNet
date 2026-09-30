import React from "react";
import Image from "next/image";
import FeatureHighlights from "./FeatureHighlights";

export default function LoginIllustration() {
  return (
    <div className="w-full h-full relative flex flex-col md:rounded-r-[22px] overflow-hidden bg-[#C8DCC8] min-h-[500px] md:min-h-full">

      {/* ── Background Illustration ── */}
      <Image
        src="/images/login_illustration.jpg"
        alt="Farmer with tablet in green agricultural fields"
        fill
        className="object-cover object-center"
        priority
        quality={95}
      />

      {/* ── Top-Right Foliage Overlay ── */}
      <div className="absolute top-0 right-0 w-[55%] pointer-events-none z-10">
        <Image
          src="/images/foliage_top.png"
          alt=""
          width={600}
          height={350}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* ── Quote ── */}
      <div className="relative z-20 pt-10 md:pt-14 pl-8 md:pl-12 pr-8">
        {/* Stylised double-quote mark — two filled dark-green pill blocks */}
        <div className="flex gap-[5px] mb-3">
          <div className="w-[13px] h-[18px] bg-[#0D3023] rounded-[3px]" />
          <div className="w-[13px] h-[18px] bg-[#0D3023] rounded-[3px]" />
        </div>
        <h2 className="text-[34px] md:text-[38px] font-semibold text-[#0D3023] leading-[1.18] tracking-tight">
          Technology grows<br />
          better when it grows<br />
          with nature.
        </h2>
      </div>

      {/* ── Bottom Info Card ── */}
      <div className="relative z-20 mt-auto pb-8 md:pb-10 px-5 md:px-8 w-full flex justify-center md:justify-end">
        <FeatureHighlights />
      </div>

    </div>
  );
}
