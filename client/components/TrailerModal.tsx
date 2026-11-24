"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface TrailerModalProps {
  videoKey: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrailerModal({
  videoKey,
  isOpen,
  onClose,
}: TrailerModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !videoKey) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("trailer-modal-change", { detail: true }));

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = prevOverflow || "auto";
      window.dispatchEvent(new CustomEvent("trailer-modal-change", { detail: false }));
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, videoKey]);

  if (!mounted || !isOpen || !videoKey) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onCloseRef.current();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl aspect-video mx-auto"
      >
        <button
          type="button"
          onClick={() => onCloseRef.current()}
          aria-label="Fechar trailer"
          className="absolute -top-11 right-0 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-neutral-300 hover:text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.9)] bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
