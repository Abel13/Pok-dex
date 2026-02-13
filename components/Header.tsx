"use client";

import { useState } from "react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenCamera: () => void;
  onToggleRoster: () => void;
  onToggleInfo: () => void;
  isRosterOpen: boolean;
  isInfoOpen: boolean;
  isPro?: boolean;
  scansRemaining?: number;
  onOpenUpgrade?: () => void;
  isLoggedIn?: boolean;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export default function Header({
  onSearch,
  onOpenCamera,
  onToggleRoster,
  onToggleInfo,
  isRosterOpen,
  isInfoOpen,
  isPro = false,
  scansRemaining = 10,
  onOpenUpgrade,
  isLoggedIn = false,
  onOpenAuth,
  onSignOut,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <header className="w-full bg-pokedex-gray/50 border-b border-pokedex-blue-light/30 backdrop-blur-sm">
      <div className="max-w-full mx-auto px-4 md:px-6 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left: Logo and Status */}
          <div className="flex items-center gap-4 flex-shrink-0 w-full md:w-auto">
            {/* Mobile Menu Button - Roster */}
            <button
              onClick={onToggleRoster}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-pokedex-gray/50 border border-pokedex-blue-light/30 text-pokedex-blue-light hover:glow-blue transition-all"
              aria-label="Toggle Roster Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isRosterOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pokedex-blue-light rounded-lg flex items-center justify-center glow-blue">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white font-tech text-glow-blue">
                    PDEXAI_V1.0
                  </h1>
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                      isPro
                        ? "bg-pokedex-purple text-pokedex-neon"
                        : "bg-pokedex-gray text-gray-400"
                    }`}
                  >
                    {isPro ? "PRO" : "FREE"}
                  </span>
                </div>
                <p className="text-xs text-pokedex-cyan">
                  SYSTEM STATUS: OPTIMAL // CORE ACTIVE
                </p>
              </div>
            </div>
          </div>

          {/* Center: Search Bar - Oculto em mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl md:w-full md:mx-4">
            <div className="flex flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-pokedex-blue-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="SEARCH DATABASE BY NAME OR INDEX..."
                className="w-full pl-10 pr-4 py-2 bg-pokedex-gray/50 border border-pokedex-blue-light/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pokedex-blue-light focus:glow-blue transition-all font-mono text-sm"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 flex-shrink-0 w-full md:w-auto justify-between md:justify-end">
            {isLoggedIn && onSignOut ? (
              <button
                onClick={onSignOut}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white border border-pokedex-blue-light/30 hover:border-pokedex-blue-light/50 transition-all"
                title="Sair"
              >
                SAIR
              </button>
            ) : (
              onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-pokedex-gray/50 hover:bg-pokedex-gray border border-pokedex-blue-light/30 text-pokedex-cyan hover:text-white transition-all"
                  title="Entrar"
                >
                  ENTRAR
                </button>
              )
            )}
            {!isPro && onOpenUpgrade && (
              <button
                onClick={onOpenUpgrade}
                className="px-4 py-2 bg-pokedex-purple/50 hover:bg-pokedex-purple text-pokedex-neon rounded-lg font-semibold text-sm transition-all"
                title="Upgrade para PRO"
              >
                ⚡ UPGRADE
              </button>
            )}
            <button
              onClick={onOpenCamera}
              className="px-4 py-2 bg-pokedex-blue-light hover:bg-blue-600 rounded-lg text-white font-semibold text-sm transition-all glow-blue"
              title="Abrir Câmera"
            >
              📷 CAMERA
            </button>
            {/* Mobile Menu Button - Info */}
            <button
              onClick={onToggleInfo}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-pokedex-gray/50 border border-pokedex-blue-light/30 text-pokedex-blue-light hover:glow-blue transition-all"
              aria-label="Toggle Info Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isInfoOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
