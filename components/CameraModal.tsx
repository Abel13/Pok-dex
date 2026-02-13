"use client";

import React, { useEffect } from "react";
import VisorCamera from "./VisorCamera";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
  isIdentifying: boolean;
  captureError?: string | null;
  onClearCaptureError?: () => void;
  canScan?: boolean;
  scansRemaining?: number;
  onUpgradeClick?: () => void;
}

export default function CameraModal({
  isOpen,
  onClose,
  onCapture,
  isIdentifying,
  captureError,
  onClearCaptureError,
  canScan = true,
  scansRemaining = 10,
  onUpgradeClick,
}: CameraModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full bg-black overflow-hidden"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <VisorCamera
          onCapture={onCapture}
          isIdentifying={isIdentifying}
          onClose={onClose}
          captureError={captureError}
          onClearCaptureError={onClearCaptureError}
          canScan={canScan}
          scansRemaining={scansRemaining}
          onUpgradeClick={onUpgradeClick}
        />
      </div>
    </div>
  );
}
