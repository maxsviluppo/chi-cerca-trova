import React, { useState, useEffect, useRef } from "react";
import { Plus, Play, Info, Sparkles, HelpCircle, Gamepad2, Layers, Trash, User, Search, RefreshCw, Star, X, Home, Volume2, VolumeX, Clock, ChevronLeft, ChevronRight, Shield, Settings } from "lucide-react";
import { Level, HiddenObject } from "./types";
import { BuiltInLevel, BUILT_IN_LEVEL_OBJECTS } from "./components/BuiltInLevel";
import { EditorView } from "./components/EditorView";
import { GameUI } from "./components/GameUI";
import { ParticleOverlay, ClickParticle } from "./components/ParticleOverlay";
import { InstructionModal } from "./components/InstructionModal";
import { SplashView } from "./components/SplashView";
import { ConfigModal } from "./components/ConfigModal";
import { playBtnClick, playObjectFound, playLevelCompleteSound, toggleMuteSilently, isAudioMuted } from "./utils/audio";
import homeBg from "../assets/allegati/Image-11.jpeg";
import btnImageLeft from "../assets/allegati/Image 18.png";
import btnImageRight from "../assets/allegati/Image 19.png";
import levelsBg from "../assets/allegati/Image-20.png";
import differencesBg from "../assets/allegati/Image-21.png";
import menuBtnIcon from "../assets/allegati/Progetto senza titolo (15).png";

// Initial set of template levels
const DEFAULT_BUILTIN_LEVEL: Level = {
  id: "builtin_house",
  name: "La Casetta Felice",
  creator: "Stile Cartoon",
  isCustom: false,
  objects: BUILT_IN_LEVEL_OBJECTS,
  hasCartoonAnimations: true,
  difficulty: "Medio",
};

