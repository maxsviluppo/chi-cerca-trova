import React from "react";
import { Check, Clock, Trophy, RefreshCw, Sparkles, HelpCircle, User, ArrowRight, Home, Lightbulb } from "lucide-react";
import { Level, HiddenObject } from "../types";

interface GameUIProps {
  level: Level;
  foundObjectIds: Set<string>;
  elapsedTime: number; // in seconds
  onRestart: () => void;
  onSelectLevel: (levelId: string) => void;
  onGoToEditor: () => void;
  allLevels: Level[];
  activeHintId: string | null;
  setActiveHintId: (id: string | null) => void;
  onTriggerVisualHint: () => void;
  isHintLoading: boolean;
}

export const GameUI: React.FC<GameUIProps> = ({
  level,
  foundObjectIds,
  elapsedTime,
  onRestart,
  onSelectLevel,
  onGoToEditor,
  allLevels,
  activeHintId,
  setActiveHintId,
  onTriggerVisualHint,
  isHintLoading,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const totalCount = level.objects.length;
  const foundCount = foundObjectIds.size;
  const isFinished = totalCount > 0 && foundCount === totalCount;

  // Sort objects: unfound first, found in coda (at the end)
  const sortedObjects = [...level.objects].sort((a, b) => {
    const aFound = foundObjectIds.has(a.id);
    const bFound = foundObjectIds.has(b.id);
    if (aFound && !bFound) return 1;
    if (!aFound && bFound) return -1;
    return 0; // maintain relative order
  });

  // Format stopwatch timer (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeHintObject = level.objects.find((o) => o.id === activeHintId);

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      
      {/* 1. Interactive Hint Box (Displays dynamically when user clicks an item at bottom) */}
      {activeHintObject && !foundObjectIds.has(activeHintObject.id) && (
        <div className="bg-indigo-50 border-2 border-indigo-100/70 rounded-2xl p-4 flex gap-3 items-center text-indigo-950 animate-fadeIn shadow-xs relative">
          <HelpCircle className="w-6 h-6 text-indigo-500 shrink-0" />
          <div className="text-xs md:text-sm">
            <span className="font-extrabold text-indigo-600 block mb-0.5">
              Aiuto per {activeHintObject.name}!
            </span>
            <p className="text-indigo-900 leading-normal">{activeHintObject.hint || "Osserva con molta attenzione ogni particolare all'interno dell'immagine!"}</p>
          </div>
          <button
            onClick={() => {
              setActiveHintId(null);
            }}
            className="absolute top-2 right-3 text-xs font-bold text-indigo-400 hover:text-indigo-600 cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      )}

      {/* 2. Bottom Tray: "OGGETTI" with interactive slide drawer handle */}
      <div 
        onClick={() => {
          if (isCollapsed) {
            setIsCollapsed(false);
          }
        }}
        className={`bg-slate-950/15 backdrop-blur-md rounded-3xl pt-1.5 pb-3 px-3 sm:pb-4 sm:px-4 border border-white/10 shadow-xl transition-all duration-300 ${
          isCollapsed ? "animate-attentionBounce cursor-pointer" : ""
        }`}
      >
        
        {/* Draw top bar handle line: Click to toggle slide/dock ("apri e chiudi con una lineare sul bordo superiore") */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }} 
          className="w-full flex justify-center pt-0 pb-1.5 cursor-pointer group select-none"
        >
          <div className="w-16 h-1 rounded-full bg-slate-500/70 group-hover:bg-indigo-400 transition-colors duration-300 mt-0" />
        </div>

        {isCollapsed ? (
          /* Small Banner Mode showing all unfound objects with touch horizontal scroll */
          <div className="w-full animate-fadeIn">
            <div className="flex overflow-x-auto gap-3 py-1 scrollbar-none justify-start touch-pan-x select-none">
              {sortedObjects
                .filter((obj) => !foundObjectIds.has(obj.id))
                .map((obj) => {
                  const isHintActive = activeHintId === obj.id;
                  
                  return (
                    <div
                      key={obj.id}
                      className={`relative rounded-xl border transition-all duration-300 shrink-0 ${
                        isHintActive
                          ? "border-amber-405 bg-slate-950 scale-105 shadow-md shadow-amber-500/10 w-11 h-11 border-2"
                          : "border-slate-800 bg-slate-950/90 hover:bg-slate-850 hover:border-slate-705 w-11 h-11 border-2"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHintId(isHintActive ? null : obj.id);
                        }}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer focus:outline-hidden w-full h-full"
                        title={obj.name}
                      >
                        <span className="leading-none select-none duration-300 text-xl sm:text-2xl">
                          {obj.emoji || "🎯"}
                        </span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          /* Expanded mode: show full, beautifully styled list and description headers as before */
          <div className="w-full animate-fadeIn mt-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
              <h3 className="text-xs font-extrabold text-slate-350 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                Oggetti
              </h3>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={onTriggerVisualHint}
                  disabled={isHintLoading || foundCount === totalCount}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wide transition-all cursor-pointer shadow-sm active:scale-95
                    ${isHintLoading
                      ? "bg-amber-600/20 text-amber-400 border border-amber-800/40 animate-pulse cursor-not-allowed"
                      : foundCount === totalCount
                      ? "bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-50"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 hover:scale-[1.02]"}`}
                >
                  <Lightbulb className={`w-3.5 h-3.5 ${isHintLoading ? "animate-bounce" : ""}`} />
                  {isHintLoading ? (
                    <span className="flex items-center gap-1">
                      <span>Ricerca in corso...</span>
                    </span>
                  ) : (
                    <span>Suggerimento Visivo</span>
                  )}
                </button>
              </div>
            </div>

            {totalCount === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Nessun oggetto configurato per questo livello.
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-4 py-2 scrollbar-thin scrollbar-thumb-slate-700 pb-2">
                {sortedObjects.map((obj) => {
                  const isFound = foundObjectIds.has(obj.id);
                  const isHintActive = activeHintId === obj.id;
                  
                  return (
                    <div
                      key={obj.id}
                      className={`flex flex-col items-stretch rounded-2xl border transition-all duration-300 shrink-0 ${
                        isFound 
                          ? "border-rose-955 bg-slate-950/20 opacity-40 min-w-[55px] sm:min-w-[62px] h-12 sm:h-14 p-0" 
                          : isHintActive
                          ? "border-amber-400 bg-slate-950 scale-105 shadow-lg shadow-amber-500/10 min-w-[110px] sm:min-w-[125px] border-2 p-1 pb-2"
                          : "border-slate-800 bg-slate-950/90 hover:bg-slate-805 hover:border-slate-700 min-w-[110px] sm:min-w-[125px] border-2 p-1 pb-2"
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (!isFound) {
                            setActiveHintId(isHintActive ? null : obj.id);
                          }
                        }}
                        disabled={isFound}
                        className={`flex flex-col items-center justify-center cursor-pointer focus:outline-hidden w-full h-full ${
                          isFound ? "p-1.5 cursor-not-allowed" : "p-2.5"
                        }`}
                      >
                        {/* Circle item pocket container (reduced by 50% for found items, e.g. w-7 vs w-12) */}
                        <div className={`relative rounded-full bg-slate-900 flex items-center justify-center shadow-inner ${
                          isFound 
                            ? "w-7 h-7 border border-rose-500/40" 
                            : "w-14 h-14 border-2 border-slate-850 mb-2.5"
                        }`}>
                          <span className={`leading-none select-none transition-transform duration-300 ${
                            isFound ? "text-xs" : "text-3xl sm:text-4xl"
                          }`}>
                            {obj.emoji || "🎯"}
                          </span>

                          {/* Found red X overlay stamp (hand-drawn thick diagonals across the pocket) */}
                          {isFound && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" />
                              <line x1="20.5" y1="3.5" x2="3.5" y2="20.5" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>

                        {!isFound && (
                          <p className="text-center font-extrabold text-[10px] sm:text-xs truncate w-full px-1 mb-1.5 text-slate-100">
                            {obj.name}
                          </p>
                        )}

                        {!isFound && (
                          <div className="w-full text-center">
                            {isHintActive ? (
                              <span className="text-[8px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded-md animate-pulse">
                                Indizio
                              </span>
                            ) : (
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md">
                                Cella
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Complete Level / Game Won Overlay Modal */}
      {isFinished && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border-4 border-slate-800 p-6 sm:p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            
            {/* Ambient Background sparkler rings */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-indigo-100 rounded-full blur-2xl opacity-50" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-100 rounded-full blur-2xl opacity-50" />

            {/* Cup icon badge */}
            <div className="relative w-24 h-24 mx-auto rounded-full bg-amber-50 border-4 border-amber-300 flex items-center justify-center mb-6 animate-pulse">
              <Trophy className="w-12 h-12 text-amber-500" />
              <Sparkles className="absolute top-1 right-1 w-6 h-6 text-amber-400 animate-bounce" />
            </div>

            <h2 className="text-3xl font-black text-slate-850 tracking-tight leading-none mb-2">
              Fantastico!
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Hai scovato tutti gli elementi nascosti in questo livello! Sei un vero segugio.
            </p>

            {/* Scorecard row */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Tempo di gioco
                </p>
                <p className="text-xl font-black font-mono text-slate-800">
                  {formatTime(elapsedTime)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Difficoltà
                </p>
                <p className="text-base font-extrabold text-indigo-600">
                  {level.difficulty}
                </p>
              </div>
            </div>

            {/* Play Again options or select other level */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={onRestart}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer active:scale-95"
              >
                Gioca Ancora Questo Livello
              </button>
              
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 py-1">
                <span>Oppure scegli un altro livello sotto:</span>
              </div>

              {/* Fast selector for other levels */}
              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {allLevels.map((lvl) => {
                  const isActive = lvl.id === level.id;
                  if (isActive) return null; // Skip active
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => onSelectLevel(lvl.id)}
                      className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl hover:border-indigo-100 flex justify-between items-center text-left text-xs font-bold text-slate-700 transition-colors cursor-pointer group"
                    >
                      <span className="truncate">{lvl.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex gap-2">
                <button
                  onClick={onGoToEditor}
                  className="flex-1 py-2.5 border border-indigo-200 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-50/50 cursor-pointer transition-colors"
                >
                  Crea Nuovo Livello
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
