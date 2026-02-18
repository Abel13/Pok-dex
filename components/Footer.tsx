"use client";

import { useState, useEffect } from "react";

const BUYMECOFFEE_USERNAME = process.env.NEXT_PUBLIC_BUYMECOFFEE_USERNAME;

export default function Footer() {
  const [coordinates, setCoordinates] = useState<string>(
    "34.0522° N, 118.2437° W",
  );
  const [latency, setLatency] = useState<number>(14);

  useEffect(() => {
    // Try to get real coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lon = position.coords.longitude.toFixed(4);
          setCoordinates(`${lat}° N, ${lon}° W`);
        },
        () => {
          // Keep default if geolocation fails
        },
      );
    }

    // Simulate latency measurement
    const interval = setInterval(() => {
      const mockLatency = Math.floor(Math.random() * 10) + 10;
      setLatency(mockLatency);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-pokedex-gray/50 border-t border-pokedex-blue-light/30 backdrop-blur-sm">
      <div className="max-w-full mx-auto px-4 md:px-6 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          {/* Left: Coordinates */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">COORD:</span>
            <span className="text-pokedex-cyan">{coordinates}</span>
          </div>

          {/* Center: Latency */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">LATENCY:</span>
            <span className="text-pokedex-blue-light">{latency} MS</span>
          </div>

          {/* Right: Encryption and Sync */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-pokedex-cyan">LIVE_SYNC</span>
            </div>
          </div>
        </div>

        {/* Donation + Copyright */}
        <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          {BUYMECOFFEE_USERNAME && (
            <a
              href={`https://www.buymeacoffee.com/${BUYMECOFFEE_USERNAME}`}
              target="_blank"
              rel="noreferrer noopener"
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              <img
                src={`https://img.buymeacoffee.com/button-api/?text=Apoie o projeto&slug=${BUYMECOFFEE_USERNAME}&button_colour=5F7FFF&font_colour=ffffff&height=28`}
                alt="Buy Me a Coffee"
                className="h-7"
              />
            </a>
          )}
          <p className="text-xs text-gray-500">© 2026 PDEXAI</p>
        </div>
      </div>
    </footer>
  );
}
