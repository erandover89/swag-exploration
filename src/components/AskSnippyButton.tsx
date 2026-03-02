import { Sparkles } from 'lucide-react';

export function AskSnippyButton() {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="relative">
        {/* Main circle button */}
        <div className="w-12 h-12 rounded-full bg-white/30 border border-[#36d4ff] flex items-center justify-center shadow-[0px_16px_24px_0px_rgba(1,39,84,0.16)] group-hover:shadow-[0px_20px_28px_0px_rgba(1,39,84,0.22)] transition-shadow">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-200 to-blue-400">
            <img src="/products/SnippAI_Icon.png" alt="Snipp AI" className="w-10 h-10 object-cover" />
          </div>
        </div>
        {/* Large sparkle – top right */}
        <div className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#a855f7] drop-shadow-sm" />
        </div>
        {/* Small sparkle – bottom left */}
        <div className="absolute bottom-1 -left-1.5 w-3.5 h-3.5 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-[#a855f7] drop-shadow-sm" />
        </div>
      </div>
      {/* Label */}
      <div className="flex items-center gap-0.5 text-[14px] text-[#012754]"
           style={{ fontFamily: "'Clash Display', sans-serif" }}>
        <span>Ask Snipp</span>
        <span className="border border-[#012754] text-[#012754] text-[6px] font-bold px-0.5 rounded-[2px] uppercase ml-0.5">AI</span>
      </div>
    </div>
  );
}
