"use client";

import { useState } from "react";
import { setSpotlightCookie, clearSpotlightCookie } from "@/app/actions/spotlight";
import { useRouter } from "next/navigation";

interface SpotlightButtonProps {
  slug: string;
  gameName: string;
  isCurrentSpotlight: boolean;
}

export function SpotlightButton({ slug, gameName, isCurrentSpotlight }: SpotlightButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSpotlightToggle = async () => {
    setIsPending(true);
    if (isCurrentSpotlight) {
      await clearSpotlightCookie();
    } else {
      await setSpotlightCookie(slug);
    }
    setIsPending(false);
    
    // Force a router refresh so headers are synced and then navigate
    router.refresh();
    router.push("/spotlight");
  };

  return (
    <button 
      onClick={handleSpotlightToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-full border text-sm font-bold transition-all shadow-lg ${
        isCurrentSpotlight 
          ? "bg-[#EAB308]/20 border-[#EAB308] text-[#EAB308] hover:bg-[#EAB308]/30" 
          : "bg-surface-2/50 border-surface text-text-secondary hover:text-[#EAB308] hover:border-[#EAB308]/50"
      }`}
    >
      {isPending ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <svg fill={isCurrentSpotlight ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
           <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      )}
      {isCurrentSpotlight ? 'Spotlight Activo' : 'Hacer VIP Spotlight ⚡'}
    </button>
  );
}
