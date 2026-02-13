"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import RosterIndex from "./RosterIndex";
import PokemonCentralDisplay from "./PokemonCentralDisplay";
import InfoCards from "./InfoCards";
import Footer from "./Footer";
import CameraModal from "./CameraModal";
import UpgradeModal from "./UpgradeModal";
import AuthModal from "./AuthModal";
import { PokemonData } from "@/lib/types";
import { useScannedPokemon } from "@/lib/hooks/useScannedPokemon";
import { useUserPlan } from "@/lib/hooks/useUserPlan";
import { useAuth } from "@/lib/hooks/useAuth";

// Dynamically import CaptureMap (client-side only, uses Leaflet)
const CaptureMap = dynamic(() => import("./CaptureMap"), { ssr: false });

export default function Pokedex() {
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isLoadingPokemon, setIsLoadingPokemon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"details" | "map">("details");
  const { scannedIds, captures, addScannedPokemon, isScanned } =
    useScannedPokemon();
  const {
    canScan,
    canGenerateDescription,
    canAccessPokemon,
    updateUsageFromServer,
    refetchPlan,
    planData,
    scansRemaining,
    descriptionsRemaining,
  } = useUserPlan();
  const { isLoggedIn, signIn, signUp, signOut, authError, clearError } =
    useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      refetchPlan();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [refetchPlan]);

  const unlockSpeechForMobile = () => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0.001;
      speechSynthesis.speak(u);
    }
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window && text?.trim()) {
      speechSynthesis.cancel();
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  const generateAndSpeakDescription = async (data: PokemonData) => {
    const types = data.pokemon.types.map((t) => t.type.name);
    if (!canGenerateDescription()) {
      speak(`${data.pokemon.name}, o Pokémon ${types[0]}.`);
      setIsUpgradeModalOpen(true);
      return;
    }
    try {
      const abilities =
        data.pokemon.abilities?.map((a) => a.ability.name) || [];
      const stats = data.pokemon.stats.map((stat) => ({
        name: stat.stat.name,
        value: stat.base_stat,
      }));

      const describeResponse = await fetch("/api/pokemon/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pokemonName: data.pokemon.name,
          types,
          abilities,
          stats,
          height: data.pokemon.height / 10, // Convert to meters
          weight: data.pokemon.weight / 10, // Convert to kg
          isLegendary: data.species.is_legendary || false,
          isMythical: data.species.is_mythical || false,
        }),
      });

      if (describeResponse.ok) {
        const json = await describeResponse.json();
        if (json.usage) updateUsageFromServer(json.usage);
        speak(json.description);
      } else if (describeResponse.status === 429) {
        const json = await describeResponse.json().catch(() => ({}));
        speak(`${data.pokemon.name}, o Pokémon ${types[0]}.`);
        setIsUpgradeModalOpen(true);
      } else {
        speak(`${data.pokemon.name}, o Pokémon ${types[0]}.`);
      }
    } catch (err) {
      const types = data.pokemon.types.map((t) => t.type.name);
      speak(`${data.pokemon.name}, o Pokémon ${types[0]}.`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectPokemon = async (id: number) => {
    unlockSpeechForMobile();
    setSelectedPokemonId(id);
    setError(null);
    setIsLoadingPokemon(true);

    try {
      // Fetch Pokémon data by ID
      const response = await fetch(`/api/pokemon/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch Pokémon data");
      }

      const data: PokemonData = await response.json();
      setPokemonData(data);

      // Generate and speak anime-style description
      await generateAndSpeakDescription(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
    } finally {
      setIsLoadingPokemon(false);
    }
  };

  const handleCapture = async (imageData: string) => {
    if (!canScan(planData.totalScanned)) {
      setIsUpgradeModalOpen(true);
      return;
    }
    unlockSpeechForMobile();
    setIsIdentifying(true);
    setError(null);
    setCaptureError(null);

    try {
      // Identify Pokémon
      const identifyResponse = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });

      if (identifyResponse.status === 429) {
        const json = await identifyResponse.json().catch(() => ({}));
        throw new Error(
          json.error || "Limite atingido. Apoie o projeto para continuar.",
        );
      }
      if (!identifyResponse.ok) {
        throw new Error("Erro ao identificar Pokémon");
      }

      const identifyJson = await identifyResponse.json();
      const pokemonName = identifyJson.pokemonName;
      if (identifyJson.usage) updateUsageFromServer(identifyJson.usage);

      if (pokemonName === "UNKNOWN" || !pokemonName) {
        throw new Error("Pokémon não identificado. Tente novamente.");
      }

      // Fetch Pokémon data
      const pokemonResponse = await fetch(
        `/api/pokemon/${encodeURIComponent(pokemonName)}`,
      );

      if (!pokemonResponse.ok) {
        const errorData = await pokemonResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao buscar dados do Pokémon");
      }

      const data: PokemonData = await pokemonResponse.json();

      // Get geolocation if available
      let location: { lat: number; lng: number } | undefined;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error("Geolocation timeout"));
              }, 5000);

              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  clearTimeout(timeout);
                  resolve(pos);
                },
                (err) => {
                  clearTimeout(timeout);
                  reject(err);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 5000,
                  maximumAge: 0,
                },
              );
            },
          );

          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        } catch (err) {
          // Geolocation failed or denied - continue without location
          console.log("Geolocation not available:", err);
        }
      }

      addScannedPokemon(data.pokemon.id, location);

      setPokemonData(data);
      setSelectedPokemonId(data.pokemon.id);

      // Generate and speak anime-style description
      await generateAndSpeakDescription(data);

      // Close camera modal after successful identification
      setIsCameraOpen(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setCaptureError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
    setCaptureError(null);
    setError(null);
  };

  const handleClearCaptureError = () => {
    setCaptureError(null);
  };

  const handleSelectPokemonWithClose = async (id: number) => {
    await handleSelectPokemon(id);
    // Close sidebars on mobile after selection
    setIsRosterOpen(false);
    setIsInfoOpen(false);
  };

  return (
    <div className="h-screen bg-pokedex-dark flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <Header
          onSearch={handleSearch}
          onOpenCamera={handleOpenCamera}
          onToggleRoster={() => setIsRosterOpen(!isRosterOpen)}
          onToggleInfo={() => setIsInfoOpen(!isInfoOpen)}
          isRosterOpen={isRosterOpen}
          isInfoOpen={isInfoOpen}
          isLoggedIn={isLoggedIn}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onSignOut={signOut}
        />
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Mobile Overlay */}
        {(isRosterOpen || isInfoOpen) && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => {
              setIsRosterOpen(false);
              setIsInfoOpen(false);
            }}
          />
        )}

        {/* Left Sidebar - Roster Index */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-80 lg:w-64 xl:w-80 h-full lg:h-auto flex-shrink-0 border-r border-pokedex-blue-light/30 bg-pokedex-gray/30 lg:bg-transparent transform transition-transform duration-300 ease-in-out ${
            isRosterOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <RosterIndex
            searchQuery={searchQuery}
            selectedPokemonId={selectedPokemonId}
            onSelectPokemon={handleSelectPokemonWithClose}
            onClose={() => setIsRosterOpen(false)}
            scannedIds={scannedIds}
            isScanned={isScanned}
            canAccessPokemon={canAccessPokemon}
            totalScannedLimit={50}
            onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          />
        </div>

        {/* Center - Pokemon Display / Map */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* View Toggle Bar - dedicated row, no overlap */}
          <div className="flex items-center bg-pokedex-dark/80">
            <div className="flex">
              <button
                onClick={() => setViewMode("details")}
                className={`p-2.5 transition-all border-2 ${
                  viewMode === "details"
                    ? "bg-pokedex-cyan text-black border-pokedex-cyan"
                    : "bg-pokedex-gray/80 text-gray-400 border-pokedex-gray hover:border-pokedex-cyan/50 hover:text-pokedex-cyan"
                }`}
                title="Ver Detalhes"
                aria-label="Ver Detalhes"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2.5 transition-all border-2 ${
                  viewMode === "map"
                    ? "bg-pokedex-cyan text-black border-pokedex-cyan"
                    : "bg-pokedex-gray/80 text-gray-400 border-pokedex-gray hover:border-pokedex-cyan/50 hover:text-pokedex-cyan"
                }`}
                title="Ver Mapa"
                aria-label="Ver Mapa"
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
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Content area - error, map or details */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {error ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-pokedex-red rounded-lg hover:bg-red-700 transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            ) : viewMode === "map" ? (
              <CaptureMap captures={captures} />
            ) : (
              <PokemonCentralDisplay
                data={pokemonData}
                onOpenCamera={handleOpenCamera}
                isLoading={isLoadingPokemon}
                canGenerateDescription={canGenerateDescription()}
                descriptionsRemaining={descriptionsRemaining}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar - Info Cards */}
        <div
          className={`fixed lg:static inset-y-0 right-0 z-50 lg:z-auto w-80 lg:w-80 xl:w-96 h-full lg:h-auto flex-shrink-0 border-l border-pokedex-blue-light/30 bg-pokedex-gray/30 lg:bg-transparent transform transition-transform duration-300 ease-in-out ${
            isInfoOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <InfoCards data={pokemonData} onClose={() => setIsInfoOpen(false)} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0">
        <Footer />
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={handleCloseCamera}
        onCapture={handleCapture}
        isIdentifying={isIdentifying}
        captureError={captureError}
        onClearCaptureError={handleClearCaptureError}
        canScan={canScan(scannedIds.size)}
        scansRemaining={scansRemaining}
        onUpgradeClick={() => {
          setIsCameraOpen(false);
          setIsUpgradeModalOpen(true);
        }}
      />
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        usage={{
          dailyScans: planData.dailyScans,
          monthlyDescriptions: planData.monthlyDescriptions,
          totalScanned: scannedIds.size,
        }}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
        signIn={signIn}
        signUp={signUp}
        authError={authError}
        clearError={clearError}
      />
    </div>
  );
}
