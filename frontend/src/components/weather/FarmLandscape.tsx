import React from 'react';

export default function FarmLandscape() {
  return (
    <div className="relative w-full h-[320px] bg-gradient-to-b from-[#DCEFF5] via-[#C9E6ED] to-[#F7FAF8] flex flex-col z-0 overflow-hidden shrink-0 pt-8">
      
      {/* Background Illustration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mt-6">
        
        {/* Soft Clouds */}
        <div className="absolute bg-white rounded-full opacity-80 top-10 left-[15%] w-[180px] h-[55px] blur-[2px]"></div>
        <div className="absolute bg-white rounded-full opacity-70 top-6 left-[55%] w-[140px] h-[40px] blur-[2px]"></div>
        <div className="absolute bg-white rounded-full opacity-90 top-14 right-[25%] w-[160px] h-[50px] blur-[1px]"></div>
        
        {/* Birds */}
        <div className="absolute top-16 right-[40%] text-[#647474] opacity-50 transform scale-75">
          <svg width="24" height="10" viewBox="0 0 24 8" fill="none"><path d="M1 7C1 7 4 2 6 2C8 2 11 7 11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 7C13 7 16 2 18 2C20 2 23 7 23 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div className="absolute top-12 right-[35%] text-[#647474] opacity-40 transform scale-50">
          <svg width="24" height="10" viewBox="0 0 24 8" fill="none"><path d="M1 7C1 7 4 2 6 2C8 2 11 7 11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 7C13 7 16 2 18 2C20 2 23 7 23 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>

        {/* Mountains */}
        <div className="absolute bottom-[100px] left-[-10%] w-0 h-0 border-l-[350px] border-l-transparent border-r-[350px] border-r-transparent border-b-[160px] border-[#8CB999] opacity-70"></div>
        <div className="absolute bottom-[100px] left-[25%] w-0 h-0 border-l-[450px] border-l-transparent border-r-[450px] border-r-transparent border-b-[190px] border-[#A3C5AE] opacity-80"></div>
        <div className="absolute bottom-[100px] right-[-5%] w-0 h-0 border-l-[300px] border-l-transparent border-r-[300px] border-r-transparent border-b-[140px] border-[#95C2A4] opacity-60"></div>
        
        {/* Farm Fields Background */}
        <div className="absolute bottom-0 w-full h-[130px] bg-[#8DC271] overflow-hidden">
           {/* Angled fields overlay */}
           <div className="absolute w-[150%] h-[200%] bottom-[-30px] left-[-20%] transform origin-bottom perspective-[600px] rotate-x-[76deg]"
              style={{ background: 'repeating-linear-gradient(85deg, #7EBB60, #7EBB60 18px, #74AD57 18px, #74AD57 36px)' }}>
           </div>
        </div>

        {/* Left House Cluster */}
        <div className="absolute bottom-[115px] left-[15%] w-[100px] h-[45px] z-20">
           <div className="absolute bottom-0 left-0 w-[40px] h-[30px] bg-[#F4F4F4] rounded-sm border border-[#E2E9E5]/60 shadow-sm">
             <div className="absolute -top-[14px] -left-[3px] w-[46px] h-[16px] bg-[#A18174] rounded-t-sm transform shadow-sm"></div>
           </div>
           <div className="absolute bottom-0 left-[35px] w-[50px] h-[40px] bg-[#FAFAF8] rounded-sm relative border border-[#E2E9E5]/50 shadow-md">
              <div className="absolute -top-[18px] -left-[3px] w-[56px] h-[20px] bg-[#937567] rounded-t-sm transform shadow-sm"></div>
              <div className="absolute top-[12px] left-[10px] w-3 h-4 bg-[#B5D3C6] opacity-90 border border-[#647474]/20"></div>
              <div className="absolute top-[12px] right-[10px] w-3 h-4 bg-[#B5D3C6] opacity-90 border border-[#647474]/20"></div>
              <div className="absolute -top-[25px] right-[8px] w-3 h-[15px] bg-[#A18174]"></div>
           </div>
        </div>

        {/* Trees Left */}
        <div className="absolute bottom-[110px] left-[8%] w-[45px] h-[75px] bg-[#075B3A] rounded-t-full opacity-95 z-10 shadow-md"></div>
        <div className="absolute bottom-[105px] left-[5%] w-[55px] h-[90px] bg-[#087A45] rounded-t-full opacity-90 z-10 shadow-md"></div>
        <div className="absolute bottom-[115px] left-[25%] w-[35px] h-[60px] bg-[#087A45] rounded-t-full opacity-95 z-10 shadow-md"></div>

        {/* Right House Cluster & Trees */}
        <div className="absolute bottom-[110px] right-[30%] w-[110px] h-[55px] z-20">
           <div className="absolute bottom-0 left-0 w-[60px] h-[45px] bg-[#F4F4F4] rounded-sm relative border border-[#E2E9E5]/50 shadow-md">
              <div className="absolute -top-[22px] -left-[4px] w-[68px] h-[24px] bg-[#937567] rounded-t-sm transform shadow-sm"></div>
              <div className="absolute top-[15px] left-[15px] w-4 h-5 bg-[#B5D3C6] opacity-90 border border-[#647474]/20"></div>
              <div className="absolute top-[15px] right-[15px] w-4 h-5 bg-[#B5D3C6] opacity-90 border border-[#647474]/20"></div>
           </div>
           <div className="absolute bottom-0 right-0 w-[45px] h-[35px] bg-[#FAFAF8] rounded-sm border border-[#E2E9E5]/60 shadow-sm">
             <div className="absolute -top-[16px] -left-[2px] w-[49px] h-[18px] bg-[#A18174] rounded-t-sm transform shadow-sm"></div>
           </div>
        </div>
        
        {/* Right Trees */}
        <div className="absolute bottom-[110px] right-[25%] w-[40px] h-[70px] bg-[#075B3A] rounded-t-full opacity-95 z-10 shadow-md"></div>
        <div className="absolute bottom-[105px] right-[20%] w-[50px] h-[85px] bg-[#087A45] rounded-t-full opacity-90 z-10 shadow-md"></div>

        {/* Central Wind Turbine */}
        <div className="absolute bottom-[125px] left-[65%] z-10 transform scale-110">
          <div className="w-[4px] h-[90px] bg-[#E2E9E5] mx-auto shadow-sm"></div>
          <div className="absolute -top-[45px] -left-[43px] w-[90px] h-[90px] animate-spin-slow">
            <div className="absolute top-[43px] left-[43px] w-[45px] h-[5px] bg-[#FAFAF8] origin-left shadow-sm"></div>
            <div className="absolute top-[43px] left-[43px] w-[45px] h-[5px] bg-[#FAFAF8] origin-left rotate-120 shadow-sm"></div>
            <div className="absolute top-[43px] left-[43px] w-[45px] h-[5px] bg-[#FAFAF8] origin-left rotate-240 shadow-sm"></div>
            <div className="absolute top-[43px] left-[43px] w-2.5 h-2.5 rounded-full bg-[#102A2A] -ml-1 -mt-1 shadow-sm"></div>
          </div>
        </div>
        
        {/* Smaller Wind Turbine */}
        <div className="absolute bottom-[115px] left-[55%] z-10 transform scale-75">
          <div className="w-[3px] h-[70px] bg-[#D1D5D4] mx-auto"></div>
          <div className="absolute -top-[35px] -left-[33px] w-[70px] h-[70px] animate-spin-slow" style={{ animationDelay: '0.7s' }}>
            <div className="absolute top-[33px] left-[33px] w-[35px] h-[4px] bg-[#F4F4F4] origin-left"></div>
            <div className="absolute top-[33px] left-[33px] w-[35px] h-[4px] bg-[#F4F4F4] origin-left rotate-120"></div>
            <div className="absolute top-[33px] left-[33px] w-[35px] h-[4px] bg-[#F4F4F4] origin-left rotate-240"></div>
            <div className="absolute top-[33px] left-[33px] w-2 h-2 rounded-full bg-[#102A2A] -ml-[3px] -mt-[1px]"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
