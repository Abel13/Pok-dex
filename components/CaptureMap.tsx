"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Capture } from "@/lib/hooks/useScannedPokemon";
import Image from "next/image";

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false },
);

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

interface CaptureMapProps {
  captures: Capture[];
}

interface GroupedCapture {
  lat: number;
  lng: number;
  pokemonIds: number[];
}

// Round coordinates to 4 decimal places (~11m precision) for grouping
function roundCoordinate(coord: number): number {
  return Math.round(coord * 10000) / 10000;
}

// Group captures by location
function groupCapturesByLocation(
  captures: Capture[],
): GroupedCapture[] {
  const groups = new Map<string, GroupedCapture>();

  captures.forEach((capture) => {
    if (capture.lat === undefined || capture.lng === undefined) {
      return; // Skip captures without location
    }

    const roundedLat = roundCoordinate(capture.lat);
    const roundedLng = roundCoordinate(capture.lng);
    const key = `${roundedLat},${roundedLng}`;

    if (!groups.has(key)) {
      groups.set(key, {
        lat: roundedLat,
        lng: roundedLng,
        pokemonIds: [],
      });
    }

    const group = groups.get(key)!;
    if (!group.pokemonIds.includes(capture.pokemonId)) {
      group.pokemonIds.push(capture.pokemonId);
    }
  });

  return Array.from(groups.values());
}

// Custom marker icon for single Pokémon
function createPokemonIcon(pokemonId: number, L: any) {
  if (!L) {
    return undefined;
  }

  const iconUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

  return L.divIcon({
    className: "pokemon-marker",
    html: `<div style="
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid #06b6d4;
      background: rgba(10, 10, 10, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
      overflow: hidden;
    ">
      <img src="${iconUrl}" alt="Pokémon ${pokemonId}" style="width: 100%; height: 100%; object-fit: contain;" />
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

// Custom marker icon for multiple Pokémon
function createMultiPokemonIcon(count: number, L: any) {
  if (!L) {
    return undefined;
  }

  return L.divIcon({
    className: "pokemon-marker-multi",
    html: `<div style="
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 3px solid #7c3aed;
      background: rgba(10, 10, 10, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
      position: relative;
    ">
      <div style="
        color: #7c3aed;
        font-weight: bold;
        font-size: 18px;
        font-family: 'JetBrains Mono', monospace;
      ">${count}</div>
    </div>`,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  });
}

export default function CaptureMap({ captures }: CaptureMapProps) {
  const groupedCaptures = useMemo(
    () => groupCapturesByLocation(captures),
    [captures],
  );

  const capturesWithLocation = captures.filter(
    (c) => c.lat !== undefined && c.lng !== undefined,
  );

  // Calculate center of map (average of all locations, or default to Brazil)
  const center: [number, number] = useMemo(() => {
    if (capturesWithLocation.length === 0) {
      return [-15.7975, -47.8919]; // Default to Brasília, Brazil
    }

    const avgLat =
      capturesWithLocation.reduce((sum, c) => sum + (c.lat || 0), 0) /
      capturesWithLocation.length;
    const avgLng =
      capturesWithLocation.reduce((sum, c) => sum + (c.lng || 0), 0) /
      capturesWithLocation.length;

    return [avgLat, avgLng];
  }, [capturesWithLocation]);

  // Load Leaflet only on client
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      // Fix default marker icon issue
      delete (L.default as any).Icon.Default.prototype._getIconUrl;
      (L.default as any).Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      if (typeof window !== "undefined") {
        (window as any).L = L.default;
      }
      setLeafletLoaded(true);
    });
  }, []);

  if (!isClient || typeof window === "undefined" || !leafletLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-pokedex-dark/50 relative overflow-hidden">
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
        <div className="relative z-10 text-center px-4">
          <p className="text-pokedex-cyan text-sm font-mono">CARREGANDO MAPA...</p>
        </div>
      </div>
    );
  }

  if (capturesWithLocation.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-pokedex-dark/50 relative overflow-hidden">
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
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-pokedex-gray/50 rounded-full flex items-center justify-center border-2 border-pokedex-cyan/50 glow-cyan">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-pokedex-cyan"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 font-tech text-glow-cyan">
            NENHUMA CAPTURA COM LOCALIZAÇÃO
          </h2>
          <p className="text-sm sm:text-base text-gray-400 font-mono px-4">
            Capture Pokémon com localização ativada para ver no mapa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-pokedex-dark/50 relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-10 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Map Container */}
      <div className="w-full h-full relative z-10">
        <MapContainer
          center={center}
          zoom={capturesWithLocation.length === 1 ? 15 : 12}
          style={{ height: "100%", width: "100%" }}
          className="z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {groupedCaptures.map((group, index) => {
            const isMulti = group.pokemonIds.length > 1;
            const L = (window as any).L;
            const icon = isMulti
              ? createMultiPokemonIcon(group.pokemonIds.length, L)
              : createPokemonIcon(group.pokemonIds[0], L);

            return (
              <Marker
                key={`${group.lat}-${group.lng}-${index}`}
                position={[group.lat, group.lng]}
                icon={icon}
              >
                <Popup className="pokemon-popup">
                  <div className="bg-pokedex-dark border border-pokedex-cyan/30 rounded-lg p-3 min-w-[200px]">
                    <h3 className="text-pokedex-cyan font-bold text-sm mb-2 font-mono">
                      {isMulti
                        ? `${group.pokemonIds.length} POKÉMON CAPTURADOS`
                        : `POKÉMON #${group.pokemonIds[0]}`}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {group.pokemonIds.map((pokemonId) => (
                        <div
                          key={pokemonId}
                          className="flex flex-col items-center gap-1"
                        >
                          <Image
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
                            alt={`Pokémon ${pokemonId}`}
                            width={64}
                            height={64}
                            className="object-contain"
                            unoptimized
                          />
                          <span className="text-xs text-gray-400 font-mono">
                            #{pokemonId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Custom styles for Leaflet */}
      <style jsx global>{`
        .leaflet-container {
          background: #0a0a0a;
        }
        .pokemon-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .pokemon-popup .leaflet-popup-tip {
          background: rgba(10, 10, 10, 0.95);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        .pokemon-popup .leaflet-popup-close-button {
          color: #06b6d4;
        }
      `}</style>
    </div>
  );
}
