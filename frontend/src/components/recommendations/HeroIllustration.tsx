import React from 'react';

export default function HeroIllustration() {
  return (
    <div className="absolute top-0 left-0 right-0 h-[280px] z-0 overflow-hidden pointer-events-none bg-gradient-to-b from-[#e1eff5] via-[#ecf7eb] to-[#e4f3ea]">
      <div className="w-full h-full relative">
        {/* Clouds */}
        <div className="absolute bg-white rounded-full opacity-80 top-10 left-[10%] w-[120px] h-[35px] animate-[drift_160s_linear_infinite]"></div>
        <div className="absolute bg-white rounded-full opacity-70 top-20 left-[45%] w-[180px] h-[45px] animate-[drift_240s_linear_infinite_-40s]"></div>
        <div className="absolute bg-white rounded-full opacity-90 top-8 left-[80%] w-[90px] h-[25px] animate-[drift_120s_linear_infinite_-80s]"></div>
        
        {/* Birds */}
        <div className="absolute top-24 left-[40%] text-[#64748B] opacity-60 animate-[drift_180s_linear_infinite_-10s]">
          <svg width="20" height="6" viewBox="0 0 24 8" fill="none"><path d="M1 7C1 7 4 2 6 2C8 2 11 7 11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 7C13 7 16 2 18 2C20 2 23 7 23 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div className="absolute top-28 left-[42%] text-[#64748B] opacity-50 animate-[drift_180s_linear_infinite_-12s] scale-75">
          <svg width="20" height="6" viewBox="0 0 24 8" fill="none"><path d="M1 7C1 7 4 2 6 2C8 2 11 7 11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 7C13 7 16 2 18 2C20 2 23 7 23 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>

        {/* Mountains */}
        <div className="absolute bottom-[50px] left-[-5%] w-0 h-0 border-l-[180px] border-l-transparent border-r-[180px] border-r-transparent border-b-[140px] border-[#81C39E] opacity-70"></div>
        <div className="absolute bottom-[50px] left-[25%] w-0 h-0 border-l-[200px] border-l-transparent border-r-[200px] border-r-transparent border-b-[120px] border-[#92CEAA] opacity-80"></div>
        <div className="absolute bottom-[50px] right-[-10%] w-0 h-0 border-l-[220px] border-l-transparent border-r-[220px] border-r-transparent border-b-[150px] border-[#A8D8BA] opacity-75"></div>
        
        {/* Windmill */}
        <div className="absolute bottom-[60px] left-[65%] w-[6px] h-[50px] bg-[#71717A] opacity-90 z-10">
          <div className="w-16 h-16 absolute -top-8 -left-8 animate-[spin_10s_linear_infinite]">
            <div className="absolute w-[4px] h-16 bg-[#52525B] left-[30px]"></div>
            <div className="absolute w-16 h-[4px] bg-[#52525B] top-[30px]"></div>
          </div>
          <div className="w-[12px] h-[8px] bg-[#3F3F46] absolute top-[15px] -left-[3px] rounded-sm"></div>
        </div>

        {/* Tractor (Static or very subtle movement) */}
        <div className="absolute bottom-[80px] left-[45%] w-7 h-5 bg-[#168A45] rounded-sm opacity-90 z-20 animate-[pulse_6s_ease-in-out_infinite]">
           <div className="absolute -top-2.5 left-1 w-3.5 h-2.5 bg-[#102A20] rounded-t-sm"></div>
           <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#333] rounded-full"></div>
           <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-[#333] rounded-full"></div>
        </div>

        {/* Fields */}
        <div className="absolute bottom-0 w-full h-[80px] bg-[#a9d98e] overflow-hidden">
          <div 
            className="absolute w-[200%] h-[150%] bottom-[-20px] left-[-50%] transform origin-bottom perspective-[400px] rotate-x-65"
            style={{
              background: 'repeating-linear-gradient(85deg, #93cc76, #93cc76 15px, #82c262 15px, #82c262 30px)'
            }}
          ></div>
          <div 
            className="absolute w-[100%] h-[150%] bottom-[-20px] right-[-10%] transform origin-bottom perspective-[400px] rotate-x-65"
            style={{
              background: 'repeating-linear-gradient(-75deg, #98d17a, #98d17a 20px, #88c767 20px, #88c767 40px)',
              opacity: 0.8
            }}
          ></div>
        </div>
        
        {/* Farmhouse & Trees */}
        <div className="absolute bottom-[75px] left-[72%] w-[28px] h-[18px] bg-[#D97706] opacity-90 z-10">
           <div className="absolute -top-[10px] -left-[4px] w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[10px] border-[#92400E]"></div>
           <div className="absolute top-[6px] left-[4px] w-[6px] h-[8px] bg-[#FFFBEB]"></div>
           <div className="absolute top-[6px] right-[4px] w-[6px] h-[8px] bg-[#FFFBEB]"></div>
        </div>
        <div className="absolute bottom-[75px] left-[70%] w-[12px] h-[20px] bg-[#168A45] rounded-t-full opacity-90 z-10"></div>
        <div className="absolute bottom-[75px] left-[76%] w-[10px] h-[16px] bg-[#168A45] rounded-t-full opacity-90 z-10"></div>
      </div>
      
      {/* Fade overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-transparent to-[#F7F9F7] z-10"></div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drift {
          from { transform: translateX(0); }
          to { transform: translateX(120vw); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[drift_160s_linear_infinite\\] { animation: none; }
          .animate-\\[drift_240s_linear_infinite_-40s\\] { animation: none; }
          .animate-\\[drift_120s_linear_infinite_-80s\\] { animation: none; }
          .animate-\\[drift_180s_linear_infinite_-10s\\] { animation: none; }
          .animate-\\[drift_180s_linear_infinite_-12s\\] { animation: none; }
          .animate-\\[spin_10s_linear_infinite\\] { animation: none; }
          .animate-\\[pulse_6s_ease-in-out_infinite\\] { animation: none; }
        }
      `}} />
    </div>
  );
}
