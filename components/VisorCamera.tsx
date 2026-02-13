"use client";

import React, { useRef, useState, useEffect } from "react";

interface VisorCameraProps {
  onCapture: (imageData: string) => void;
  isIdentifying: boolean;
  onClose?: () => void;
  captureError?: string | null;
  onClearCaptureError?: () => void;
  canScan?: boolean;
  scansRemaining?: number;
  onUpgradeClick?: () => void;
}

export default function VisorCamera({
  onCapture,
  isIdentifying,
  onClose,
  captureError,
  onClearCaptureError,
  canScan = true,
  scansRemaining = 10,
  onUpgradeClick,
}: VisorCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Setup video when stream is available and video ref is ready
  useEffect(() => {
    if (stream && videoRef.current && isActive) {
      const video = videoRef.current;
      video.srcObject = stream;
      setIsVideoReady(false);

      let timeouts: NodeJS.Timeout[] = [];

      const checkVideoReady = () => {
        if (videoRef.current) {
          const v = videoRef.current;
          if (
            v.readyState >= v.HAVE_ENOUGH_DATA &&
            v.videoWidth > 0 &&
            v.videoHeight > 0
          ) {
            setIsVideoReady(true);
          } else {
            const timeout = setTimeout(checkVideoReady, 100);
            timeouts.push(timeout);
          }
        }
      };

      video.addEventListener("loadedmetadata", checkVideoReady);
      video.addEventListener("loadeddata", checkVideoReady);
      video.addEventListener("canplay", checkVideoReady);

      timeouts.push(setTimeout(checkVideoReady, 500));
      timeouts.push(setTimeout(checkVideoReady, 1000));
      timeouts.push(setTimeout(checkVideoReady, 2000));

      return () => {
        video.removeEventListener("loadedmetadata", checkVideoReady);
        video.removeEventListener("loadeddata", checkVideoReady);
        video.removeEventListener("canplay", checkVideoReady);
        timeouts.forEach((timeout) => clearTimeout(timeout));
      };
    }
  }, [stream, isActive]);

  // Limpar imagem quando identificação terminar
  useEffect(() => {
    if (!isIdentifying && capturedImage) {
      setCapturedImage(null);
    }
  }, [isIdentifying, capturedImage]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      setStream(mediaStream);
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsActive(false);
      setIsVideoReady(false);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      video.readyState !== video.HAVE_ENOUGH_DATA ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return;
    }

    // Limpar imagem anterior se houver
    setCapturedImage(null);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    const base64 = imageData.split(",")[1];

    if (!base64 || base64.length < 100) {
      return;
    }

    // Salvar imagem capturada no estado
    setCapturedImage(imageData);

    // Enviar base64 para identificação
    onCapture(base64);
  };

  // Determine status color
  const getStatusColor = () => {
    if (error || captureError) return "bg-red-500";
    if (!isActive) return "bg-yellow-500";
    if (!isVideoReady) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Get status text
  const getStatusText = () => {
    if (error || captureError) return "ERRO";
    if (isIdentifying) return "IDENTIFICANDO...";
    if (!isActive) return "INICIALIZANDO...";
    if (!isVideoReady) return "INICIALIZANDO...";
    return "PRONTO";
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Video Stream ou Imagem Capturada - video sempre montado para manter o stream ao voltar após erro */}
      {isActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isIdentifying && capturedImage ? "hidden" : ""}`}
          />
          {isIdentifying && capturedImage && (
            <img
              src={capturedImage}
              alt="Frame capturado"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black">
          <div className="w-16 mb-5 h-20"></div>
          <div className="w-16 h-16 border-4 border-pokedex-blue-light/30 rounded-full animate-pulse-scan"></div>

          <p className="mt-20 text-pokedex-cyan text-sm font-mono animate-bounce">
            INITIALIZING...
          </p>
        </div>
      )}

      {/* HUD Overlay Futurista */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Grid Pattern Animado */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Scan Lines Rotativas (Radar/Sonar Effect) - Círculo evita quadrado cortar sombra */}
        {isActive && !(isIdentifying && capturedImage) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden">
              {/* Rotating scan line - máscara circular para radar sem bordas cortadas */}
              <div
                className="absolute inset-0 animate-rotate-scan rounded-full"
                style={{
                  background: `conic-gradient(
                    transparent 0deg,
                    transparent 60deg,
                    rgba(6, 182, 212, 0.3) 90deg,
                    rgba(6, 182, 212, 0.5) 120deg,
                    transparent 150deg
                  )`,
                }}
              />
            </div>
          </div>
        )}

        {/* Crosshair Central com Pulse - Círculo para não cortar o glow do sonar */}
        <div className="absolute inset-0 flex items-center justify-center overflow-visible">
          <div className="relative">
            {/* Outer ring - circular para combinar com radar */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 border-2 border-pokedex-cyan/50 rounded-full animate-pulse-scan">
              {/* Inner crosshair lines */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-pokedex-cyan/30 transform -translate-y-1/2">
                <div className="absolute left-0 w-8 h-full bg-pokedex-cyan/50"></div>
                <div className="absolute right-0 w-8 h-full bg-pokedex-cyan/50"></div>
              </div>
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-pokedex-cyan/30 transform -translate-x-1/2">
                <div className="absolute top-0 h-8 w-full bg-pokedex-cyan/50"></div>
                <div className="absolute bottom-0 h-8 w-full bg-pokedex-cyan/50"></div>
              </div>
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-pokedex-cyan rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse-scan glow-cyan"></div>
            </div>
          </div>
        </div>

        {/* Status Indicator - Top Left */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse-scan`}
            ></div>
            <span className="text-xs font-mono text-pokedex-cyan text-glow-cyan">
              {getStatusText()}
            </span>
            {isActive && isVideoReady && !isIdentifying && !captureError && (
              <div className="w-2 h-2 bg-pokedex-cyan rounded-full animate-pulse-scan"></div>
            )}
          </div>
          {!canScan && scansRemaining < Infinity && (
            <span className="text-xs font-mono text-amber-400">
              SCANS TODAY: {scansRemaining}/10 — APOIE O PROJETO
            </span>
          )}
          {canScan && scansRemaining < Infinity && (
            <span className="text-xs font-mono text-pokedex-cyan">
              SCANS REMAINING: {scansRemaining}
            </span>
          )}
        </div>

        {/* Corner brackets */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-pokedex-cyan/30"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-pokedex-cyan/30"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-pokedex-cyan/30"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-pokedex-cyan/30"></div>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Botão Cancelar - Top Right */}
      {onClose && (
        <button
          onClick={() => {
            setCapturedImage(null);
            onClose();
          }}
          className="absolute top-6 right-6 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-pokedex-gray/80 hover:bg-pokedex-gray border border-pokedex-blue-light/50 text-pokedex-blue-light hover:text-white transition-all hover:glow-blue"
          aria-label="Fechar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Status Text During Identification */}
      {isIdentifying && !captureError && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/70 border border-pokedex-cyan/50 rounded-lg px-4 py-2 backdrop-blur-sm">
            <p className="text-pokedex-cyan text-sm sm:text-base font-mono text-glow-cyan animate-pulse-scan">
              IDENTIFICANDO...
            </p>
          </div>
        </div>
      )}

      {/* Banner de Erro de Identificação */}
      {captureError && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full px-4">
          <div className="bg-red-900/95 border-2 border-red-500 rounded-lg p-4 backdrop-blur-sm glow-red">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-200 text-sm font-mono mb-2">
                  {captureError}
                </p>
                {onClearCaptureError && (
                  <button
                    onClick={onClearCaptureError}
                    className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded transition-all"
                  >
                    TENTAR NOVAMENTE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Limit reached - show upgrade button */}
      {!canScan && onUpgradeClick && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-40 max-w-xs w-full px-4">
          <div className="bg-amber-900/95 border-2 border-amber-500 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-amber-200 text-sm font-mono mb-3">
              Limite diário de identificações atingido.
            </p>
            <button
              onClick={onUpgradeClick}
              className="w-full py-2 px-4 bg-pokedex-purple hover:bg-pokedex-purple/80 text-white font-bold text-sm rounded transition-all"
            >
              APOIE O PROJETO
            </button>
          </div>
        </div>
      )}

      {/* Botão Captura - Center Bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <button
          onClick={captureFrame}
          disabled={
            isIdentifying ||
            !isVideoReady ||
            !isActive ||
            !!captureError ||
            !canScan
          }
          className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center rounded-full border-3 border-pokedex-cyan bg-black/50 hover:bg-black/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderWidth: "3px",
            boxShadow:
              isVideoReady && !isIdentifying && !captureError
                ? "0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)"
                : "none",
          }}
          aria-label="Capturar"
        >
          {/* Pulsing ring when ready */}
          {isVideoReady && !isIdentifying && !captureError && (
            <div
              className="absolute inset-0 rounded-full border-3 border-pokedex-cyan animate-pulse-ring"
              style={{ borderWidth: "3px" }}
            ></div>
          )}

          {/* Fill animation during identification */}
          {isIdentifying && (
            <div
              className="absolute inset-0 rounded-full bg-pokedex-cyan/20"
              style={{
                clipPath: "inset(0 0 0 0)",
                animation: "fill-capture 2s ease-in-out",
              }}
            ></div>
          )}

          <svg
            width="40"
            height="40"
            viewBox="0 0 256 256"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M128 16 
           A112 112 0 0 1 240 128 
           L16 128 
           A112 112 0 0 1 128 16 Z"
              fill="#E3350D"
            />

            <path
              d="M16 128 
           A112 112 0 0 0 240 128 
           L16 128 Z"
              fill="#FFFFFF"
            />

            <rect x="16" y="120" width="224" height="16" fill="#111111" />

            <circle
              cx="128"
              cy="128"
              r="112"
              fill="none"
              stroke="#111111"
              strokeWidth="8"
            />

            <circle
              cx="128"
              cy="128"
              r="28"
              fill="#FFFFFF"
              stroke="#111111"
              strokeWidth="8"
            />
            <circle cx="128" cy="128" r="12" fill="#111111" />
          </svg>
        </button>
      </div>

      {/* Error message - Minimalist */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-900/90 text-white px-4 py-2 rounded border border-red-500 z-30 max-w-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse-scan"></div>
            <p className="text-xs font-mono">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
