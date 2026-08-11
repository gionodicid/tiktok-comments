"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface LightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function Lightbox({ src, alt = "Image", onClose }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "tcm-hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="tcm-fixed tcm-inset-0 tcm-z-50 tcm-flex tcm-items-center tcm-justify-center tcm-bg-black/80 tcm-animate-in tcm-fade-in tcm-duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="tcm-absolute tcm-top-4 tcm-right-4 tcm-z-10 tcm-w-10 tcm-h-10 tcm-rounded-full tcm-bg-black/60 tcm-hover:tcm-bg-black/80 tcm-flex tcm-items-center tcm-justify-center tcm-text-white tcm-transition-colors"
        aria-label="Close lightbox"
      >
        <X size={20} />
      </button>

      {/* Image */}
      <div
        className="tcm-relative tcm-max-w-[90vw] tcm-max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="tcm-object-contain tcm-max-w-[90vw] tcm-max-h-[80vh] tcm-rounded-lg"
        />
      </div>
    </div>
  );
}