export default function App() {
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [activeView, setActiveView] = useState<"splash" | "home" | "play" | "editor" | "levels" | "differences">("splash");
  const [currentLevelId, setCurrentLevelId] = useState<string>("builtin_house");
  const [foundObjectIds, setFoundObjectIds] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState(isAudioMuted());
  
  const [playerName, setPlayerName] = useState("Esploratore");
  const [playerAvatar, setPlayerAvatar] = useState("🕵️");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedTempAvatar, setSelectedTempAvatar] = useState("🕵️");
  const [gameLogo, setGameLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem("custom_game_logo");
    } catch {
      return null;
    }
  });
  
  // Audio/Visual FX states
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  
  // Timer States
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Top bar menu collapse & Confirm Exit states
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const menuTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to reset/start the auto-collapse timer (5 seconds)
  const resetMenuCollapseTimer = () => {
    setMenuCollapsed(false);
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    
    // Auto-collapse only if playing and level is not fully completed yet
    const isLevelCompleted = foundObjectIds.size === activeLevel?.objects?.length && activeLevel?.objects?.length > 0;
    if (activeView === "play" && !isLevelCompleted) {
      menuTimerRef.current = setTimeout(() => {
        setMenuCollapsed(true);
      }, 5000);
    }
  };

  // Reset/collapse setup
  useEffect(() => {
    if (activeView === "play") {
      resetMenuCollapseTimer();
    } else {
      if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
      setMenuCollapsed(false);
    }
    return () => {
      if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    };
  }, [activeView, currentLevelId]);

  // Handle auto-expansion on object found to show updated feedback
  useEffect(() => {
    if (activeView === "play" && foundObjectIds.size > 0) {
      resetMenuCollapseTimer();
    }
  }, [foundObjectIds.size]);

  // Instructional states
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeHintId, setActiveHintId] = useState<string | null>(null);

  // Visual highlight & hint loader states
  const [highlightedObjectId, setHighlightedObjectId] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [zoomedObject, setZoomedObject] = useState<{ emoji: string; x: number; y: number; id: string } | null>(null);

  // Auto-slide setup for hero section of homepage
  useEffect(() => {
    if (activeView !== "home") return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeView]);

  const hintLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hintDismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (hintLoadingTimeoutRef.current) clearTimeout(hintLoadingTimeoutRef.current);
      if (hintDismissTimeoutRef.current) clearTimeout(hintDismissTimeoutRef.current);
    };
  }, []);

  const handleTriggerVisualHint = () => {
    if (isHintLoading) return;
    
    // Find all not found objects
    const unfoundObjects = activeLevel.objects.filter((obj) => !foundObjectIds.has(obj.id));
    if (unfoundObjects.length === 0) return;
    
    playBtnClick();
    setIsHintLoading(true);
    setHighlightedObjectId(null);
    
    if (hintLoadingTimeoutRef.current) clearTimeout(hintLoadingTimeoutRef.current);
    if (hintDismissTimeoutRef.current) clearTimeout(hintDismissTimeoutRef.current);
    
    hintLoadingTimeoutRef.current = setTimeout(() => {
      setIsHintLoading(false);
      // Select a random object from the remaining unfound ones
      const randomObj = unfoundObjects[Math.floor(Math.random() * unfoundObjects.length)];
      setHighlightedObjectId(randomObj.id);
      
      // Auto-dismiss the highlight after 6 seconds
      hintDismissTimeoutRef.current = setTimeout(() => {
        setHighlightedObjectId(null);
      }, 6000);
    }, 1500); // 1.5 seconds wait
  };

  const handleToggleMute = () => {
    const nextMuted = toggleMuteSilently();
    setMuted(nextMuted);
    if (!nextMuted) {
      // play a cute click sound to confirm it's working
      playBtnClick();
    }
  };

  const handleSaveProfile = (name: string, avatar: string) => {
    const cleanName = name.trim() || "Esploratore";
    setPlayerName(cleanName);
    setPlayerAvatar(avatar);
    localStorage.setItem("cerca_e_trova_player_name", cleanName);
    localStorage.setItem("cerca_e_trova_player_avatar", avatar);
    setShowProfileModal(false);
    playBtnClick();
  };

  // Load levels configuration and profile on startup
  useEffect(() => {
    const saved = localStorage.getItem("cerca_e_trova_custom_levels");
    const parsedCustoms: Level[] = saved ? JSON.parse(saved) : [];
    
    // Combine built-in level template with custom ones stored locally
    setAllLevels([DEFAULT_BUILTIN_LEVEL, ...parsedCustoms]);

    const savedName = localStorage.getItem("cerca_e_trova_player_name");
    const savedAvatar = localStorage.getItem("cerca_e_trova_player_avatar");
    if (savedName) setPlayerName(savedName);
    if (savedAvatar) setPlayerAvatar(savedAvatar);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveView("home");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Timer side-effect clock tick (swivel counters)
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const activeLevel = allLevels.find((lvl) => lvl.id === currentLevelId) || DEFAULT_BUILTIN_LEVEL;

  // Format stopwatch timer (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize gameplay for a specific level
  const handleStartPlay = (levelId: string) => {
    playBtnClick();
    setCurrentLevelId(levelId);
    setFoundObjectIds(new Set());
    setElapsedTime(0);
    setActiveHintId(null);
    setParticles([]);
    setHighlightedObjectId(null);
    setZoomedObject(null);
    setIsHintLoading(false);
    if (hintLoadingTimeoutRef.current) clearTimeout(hintLoadingTimeoutRef.current);
    if (hintDismissTimeoutRef.current) clearTimeout(hintDismissTimeoutRef.current);
    setActiveView("play");
    setTimerActive(true);
  };

  const handleRestartLevel = () => {
    playBtnClick();
    setFoundObjectIds(new Set());
    setElapsedTime(0);
    setActiveHintId(null);
    setParticles([]);
    setHighlightedObjectId(null);
    setZoomedObject(null);
    setIsHintLoading(false);
    if (hintLoadingTimeoutRef.current) clearTimeout(hintLoadingTimeoutRef.current);
    if (hintDismissTimeoutRef.current) clearTimeout(hintDismissTimeoutRef.current);
    setTimerActive(true);
  };

  // Click handler on custom level canvas backgrounds
  const handleCustomObjectClick = (obj: HiddenObject) => {
    if (foundObjectIds.has(obj.id)) return;

    if (obj.id === highlightedObjectId) {
      setHighlightedObjectId(null);
    }

    // Trigger finding success!
    const updated = new Set(foundObjectIds);
    updated.add(obj.id);
    setFoundObjectIds(updated);

    // Set zoom animation trigger!
    setZoomedObject({
      id: obj.id,
      emoji: obj.emoji || "🔍",
      x: obj.x,
      y: obj.y
    });

    // Clear zoomed visual state after 900ms animation
    setTimeout(() => {
      setZoomedObject((prev) => prev?.id === obj.id ? null : prev);
    }, 900);

    // Save particle spark blast
    const newParticle: ClickParticle = {
      id: `p_${Date.now()}`,
      x: obj.x,
      y: obj.y,
      emoji: obj.emoji,
    };
    setParticles((prev) => [...prev, newParticle]);

    // Check level completion
    if (updated.size === activeLevel.objects.length) {
      setTimerActive(false); // Stop clock! Success
      playLevelCompleteSound();
      
      // Trigger a beautiful, layered explosion of celebratory particles
      const confettiEmojis = ["🎉", "✨", "🎈", "🥳", "🎊", "🌟", "🤩", "🍭", "🦄", "🌈", "💝"];
      const waves = [0, 300, 600]; // Multi-wave offsets in milliseconds
      const particlesPerWave = 8;

      waves.forEach((delay, waveIdx) => {
        setTimeout(() => {
          const newConfetti: ClickParticle[] = Array.from({ length: particlesPerWave }).map((_, i) => {
            const randomEmoji = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
            // Distribute widely across the active gameplay viewport (from 15% to 85%)
            const rx = 15 + Math.random() * 70;
            const ry = 15 + Math.random() * 70;
            return {
              id: `confetti_${waveIdx}_${i}_${Math.random()}`,
              x: rx,
              y: ry,
              emoji: randomEmoji,
            };
          });
          setParticles((prev) => [...prev, ...newConfetti]);
        }, delay);
      });
    } else {
      playObjectFound();
    }
  };

  const handleRemoveParticle = (id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  // Level Creator Save Callback
  const handleSaveCustomLevel = (newLevel: Level) => {
    const saved = localStorage.getItem("cerca_e_trova_custom_levels");
    const currentCustoms: Level[] = saved ? JSON.parse(saved) : [];
    
    const updatedCustoms = [newLevel, ...currentCustoms];
    try {
      localStorage.setItem("cerca_e_trova_custom_levels", JSON.stringify(updatedCustoms));
      setAllLevels([DEFAULT_BUILTIN_LEVEL, ...updatedCustoms]);
      setActiveView("home");
      // Instantly prompt to play your creation!
      handleStartPlay(newLevel.id);
    } catch (e: any) {
      console.error("Errore di quota localStorage:", e);
      if (e.name === "QuotaExceededError" || e.code === 22) {
        const wantToClear = confirm(
          "Lo spazio di archiviazione locale (localStorage) del browser è esaurito! Questo succede quando si caricano immagini di sfondo molto grandi.\n\nVuoi svuotare i tuoi livelli personalizzati precedenti per liberare spazio e salvare questo livello?"
        );
        if (wantToClear) {
          try {
            const singleCustom = [newLevel];
            localStorage.setItem("cerca_e_trova_custom_levels", JSON.stringify(singleCustom));
            setAllLevels([DEFAULT_BUILTIN_LEVEL, ...singleCustom]);
            setActiveView("home");
            handleStartPlay(newLevel.id);
          } catch (retryError) {
            alert(
              "Impossibile salvare il livello. L'immagine scelta è eccessivamente grande. Prova a utilizzare un'immagine leggermente più piccola!"
            );
          }
        }
      } else {
        alert("Si è verificato un errore durante il salvataggio: " + e.message);
      }
    }
  };

  // Delete custom created level helper
  const handleDeleteCustomLevel = (levelId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering play
    if (confirm("Sei sicuro di voler eliminare questo livello personalizzato dal tuo archivio?")) {
      const saved = localStorage.getItem("cerca_e_trova_custom_levels");
      const currentCustoms: Level[] = saved ? JSON.parse(saved) : [];
      
      const filtered = currentCustoms.filter((l) => l.id !== levelId);
      localStorage.setItem("cerca_e_trova_custom_levels", JSON.stringify(filtered));
      
      setAllLevels([DEFAULT_BUILTIN_LEVEL, ...filtered]);
      if (currentLevelId === levelId) {
        setCurrentLevelId("builtin_house");
      }
    }
  };

  // Dedicated Immersive Playroom View for professional fullscreen/frameless gameplay covering 1080x1920 layout
  if (activeView === "play") {
    return (
      <div className="fixed inset-0 bg-slate-950 text-slate-100 font-sans antialiased select-none overflow-hidden z-50 flex items-center justify-center p-0">
        
        {/* Dynamic Fonts Import in Header */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Courier+Prime:wght@700&display=swap');
          
          body {
            font-family: 'Montserrat', sans-serif;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
          
          @keyframes scaleUp {
            from { transform: scale(0.6); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

          @keyframes zoomAndSpin {
            0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; filter: drop-shadow(0 0 0px rgba(245,158,11,0)); }
            45% { transform: translate(-50%, -50%) scale(2.4); opacity: 1; filter: drop-shadow(0 0 20px rgba(245,158,11,0.95)); }
            100% { transform: translate(-50%, -50%) scale(3.8); opacity: 0; filter: drop-shadow(0 0 35px rgba(245,158,11,0)); }
          }
          .animate-zoomAndSpin { animation: zoomAndSpin 0.9s cubic-bezier(0.19, 1, 0.22, 1) forwards; }

          @keyframes attentionBounce {
            0%, 65%, 100% { transform: translateY(0); }
            70% { transform: translateY(-3%); }
            74% { transform: translateY(0); }
            78% { transform: translateY(-3%); }
            82% { transform: translateY(0); }
          }
          .animate-attentionBounce { animation: attentionBounce 6.0s infinite ease-in-out; }
        `}</style>

        {/* 1080x1920 (9:16) Device-Cabinet Frame spanning from the top edge to the bottom edge of the viewport */}
        <div className="relative h-screen w-full max-w-[56.25vh] mx-auto bg-slate-900 overflow-hidden flex flex-col justify-between shadow-3xl">
          
          {/* BACKDROP IMAGE / ANIMATION LAYER (absolute inset-0 z-0, covering 100% height from top of page to bottom of screen) */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
            {activeLevel.hasCartoonAnimations ? (
              <BuiltInLevel
                onObjectClick={(objId) => {
                  const obj = BUILT_IN_LEVEL_OBJECTS.find((o) => o.id === objId);
                  if (obj) handleCustomObjectClick(obj);
                }}
                foundObjectIds={foundObjectIds}
              />
            ) : (
              <div
                className="absolute inset-0 w-full h-full select-none"
                style={{
                  backgroundImage: `url("${activeLevel.backgroundImageUrl}")`,
                  backgroundSize: "100% 100%", // Fit portrait aspect perfectly for coordinate matching
                  backgroundPosition: "center",
                }}
              />
            )}
          </div>

          {/* ABSOLUTE INTERACTIVE hot spots for custom level items inside the same 1080x1920 frame */}
          {!activeLevel.hasCartoonAnimations && (
            <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
              {activeLevel.objects.map((obj) => {
                const isFound = foundObjectIds.has(obj.id);
                return (
                  <button
                    key={obj.id}
                    onClick={() => handleCustomObjectClick(obj)}
                    disabled={isFound}
                    className={`absolute flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer focus:outline-hidden
                      ${isFound 
                        ? "scale-0 rotate-[130deg] opacity-0 pointer-events-none" 
                        : "active:scale-95"}`}
                    style={{
                      left: `${obj.x}%`,
                      top: `${obj.y}%`,
                      width: `${obj.radius * 2}%`,
                      height: `${obj.radius * 2 * 1.33}%`, // Scale projection helper
                      transform: `translate(-50%, -50%)`,
                    }}
                  >
                    {obj.emoji ? (
                      <span
                        className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] select-none text-2xl sm:text-3xl"
                        style={{
                          transform: `scale(${obj.scale || 1}) rotate(${obj.rotation || 0}deg)`,
                          opacity: obj.opacity !== undefined ? obj.opacity : 1.0,
                          fontSize: "min(4.5vw, 42px)"
                        }}
                      >
                        {obj.emoji}
                      </span>
                    ) : (
                      <div className="w-full h-full rounded-full bg-transparent" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Particles overlay generator */}
          <div className="absolute inset-0 w-full h-full z-30 pointer-events-none overflow-hidden">
            <ParticleOverlay
              particles={particles}
              onComplete={handleRemoveParticle}
            />
          </div>

          {/* ZOOM POPPED OBJECT CLICK CONFIRMATION SUCCESS */}
          {zoomedObject && (
            <div
              className="absolute pointer-events-none z-40 flex items-center justify-center animate-zoomAndSpin"
              style={{
                left: `${zoomedObject.x}%`,
                top: `${zoomedObject.y}%`,
              }}
            >
              <span className="text-6xl sm:text-7xl filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] select-none">
                {zoomedObject.emoji}
              </span>
            </div>
          )}

          {/* PULSATING HIGHLIGHT GLOW */}
          {highlightedObjectId && (
            (() => {
              const highlightedObject = activeLevel.objects.find((obj) => obj.id === highlightedObjectId);
              if (!highlightedObject) return null;
              return (
                <div
                  className="absolute pointer-events-none z-30 flex items-center justify-center"
                  style={{
                    left: `${highlightedObject.x}%`,
                    top: `${highlightedObject.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: "60px",
                    height: "60px",
                  }}
                >
                  <span className="absolute inline-flex h-16 w-16 md:h-24 md:w-24 rounded-full bg-amber-400/40 animate-ping" />
                  <span className="absolute inline-flex h-12 w-12 md:h-16 md:w-16 rounded-full bg-amber-500/30 animate-pulse" />
                  
                  <span className="relative flex rounded-full h-8 w-8 md:h-12 md:w-12 bg-linear-to-tr from-amber-500 to-yellow-400 border-2 sm:border-3 border-white shadow-[0_0_15px_rgba(245,158,11,0.85)] items-center justify-center">
                    <span className="text-white text-xs sm:text-sm md:text-base font-black select-none animate-bounce">🔍</span>
                  </span>
                </div>
              );
            })()
          )}

          {/* FLOATING TOP MENU BAR OVER PLAYBOARD (SEMI-TRANSPARENT MINI ISLAND COATING) */}
          <div 
            onClick={() => {
              if (menuCollapsed) {
                playBtnClick();
                setMenuCollapsed(false);
                resetMenuCollapseTimer();
              }
            }}
            className={`absolute top-3 left-[17px] z-40 bg-slate-950/25 backdrop-blur-md border border-white/10 rounded-2xl flex items-center select-none shadow-lg transition-all duration-500 ease-in-out gap-2 p-1.5 ${
              menuCollapsed 
                ? "cursor-pointer right-auto" 
                : "right-[17px] justify-between"
            }`}
          >
            
            {/* Left Action: Arrow button */}
            <div className="flex items-center justify-center shrink-0 w-8 h-8">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent triggering parent onClick
                  playBtnClick();
                  if (menuCollapsed) {
                    setMenuCollapsed(false);
                    resetMenuCollapseTimer();
                  } else {
                    const isLevelCompleted = foundObjectIds.size === activeLevel.objects.length && activeLevel.objects.length > 0;
                    if (isLevelCompleted) {
                      setTimerActive(false);
                      setActiveView("home");
                    } else {
                      setShowExitConfirmModal(true);
                    }
                  }
                }}
                className="bg-white/10 hover:bg-white/20 text-white rounded-xl cursor-pointer transition-all active:scale-95 border border-white/10 shadow-xs flex items-center justify-center w-8 h-8"
                title={menuCollapsed ? "Espandi" : "Torna alla Home / Comprimi"}
              >
                <ChevronLeft className={`w-4 h-4 shrink-0 transition-transform duration-500 ${menuCollapsed ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Center: Timer & Targets beautifully nested - always visible and fixed */}
            <div className="flex items-center gap-2 bg-slate-950/25 border border-white/10 px-3 py-1.5 rounded-full shadow-inner shrink-0">
              <div className="flex items-center gap-1 font-mono text-[11px] sm:text-xs font-black text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] shrink-0">
                <Clock className="w-3.5 h-3.5 animate-pulse text-indigo-300" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
              <div className="h-3 w-[1px] bg-white/20" />
              <div className="text-[11px] sm:text-xs font-extrabold text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] flex items-center gap-1 shrink-0">
                <span>🎯</span>
                <span>{foundObjectIds.size}/{activeLevel.objects.length}</span>
              </div>
            </div>

            {/* Right Action Widgets - Collapsible layout */}
            <div className={`flex items-center gap-1.5 shrink-0 transition-all duration-500 ${
              menuCollapsed 
                ? "w-0 opacity-0 pointer-events-none scale-75 overflow-hidden ml-0" 
                : "w-auto opacity-100 scale-100 ml-2"
            }`}
              onClick={(e) => {
                // If expanded, clicking internal elements shouldn't bubble collapse/toggle
                e.stopPropagation();
              }}
            >
              {/* Reset level */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetMenuCollapseTimer();
                  handleRestartLevel();
                }}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer active:scale-95 border border-white/10"
                title="Reset livello"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Mute controller */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetMenuCollapseTimer();
                  handleToggleMute();
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  muted 
                    ? "border-rose-500/30 bg-rose-500/20 text-rose-300 hover:bg-rose-500/35"
                    : "border-white/10 bg-white/10 hover:bg-white/20 text-white"
                }`}
                title={muted ? "Riattiva audio" : "Disattiva audio"}
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Floating Empty div to push main list down */}
          <div className="h-16 pointer-events-none" />

          {/* BOTTOM GAME LIST PANEL (slides on top of backdrop) inside the portrait viewport */}
          <div className="w-full z-40 px-3 pb-4 pointer-events-auto">
            <GameUI
              level={activeLevel}
              foundObjectIds={foundObjectIds}
              elapsedTime={elapsedTime}
              onRestart={handleRestartLevel}
              onSelectLevel={handleStartPlay}
              onGoToEditor={() => {
                setTimerActive(false);
                setActiveView("editor");
              }}
              allLevels={allLevels}
              activeHintId={activeHintId}
              setActiveHintId={setActiveHintId}
              onTriggerVisualHint={handleTriggerVisualHint}
              isHintLoading={isHintLoading}
            />
          </div>

        </div>

        {/* INSTRUCTION DETAIL IN-GAME OVERLAY MODAL */}
        {showInstructions && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
              <InstructionModal onClose={() => setShowInstructions(false)} />
            </div>
          </div>
        )}

        {/* GAME EXIT CONFIRMATION MODAL OVERLAY */}
        {showExitConfirmModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950/80 backdrop-blur-xl border border-white/20 rounded-2xl p-5 max-w-[280px] w-full shadow-2xl relative animate-scaleUp text-white text-center">
              
              <div className="mb-4 flex flex-col items-center">
                <span className="text-xl mb-1 select-none">⚠️</span>
                <h3 className="text-base font-black text-white tracking-tight leading-none mb-1">
                  Uscire dalla partita?
                </h3>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  Perderai i tuoi progressi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playBtnClick();
                    setShowExitConfirmModal(false);
                  }}
                  className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/15 text-white rounded-xl cursor-pointer font-bold tracking-wide transition-all active:scale-95 border border-white/10 text-xs uppercase"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    playBtnClick();
                    setShowExitConfirmModal(false);
                    setTimerActive(false);
                    setActiveView("home");
                  }}
                  className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-505 text-white rounded-xl cursor-pointer font-black tracking-wide transition-all active:scale-95 border border-rose-500 text-xs uppercase shadow-md shadow-rose-600/10"
                >
                  Esci
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REGISTRATION GAME PROFILE MODAL OVERLAY */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border-4 border-slate-900 p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scaleUp text-slate-800">
              
              <button
                onClick={() => {
                  playBtnClick();
                  setShowProfileModal(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <span className="text-4xl inline-block mb-2 animate-bounce">🕵️‍♂️</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  Registrazione Profilo
                </h3>
                <p className="text-xs text-slate-400 font-medium font-sans">
                  Scegli il tuo nome giuria e il tuo avatar personalizzato
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const nickname = formData.get("nickname") as string;
                  handleSaveProfile(nickname, selectedTempAvatar);
                }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                    Nome Giocatore
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    required
                    defaultValue={playerName}
                    maxLength={16}
                    placeholder="E.g. Massimo font-bold"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 focus:outline-hidden font-bold text-slate-800 text-sm transition-all shadow-inner placeholder:font-medium bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 pl-1">
                    Seleziona un Avatar ({selectedTempAvatar})
                  </label>
                  <div className="grid grid-cols-5 gap-2.5">
                    {["🕵️", "🐱", "🚀", "🎮", "🦄", "🦊", "🐼", "🤖", "🦖", "🌟"].map((emoji) => {
                      const isSelected = selectedTempAvatar === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            playBtnClick();
                            setSelectedTempAvatar(emoji);
                          }}
                          className={`text-2xl h-12 w-full flex items-center justify-center rounded-2xl transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-50/70 border-3 border-indigo-600 scale-110 shadow-md shadow-indigo-100"
                              : "bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:scale-105"
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-155 transition-all text-center cursor-pointer active:scale-[0.98]"
                  >
                    Salva Profilo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

   if (activeView === "splash") {
    return <SplashView onEnter={() => setActiveView("home")} />;
  }

  return (
    <div className={`min-h-screen text-slate-800 font-sans antialiased SelectionColor selection:bg-indigo-500/10 transition-colors duration-300 ${(activeView === "home" || activeView === "levels" || activeView === "differences") ? "h-screen overflow-hidden bg-slate-950" : "bg-slate-50 pb-16"}`}>
      
      {/* Dynamic Fonts Import in Header */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Courier+Prime:wght@700&display=swap');
        
        body {
          font-family: 'Montserrat', sans-serif;
        }
        
        /* Keyframe for simple fade in utilities */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        
        @keyframes scaleUp {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

        @keyframes zoomAndSpin {
          0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; filter: drop-shadow(0 0 0px rgba(245,158,11,0)); }
          45% { transform: translate(-50%, -50%) scale(2.4); opacity: 1; filter: drop-shadow(0 0 20px rgba(245,158,11,0.95)); }
          100% { transform: translate(-50%, -50%) scale(3.8); opacity: 0; filter: drop-shadow(0 0 35px rgba(245,158,11,0)); }
        }
        .animate-zoomAndSpin { animation: zoomAndSpin 0.9s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
 
      {/* --- SITE NAVIGATION TOP HEADER (SEMI-TRASPARENTE E ADATTIVO LATO UTENTE) --- */}
      {activeView !== "home" && activeView !== "levels" && activeView !== "differences" && (
        <header className="sticky top-0 bg-white/75 backdrop-blur-md border-b border-slate-100 px-4 py-3 md:px-8 text-slate-800 shadow-xs z-45 transition-all duration-300 w-full">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <button
            onClick={() => {
              playBtnClick();
              setTimerActive(false);
              setActiveView("home");
            }}
            className="flex items-center gap-2 group cursor-pointer text-left focus:outline-hidden"
          >
            {gameLogo ? (
              <img
                src={gameLogo}
                alt="Logo Chi Cerca Trova"
                referrerPolicy="no-referrer"
                className="w-11 h-11 object-contain rounded-full shadow-lg border-2 border-amber-500/40 group-hover:scale-110 transition-all shrink-0 bg-slate-950/40"
              />
            ) : (
              <div className={`p-2.5 rounded-2xl shadow-md group-hover:scale-110 transition-all shrink-0 ${
                activeView === "home" 
                  ? "bg-white/10 text-white border border-white/20 backdrop-blur-md" 
                  : "bg-indigo-600 text-white"
              }`}>
                <Gamepad2 className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className={`text-lg font-black tracking-tight block ${
                activeView === "home" ? "text-white" : "bg-linear-to-r from-slate-900 via-indigo-950 to-indigo-600 bg-clip-text text-transparent"
              }`}>
                Chi cerca trova
              </span>
              <span className={`block text-[9px] font-extrabold uppercase tracking-wider leading-none ${
                activeView === "home" ? "text-indigo-200/90" : "text-slate-400"
              }`}>
                Cerca & Trova gli Oggetti
              </span>
            </div>
          </button>

          {activeView === "play" ? (
            /* --- DETAGLIO LATO UTENTE IN-GAMEPLAY CELL-GRID --- */
            <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
              
              {/* CELL 1: LIVE LEVEL INDICATOR */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 shadow-xs px-3 py-1.5 rounded-xl">
                <span className="text-xs">🗺️</span>
                <div className="text-left leading-none">
                  <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">
                    Livello
                  </span>
                  <span className="text-[11px] font-black text-slate-800 max-w-[110px] truncate block">
                    {activeLevel.name}
                  </span>
                </div>
              </div>

              {/* CELL 2: ELAPSED PLAYTIME STOPWATCH */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 shadow-xs px-3 py-1.5 rounded-xl min-w-[76px]">
                <Clock className="w-3.5 h-3.5 text-indigo-505 shrink-0 animate-pulse" />
                <div className="text-left font-mono leading-none">
                  <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">
                    Tempo
                  </span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {formatTime(elapsedTime)}
                  </span>
                </div>
              </div>

              {/* CELL 3: RUNNING SCORE RATIO (FOUND/TOTAL) */}
              <div className="flex items-center gap-1.5 bg-indigo-50/50 border border-indigo-105 shadow-xs px-3 py-1.5 rounded-xl">
                <span className="text-xs">🎯</span>
                <div className="text-left font-sans leading-none">
                  <span className="block text-[8px] text-indigo-400 font-extrabold uppercase tracking-widest mb-0.5">
                    Trovati
                  </span>
                  <span className="text-xs font-black text-indigo-700 block">
                    {foundObjectIds.size} / {activeLevel.objects.length}
                  </span>
                </div>
              </div>

              {/* CELL 4: RESTART LEVEL BUTTON */}
              <button
                onClick={handleRestartLevel}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/80 hover:text-indigo-600 text-slate-550 font-bold text-xs cursor-pointer transition-all active:scale-95 shadow-xs"
                title="Ricomincia il livello"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Reset</span>
              </button>

              {/* CELL 5: USER PROFILE REGISTRATION STATUS BUTTON */}
              <button
                onClick={() => {
                  setSelectedTempAvatar(playerAvatar);
                  setShowProfileModal(true);
                  playBtnClick();
                }}
                className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-250 hover:bg-emerald-100/60 shadow-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:scale-[1.02] text-left"
                title="Modifica profilo giocatore"
              >
                <span className="text-sm shrink-0">{playerAvatar}</span>
                <div className="text-left leading-none">
                  <span className="block text-[8px] text-emerald-500 font-extrabold uppercase tracking-widest mb-0.5">
                    Profilo
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 truncate block max-w-[85px]">
                    {playerName}
                  </span>
                </div>
              </button>

              <button
                onClick={handleToggleMute}
                className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                  muted 
                    ? "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100/70" 
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                title={muted ? "Riattiva audio" : "Disattiva audio"}
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* CELL 6: ESCI / USCITA */}
              <button
                onClick={() => {
                  playBtnClick();
                  setTimerActive(false);
                  setActiveView("home");
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-slate-900/10 active:scale-95"
                title="Torna alla Home"
              >
                <X className="w-3.5 h-3.5" />
                <span>Uscita</span>
              </button>

            </div>
          ) : (
            /* --- DEFAULT LOBBY (HOME/EDITOR) VIEW HEADER MENU - MINIMALIST ICON-CENTRIC --- */
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedTempAvatar(playerAvatar);
                  setShowProfileModal(true);
                  playBtnClick();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl cursor-pointer transition-all text-xs font-black
                  ${activeView === "home" 
                    ? "border-white/10 bg-white/10 hover:bg-white/20 text-white shadow-xs" 
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-750"}`}
                title={`Profilo Giocatore: ${playerName}`}
              >
                <span className="text-sm shrink-0">{playerAvatar}</span>
                <span className="hidden sm:inline truncate max-w-[95px]">{playerName}</span>
              </button>

              <button
                onClick={handleToggleMute}
                className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                  muted 
                    ? "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100/70" 
                    : activeView === "home"
                    ? "border-white/10 bg-white/10 hover:bg-white/20 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                title={muted ? "Riattiva audio" : "Disattiva audio"}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  playBtnClick();
                  setShowInstructions(true);
                }}
                className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                  activeView === "home" 
                    ? "border-white/10 bg-white/10 hover:bg-white/20 text-white" 
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                title="Istruzioni di gioco"
              >
                <Info className="w-4 h-4" />
              </button>

              {activeView === "home" ? (
                <button
                  onClick={() => {
                    playBtnClick();
                    setShowConfigModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-amber-500 hover:text-slate-950 bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                  title="Configurazione Protetta"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Configura</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    playBtnClick();
                    setTimerActive(false);
                    setActiveView("home");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-705 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Menu principale"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline font-black">Home</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      )}

      {/* --- INSTRUCTIONS MODAL (Overlay) --- */}
      {showInstructions && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
          <div className="max-w-2xl w-full">
            <InstructionModal onClose={() => setShowInstructions(false)} />
          </div>
        </div>
      )}

      {/* --- CONFIGURATION MODAL WITH CODED SHIELD ACCESS --- */}
      <ConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onOpenEditor={() => setActiveView("editor")}
        onTriggerSplash={() => setActiveView("splash")}
        customGameLogo={gameLogo}
        onLogoChange={setGameLogo}
      />

      {/* --- REGISTRAZIONE PROFILO MODAL (Overlay) --- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-slate-900 p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scaleUp">
            
            <button
              onClick={() => {
                playBtnClick();
                setShowProfileModal(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-4xl inline-block mb-2 animate-bounce">🕵️‍♂️</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                Registrazione Profilo
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Scegli il tuo nome giuria e il tuo avatar personalizzato
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const nickname = formData.get("nickname") as string;
                handleSaveProfile(nickname, selectedTempAvatar);
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                  Nome Giocatore
                </label>
                <input
                  type="text"
                  name="nickname"
                  required
                  defaultValue={playerName}
                  maxLength={16}
                  placeholder="E.g. Massimo"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 focus:outline-hidden font-bold text-slate-800 text-sm transition-all shadow-inner placeholder:font-medium bg-slate-50/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 pl-1">
                  Seleziona un Avatar ({selectedTempAvatar})
                </label>
                <div className="grid grid-cols-5 gap-2.5">
                  {["🕵️", "🐱", "🚀", "🎮", "🦄", "🦊", "🐼", "🤖", "🦖", "🌟"].map((emoji) => {
                    const isSelected = selectedTempAvatar === emoji;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          playBtnClick();
                          setSelectedTempAvatar(emoji);
                        }}
                        className={`text-2xl h-12 w-full flex items-center justify-center rounded-2xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50 border-3 border-indigo-600 scale-110 shadow-md shadow-indigo-100"
                            : "bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:scale-105"
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-155 transition-all text-center cursor-pointer active:scale-[0.98]"
                >
                  Salva Profilo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MAIN WORKSPACE VIEW ROUTER --- */}
      <main className={`animate-fadeIn ${activeView === "home" ? "mt-0" : "mt-4"}`}>
        {/* VIEW 1: HOME DASHBOARD / LEVEL SELECTOR */}
        {activeView === "home" && (
          <div className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden flex items-center justify-center p-0 z-0">
            {/* 1080x1290 Centered Frame */}
            <div className="relative h-screen w-full max-w-[83.72vh] mx-auto bg-slate-900 overflow-hidden flex flex-col justify-center items-center shadow-3xl">
              {/* CABINET FLOATING HEADER */}
              <div className="absolute top-4 right-4 z-20 pointer-events-auto flex items-center gap-2">
                {/* Mute Button */}
                <button
                  onClick={handleToggleMute}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    muted 
                      ? "border-rose-500/30 bg-rose-500/20 text-rose-300 hover:bg-rose-500/35"
                      : "border-white/10 bg-white/10 hover:bg-white/20 text-white"
                  }`}
                  title={muted ? "Riattiva audio" : "Disattiva audio"}
                >
                  {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {/* Settings / Gear Button */}
                <button
                  onClick={() => {
                    playBtnClick();
                    setActiveView("editor");
                  }}
                  className="p-2 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center justify-center"
                  title="Composizione Livelli"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Full-bleed background Image-11 */}
              <img 
                src={homeBg}
                alt="Sfondo"
                className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-1000 scale-105"
                style={{ objectPosition: "center top" }}
              />

              {/* FLOATING ACTION BUTTONS */}
              <div 
                className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-[150px] w-full flex justify-between items-center px-8 max-w-[760px] z-10 pointer-events-auto"
              >
                {/* Left Button Container */}
                <div 
                  onClick={() => {
                    playBtnClick();
                    setActiveView("levels");
                  }}
                  className="relative flex flex-col items-center group cursor-pointer pb-6 max-w-[45%]"
                >
                  {/* Image */}
                  <img
                    src={btnImageLeft}
                    alt="Image 18"
                    className="w-[360px] h-[360px] object-contain transition-all duration-300 transform group-hover:-translate-y-2 group-active:scale-90 group-active:translate-y-1 z-10"
                    title="Image 18"
                  />
                  {/* Oval Shadow */}
                  <div 
                    className="absolute bottom-[54px] left-1/2 -translate-x-1/2 w-[130px] max-w-[40%] h-1.5 bg-black rounded-full blur-[6px] transition-all duration-300 transform group-hover:scale-75 group-hover:opacity-90 group-active:scale-50 group-active:opacity-70 z-0"
                  />
                </div>

                {/* Right Button Container */}
                <div 
                  onClick={() => {
                    playBtnClick();
                    setActiveView("differences");
                  }}
                  className="relative flex flex-col items-center group cursor-pointer pb-6 relative top-[5px] max-w-[45%]"
                >
                  {/* Image */}
                  <img
                    src={btnImageRight}
                    alt="Image 19"
                    className="w-[352px] h-[352px] object-contain transition-all duration-300 transform group-hover:-translate-y-2 group-active:scale-90 group-active:translate-y-1 z-10"
                    title="Image 19"
                  />
                  {/* Oval Shadow */}
                  <div 
                    className="absolute bottom-[54px] left-1/2 -translate-x-1/2 w-[120px] max-w-[38%] h-1.5 bg-black rounded-full blur-[6px] transition-all duration-300 transform group-hover:scale-75 group-hover:opacity-90 group-active:scale-50 group-active:opacity-70 z-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 1.5: LEVELS LIST SELECTION VIEW (Trova gli Oggetti) */}
        {activeView === "levels" && (
          <div className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden flex items-center justify-center p-0 z-0">
            {/* 1080x1290 Centered Frame */}
            <div className="relative h-screen w-full max-w-[83.72vh] mx-auto bg-[#1f1610] overflow-hidden flex flex-col shadow-3xl">
              
              {/* Scrollable Container with Hidden Scrollbar */}
              <div className="w-full h-full overflow-y-auto scrollbar-none touch-pan-y relative flex flex-col">
                
                {/* Menu Button Top Left (Scrolls with page) */}
                <div className="absolute top-4 left-4 z-20 pointer-events-auto">
                  <img 
                    src={menuBtnIcon} 
                    alt="Menu" 
                    onClick={() => {
                      playBtnClick();
                      setActiveView("home");
                    }}
                    className="w-16 h-16 object-cover cursor-pointer hover:scale-105 active:scale-95 transition-all filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                    title="Torna alla Home"
                  />
                </div>

                {/* Fixed-at-top Image-20 with 1080x1920 aspect ratio */}
                <div className="w-full aspect-[1080/1920] shrink-0 relative">
                  <img
                    src={levelsBg}
                    alt="Livelli Sfondo"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                </div>

                {/* Custom Levels List in a Frame */}
                <div className="w-full px-6 pb-24 flex flex-col items-center gap-4 mt-6 z-10 relative">
                  <h3 className="text-amber-400 font-extrabold text-lg uppercase tracking-wider mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Modelli dei Livelli
                  </h3>
                  
                  {allLevels.filter(lvl => !lvl.gameMode || lvl.gameMode === "objects").length === 0 ? (
                    <div className="w-full max-w-[420px] p-8 border-2 border-dashed border-white/20 rounded-3xl bg-black/45 text-center text-white/50 text-xs">
                      Nessun livello personalizzato in questa sezione.
                      <p className="mt-2 text-[10px] text-amber-300 font-medium">
                        Usa l'ingranaggio in Home per creare un nuovo livello!
                      </p>
                    </div>
                  ) : (
                    <div className="w-full max-w-[420px] grid grid-cols-1 gap-4">
                      {allLevels.filter(lvl => !lvl.gameMode || lvl.gameMode === "objects").map((lvl) => (
                        <div 
                          key={lvl.id}
                          onClick={() => handleStartPlay(lvl.id)}
                          className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/50 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer shadow-xl group bg-slate-900"
                        >
                          {lvl.backgroundImageUrl ? (
                            <img
                              src={lvl.backgroundImageUrl}
                              alt={lvl.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-white/40 text-xs">
                              Senza Immagine
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 flex flex-col justify-end p-4">
                            <h4 className="text-white font-black text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
                              {lvl.name}
                            </h4>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[10px] font-bold text-amber-300 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)]">
                                Di: {lvl.creator}
                              </span>
                              <span className="px-2 py-0.5 bg-black/40 rounded-full text-[9px] font-black uppercase text-indigo-300 border border-white/15">
                                {lvl.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* VIEW 1.6: LEVELS LIST SELECTION VIEW (Trova le Differenze) */}
        {activeView === "differences" && (
          <div className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden flex items-center justify-center p-0 z-0">
            {/* 1080x1290 Centered Frame */}
            <div className="relative h-screen w-full max-w-[83.72vh] mx-auto bg-[#1f1610] overflow-hidden flex flex-col shadow-3xl">
              
              {/* Scrollable Container with Hidden Scrollbar */}
              <div className="w-full h-full overflow-y-auto scrollbar-none touch-pan-y relative flex flex-col">
                
                {/* Menu Button Top Left (Scrolls with page) */}
                <div className="absolute top-4 left-4 z-20 pointer-events-auto">
                  <img 
                    src={menuBtnIcon} 
                    alt="Menu" 
                    onClick={() => {
                      playBtnClick();
                      setActiveView("home");
                    }}
                    className="w-16 h-16 object-cover cursor-pointer hover:scale-105 active:scale-95 transition-all filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                    title="Torna alla Home"
                  />
                </div>

                {/* Fixed-at-top Image-21 with 1080x1920 aspect ratio */}
                <div className="w-full aspect-[1080/1920] shrink-0 relative">
                  <img
                    src={differencesBg}
                    alt="Livelli Sfondo"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                </div>

                {/* Custom Levels List in a Frame */}
                <div className="w-full px-6 pb-24 flex flex-col items-center gap-4 mt-6 z-10 relative">
                  <h3 className="text-amber-400 font-extrabold text-lg uppercase tracking-wider mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Modelli dei Livelli
                  </h3>
                  
                  {allLevels.filter(lvl => lvl.gameMode === "differences").length === 0 ? (
                    <div className="w-full max-w-[420px] p-8 border-2 border-dashed border-white/20 rounded-3xl bg-black/45 text-center text-white/50 text-xs">
                      Nessun livello personalizzato in questa sezione.
                      <p className="mt-2 text-[10px] text-amber-300 font-medium">
                        Usa l'ingranaggio in Home per creare un nuovo livello!
                      </p>
                    </div>
                  ) : (
                    <div className="w-full max-w-[420px] grid grid-cols-1 gap-4">
                      {allLevels.filter(lvl => lvl.gameMode === "differences").map((lvl) => (
                        <div 
                          key={lvl.id}
                          onClick={() => handleStartPlay(lvl.id)}
                          className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/50 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer shadow-xl group bg-slate-900"
                        >
                          {lvl.backgroundImageUrl ? (
                            <img
                              src={lvl.backgroundImageUrl}
                              alt={lvl.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-white/40 text-xs">
                              Senza Immagine
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 flex flex-col justify-end p-4">
                            <h4 className="text-white font-black text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
                              {lvl.name}
                            </h4>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[10px] font-bold text-amber-300 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)]">
                                Di: {lvl.creator}
                              </span>
                              <span className="px-2 py-0.5 bg-black/40 rounded-full text-[9px] font-black uppercase text-indigo-300 border border-white/15">
                                {lvl.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: MAP GAMEPLAY ENTRANCE handled in the dedicated fast-path early-return block */}

        {/* VIEW 3: COMPREHENSIVE LEVEL EDITOR */}
        {activeView === "editor" && (
          <EditorView
            onSaveLevel={handleSaveCustomLevel}
            onCancel={() => setActiveView("home")}
            onPlayLevel={handleStartPlay}
          />
        )}
      </main>
    </div>
  );
}
