"use client";

import { useState } from "react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onToggleRoster: () => void;
  isRosterOpen: boolean;
  isLoggedIn?: boolean;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export default function Header({
  onSearch,
  onToggleRoster,
  isRosterOpen,
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
                <h1 className="text-xl font-bold text-white font-tech text-glow-blue">
                  PDEXAI_V1.0
                </h1>
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
          <div />
          <div />
        </div>
      </div>
    </header>
  );
}
