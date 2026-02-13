"use client";

import { useState, useEffect } from "react";
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
  const { scannedIds, addScannedPokemon, isScanned } = useScannedPokemon();
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
    if (!canAccessPokemon(id)) {
      setIsUpgradeModalOpen(true);
      return;
    }
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
        throw new Error(json.error || "Limite atingido. Apoie o projeto para continuar.");
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

      if (!canAccessPokemon(data.pokemon.id)) {
        setCaptureError(
          "Pokémon #152+ não disponível nesta versão.",
        );
        setIsUpgradeModalOpen(true);
        return;
      }

      addScannedPokemon(data.pokemon.id);

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

        {/* Center - Pokemon Display */}
        <div className="flex-1 overflow-hidden min-h-0">
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
