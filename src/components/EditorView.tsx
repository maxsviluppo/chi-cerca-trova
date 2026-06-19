import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash, Save, Play, Image as ImageIcon, ArrowLeft, ZoomIn, Eye, Sparkles, HelpCircle } from "lucide-react";
import { Level, HiddenObject } from "../types";

interface EditorViewProps {
  initialLevel?: Level | null;
  onSaveLevel: (level: Level) => void;
  onCancel: () => void;
  onPlayLevel: (level: Level) => void;
}

// Preset background options for standard levels if users don't upload one
const PRESET_BACKGROUNDS = [
  {
    name: "Cameretta delle Fiabe",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop",
    description: "Una stanza magica piena di giocattoli e colori vivaci.",
  },
  {
    name: "Giardino Incantato",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop",
    description: "Una foresta verdeggiante con raggi solari filtranti.",
  },
  {
    name: "Fondale Marino",
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
    description: "Barriera corallina misteriosa con riflessi blu marini.",
  },
  {
    name: "Città Cyberpunk",
    url: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1200&auto=format&fit=crop",
    description: "Vie future e cariche di neon luminosi e ombre profonde.",
  }
];

const POPULAR_STICKER_EMOJIS = [
  "🗝️", "🔑", "⭐", "🐱", "🐶", "🐰", "🦊", "🍏", "🍎", "🍓", "🍒", "🍄", "🍀", "💎", 
  "🏆", "🧸", "🎈", "🕶️", "🎒", "👒", "👑", "🕷️", "🐛", "🦋", "🐝", "🐠", "🦀", "🐙",
  "🧭", "🍕", "🍩", "🍪", "🍭", "🍫", "🔋", "🍿", "🧪", "🔮", "🪄", "🕯️", "🎨", "⚽"
];

export const EditorView: React.FC<EditorViewProps> = ({
  initialLevel,
  onSaveLevel,
  onCancel,
  onPlayLevel,
}) => {
  const [levelName, setLevelName] = useState(initialLevel ? initialLevel.name : "Il mio super livello!");
  const [creatorName, setCreatorName] = useState(initialLevel ? initialLevel.creator : "Esploratore");
  const [difficulty, setDifficulty] = useState<"Facile" | "Medio" | "Difficile">(initialLevel ? initialLevel.difficulty : "Medio");
  const [gameMode, setGameMode] = useState<"objects" | "differences">(initialLevel ? initialLevel.gameMode || "objects" : "objects");
  const [selectedBgUrl, setSelectedBgUrl] = useState(initialLevel ? initialLevel.backgroundImageUrl : PRESET_BACKGROUNDS[0].url);
  const [customBgFile, setCustomBgFile] = useState<string | null>(initialLevel && !PRESET_BACKGROUNDS.some(p => p.url === initialLevel.backgroundImageUrl) ? initialLevel.backgroundImageUrl : null);
  const [objects, setObjects] = useState<HiddenObject[]>(initialLevel ? initialLevel.objects : []);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const [draggingObjectId, setDraggingObjectId] = useState<string | null>(null);

  // Form states for creating/editing an object
  const [editingName, setEditingName] = useState("");
  const [editingEmoji, setEditingEmoji] = useState("🔑");
  const [editingRadius, setEditingRadius] = useState(5); // In percent
  const [editingScale, setEditingScale] = useState(1);
  const [editingRotation, setEditingRotation] = useState(0);
  const [editingOpacity, setEditingOpacity] = useState(1.0);
  const [editingHint, setEditingHint] = useState("");
  const [isStickerMode, setIsStickerMode] = useState(true);
  const [stickerEmojis, setStickerEmojis] = useState<string[]>(POPULAR_STICKER_EMOJIS);

  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const res = await fetch("/api/assets");
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            const emojis = list.map((item: any) => typeof item === "string" ? item : item.emoji);
            if (emojis.length > 0) {
              setStickerEmojis(emojis);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching stickers from DB:", err);
      }
    };
    fetchStickers();
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state when selected object changes
  useEffect(() => {
    if (selectedObjectId) {
      const activeObj = objects.find((o) => o.id === selectedObjectId);
      if (activeObj) {
        setEditingName(activeObj.name);
        setEditingEmoji(activeObj.emoji || "🔑");
        setEditingRadius(activeObj.radius);
        setEditingScale(activeObj.scale || 1);
        setEditingRotation(activeObj.rotation || 0);
        setEditingOpacity(activeObj.opacity !== undefined ? activeObj.opacity : 1.0);
        setEditingHint(activeObj.hint || "");
        setIsStickerMode(!!activeObj.emoji);
      }
    }
  }, [selectedObjectId]);

  const mouseDownTimeRef = useRef<number>(0);
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleObjectMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedObjectId(id);
    setDraggingObjectId(id);
  };

  const handleObjectTouchStart = (id: string, e: React.TouchEvent) => {
    e.stopPropagation();
    setSelectedObjectId(id);
    setDraggingObjectId(id);
  };

  const updateDraggedPosition = (clientX: number, clientY: number) => {
    if (!draggingObjectId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const pctX = Math.max(0, Math.min(100, parseFloat(((x / rect.width) * 100).toFixed(1))));
    const pctY = Math.max(0, Math.min(100, parseFloat(((y / rect.height) * 100).toFixed(1))));

    setObjects((prev) =>
      prev.map((o) => (o.id === draggingObjectId ? { ...o, x: pctX, y: pctY } : o))
    );
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingObjectId) {
      updateDraggedPosition(e.clientX, e.clientY);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (draggingObjectId && e.touches.length > 0) {
      updateDraggedPosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownTimeRef.current = Date.now();
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      mouseDownTimeRef.current = Date.now();
      mouseDownPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingObjectId) {
      setDraggingObjectId(null);
      return;
    }

    if (mouseDownPosRef.current) {
      const elapsed = Date.now() - mouseDownTimeRef.current;
      const dist = Math.hypot(
        e.clientX - mouseDownPosRef.current.x,
        e.clientY - mouseDownPosRef.current.y
      );

      // Threshold: click duration < 250ms and moved distance < 6px
      if (elapsed < 250 && dist < 6) {
        triggerCanvasPlacement(e.clientX, e.clientY);
      }
    }
    mouseDownPosRef.current = null;
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (draggingObjectId) {
      setDraggingObjectId(null);
      return;
    }

    if (mouseDownPosRef.current && e.changedTouches.length > 0) {
      const elapsed = Date.now() - mouseDownTimeRef.current;
      const dist = Math.hypot(
        e.changedTouches[0].clientX - mouseDownPosRef.current.x,
        e.changedTouches[0].clientY - mouseDownPosRef.current.y
      );

      if (elapsed < 250 && dist < 6) {
        triggerCanvasPlacement(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }
    mouseDownPosRef.current = null;
  };

  const triggerCanvasPlacement = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const pctX = parseFloat(((clickX / rect.width) * 100).toFixed(1));
    const pctY = parseFloat(((clickY / rect.height) * 100).toFixed(1));

    const newId = `obj_${Date.now()}`;
    const newObj: HiddenObject = {
      id: newId,
      name: `Oggetto ${objects.length + 1}`,
      x: pctX,
      y: pctY,
      radius: 5,
      emoji: "🔑",
      scale: 1,
      rotation: 0,
      opacity: 1,
      hint: "Vicino all'elemento contrassegnato.",
    };
    setObjects((prev) => [...prev, newObj]);
    setSelectedObjectId(newId);
  };

  // Update object property changes
  const updateActiveObject = (updates: Partial<HiddenObject>) => {
    if (!selectedObjectId) return;
    setObjects((prev) =>
      prev.map((o) => (o.id === selectedObjectId ? { ...o, ...updates } : o))
    );
  };

  const handleDeleteObject = (id: string) => {
    setObjects((prev) => prev.filter((o) => o.id !== id));
    if (selectedObjectId === id) {
      setSelectedObjectId(null);
    }
  };

  // Compression utility to scale down custom images so they don't exceed localStorage limits (QuotaExceededError)
  const compressImage = (base64Url: string, callback: (resizedUrl: string) => void) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 800; // Optimal for web display & extremely lightweight
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG with 0.7 quality to keep it extremely light (~40-80kb)
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        callback(compressed);
      } else {
        callback(base64Url);
      }
    };
    img.onerror = () => {
      callback(base64Url);
    };
    img.src = base64Url;
  };

  // File system upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Url = event.target.result as string;
          compressImage(base64Url, (compressedUrl) => {
            setCustomBgFile(compressedUrl);
            setSelectedBgUrl(compressedUrl);
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop events
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Url = event.target.result as string;
          compressImage(base64Url, (compressedUrl) => {
            setCustomBgFile(compressedUrl);
            setSelectedBgUrl(compressedUrl);
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (objects.length === 0) {
      alert("Aggiungi almeno un oggetto da trovare prima di salvare il livello!");
      return;
    }

    const newLevel: Level = {
      id: initialLevel ? initialLevel.id : `custom_${Date.now()}`,
      name: levelName || "Livello Creativo",
      creator: creatorName || "Anonimo",
      isCustom: true,
      backgroundImageUrl: selectedBgUrl,
      objects: objects,
      difficulty: difficulty,
      gameMode: gameMode,
    };

    onSaveLevel(newLevel);
  };

  const backgroundSource = selectedBgUrl;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Top action row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla Home
          </button>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
            Editore di Livelli Cerca-e-Trova
          </h1>
          <p className="text-slate-500 text-sm">
            Crea la tua partita posizionando sticker o aree sensibili su qualsiasi immagine caricata.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={handleSave}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-5 h-5" />
            Salva Livello
          </button>
        </div>
      </div>

      {/* Editor Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Controls and Image Selection (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Level Info Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">
              ⚙️ Opzioni Livello
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Nome del livello
              </label>
              <input
                type="text"
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                maxLength={30}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-hidden text-sm font-medium"
                placeholder="Inserisci un titolo invitante..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Il Tuo Nome (Autore)
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-hidden text-sm"
                placeholder="Firma il tuo gioco..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Difficoltà stimata
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Facile", "Medio", "Difficile"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                      difficulty === diff
                        ? "bg-slate-800 text-white border-slate-800 shadow-md"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Sezione / Tipo di Gioco
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGameMode("objects")}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                    gameMode === "objects"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Trova gli Oggetti
                </button>
                <button
                  type="button"
                  onClick={() => setGameMode("differences")}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                    gameMode === "differences"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Trova le Differenze
                </button>
              </div>
            </div>
          </div>

          {/* Background Selection Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              Sfondo del Livello
            </h3>

            {/* Custom file drag/drop or upload */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                isDraggingOver
                  ? "border-indigo-500 bg-indigo-50/50"
                  : customBgFile
                  ? "border-indigo-200 bg-emerald-50/20 hover:bg-emerald-50/40"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <label className="cursor-pointer block w-full h-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    {customBgFile ? "✓ Sfondo personalizzato caricato!" : "Trascina qui un'immagine o clicca"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Carica file standard per testare con le tue foto
                  </p>
                </div>
              </label>
            </div>

            {/* Gallery of ready-made backgrounds */}
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                Oppure scegli un preset artistico:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.name}
                    onClick={() => {
                      setSelectedBgUrl(bg.url);
                      setCustomBgFile(null); // Deselect custom upload
                    }}
                    className={`group relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedBgUrl === bg.url && !customBgFile
                        ? "border-indigo-600 ring-2 ring-indigo-200"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={bg.url}
                      alt={bg.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 pointer-events-none"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] font-bold text-white text-center truncate">
                      {bg.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle column: Visual Creator Canvas (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900 p-3 rounded-3xl border border-slate-800 shadow-lg relative">
            <div className="flex justify-between items-center px-2 py-1 mb-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                Clicca sulla mappa per inserire o spostare gli oggetti da cercare
              </span>
            </div>
            
            {/* Interactive Canvas Grid wrapper */}
            <div
              ref={containerRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
              onTouchCancel={handleCanvasTouchEnd}
              className="relative w-full aspect-[9/16] max-w-[380px] mx-auto rounded-2xl overflow-hidden cursor-crosshair bg-slate-950 select-none shadow-inner"
              style={{
                backgroundImage: `url("${backgroundSource}")`,
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
              }}
            >
              {/* Optional Empty Level Prompt overlay if no items */}
              {objects.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-center p-6 pointer-events-none">
                  <div className="p-3 bg-indigo-500/20 backdrop-blur-md rounded-full mb-3 text-indigo-400 animate-bounce">
                    <Plus className="w-8 h-8" />
                  </div>
                  <p className="text-white font-bold text-base">Inizia a piazzare gli oggetti!</p>
                  <p className="text-slate-300 text-xs mt-1 max-w-xs">
                    Fai clic in qualsiasi punto dello sfondo per inserire un oggetto nascosto o uno sticker emoji.
                  </p>
                </div>
              )}

              {/* Render object nodes on the editor view */}
              {objects.map((obj) => {
                const isSelected = obj.id === selectedObjectId;
                return (
                  <div
                    key={obj.id}
                    onMouseDown={(e) => handleObjectMouseDown(obj.id, e)}
                    onTouchStart={(e) => handleObjectTouchStart(obj.id, e)}
                    className={`absolute flex items-center justify-center rounded-full transition-all duration-150 group cursor-move select-none
                      ${isSelected ? "ring-4 ring-indigo-500 ring-offset-2 z-50 scale-110" : "hover:scale-105 z-20"}`}
                    style={{
                      left: `${obj.x}%`,
                      top: `${obj.y}%`,
                      width: `${obj.radius * 2}%`,
                      height: `${obj.radius * 2 * 1.33}%`, // Scale projection
                      transform: `translate(-50%, -50%)`,
                    }}
                  >
                    {/* Visual target boundary ring (for alignment helper) */}
                    <div className={`absolute inset-0 rounded-full border-2 border-dashed pointer-events-none ${
                      isSelected ? "border-indigo-400 bg-indigo-500/10" : "border-slate-300 bg-white/5 group-hover:border-white"
                    }`} />
                    
                    {obj.emoji ? (
                      // Render emoji sticker representation
                      <span
                        className="pointer-events-none text-xl sm:text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                        style={{
                          transform: `scale(${obj.scale || 1}) rotate(${obj.rotation || 0}deg)`,
                          opacity: obj.opacity !== undefined ? obj.opacity : 1.0,
                        }}
                      >
                        {obj.emoji}
                      </span>
                    ) : (
                      // Click hotspot label fallback
                      <span className="text-[10px] font-extrabold text-white bg-slate-900/80 px-1 py-0.5 rounded border border-white/50 whitespace-nowrap pointer-events-none">
                        Area
                      </span>
                    )}

                    {/* Miniature identifier bubble */}
                    <span className="absolute -top-7 px-1.5 py-0.5 bg-slate-800 text-white rounded text-[8px] font-bold shadow-md z-50 pointer-events-none truncate max-w-[80px]">
                      {obj.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Help Tip */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-950 flex gap-2.5 items-start">
            <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Come funziona l'Editor?</p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-indigo-900">
                <li>Clicca sulla carta a destra per modificare o eliminare un oggetto.</li>
                <li>Trascina o clicca di nuovo sulla mappa per ricalibrare la sua posizione.</li>
                <li>Usa gli sticker emoji per aggiungere nuovi elementi che si fondono con lo sfondo, oppure crea zone invisibili d'interesse speciale!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right column: Active item settings / List of items (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          
          {/* Active selected item configuration panel */}
          {selectedObjectId ? (
            <div className="bg-indigo-950 text-white p-5 rounded-3xl border border-indigo-900 shadow-xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-indigo-900/60 pb-2">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                  ✏️ Configura Oggetto
                </h3>
                <button
                  onClick={() => handleDeleteObject(selectedObjectId)}
                  className="p-1 px-2.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Elimina oggetto"
                >
                  <Trash className="w-3.5 h-3.5" />
                  Elimina
                </button>
              </div>

              {/* Object Type Toggle */}
              <div>
                <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                  Modalità di gioco
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-indigo-900/40 p-1 rounded-xl border border-indigo-900/35">
                  <button
                    onClick={() => {
                      setIsStickerMode(true);
                      updateActiveObject({ emoji: "🔑" });
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      isStickerMode
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-indigo-300 hover:text-white"
                    }`}
                  >
                    Sticker Emoji
                  </button>
                  <button
                    onClick={() => {
                      setIsStickerMode(false);
                      // Clear emoji to make it clean invisible hotspot
                      setObjects((prev) =>
                        prev.map((o) => (o.id === selectedObjectId ? { ...o, emoji: undefined } : o))
                      );
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      !isStickerMode
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-indigo-300 hover:text-white"
                    }`}
                  >
                    Area Invisibile
                  </button>
                </div>
              </div>

              {/* Emoji Sticker Select Grid (Only if sticker mode active) */}
              {isStickerMode && (
                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                    Seleziona icona sticker: ({editingEmoji})
                  </label>
                  <div className="grid grid-cols-6 gap-1 h-32 overflow-y-auto bg-indigo-900/30 p-2 rounded-xl scrollbar-thin scrollbar-thumb-indigo-700">
                    {stickerEmojis.map((em) => (
                      <button
                        key={em}
                        onClick={() => {
                          setEditingEmoji(em);
                          updateActiveObject({ emoji: em });
                        }}
                        className={`text-lg p-1.5 rounded-lg transition-all text-center cursor-pointer hover:bg-indigo-800 ${
                          editingEmoji === em ? "bg-indigo-700 scale-110 ring-2 ring-indigo-400" : ""
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Details */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Nome Indizio dell'Oggetto
                  </label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => {
                      setEditingName(e.target.value);
                      updateActiveObject({ name: e.target.value });
                    }}
                    className="w-full px-3 py-1.5 bg-indigo-900/50 border border-indigo-800 rounded-xl focus:border-indigo-400 focus:outline-hidden text-xs text-white"
                    placeholder="E.g. Chiave della Cantina"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Indizio di Aiuto (Hint)
                  </label>
                  <textarea
                    value={editingHint}
                    onChange={(e) => {
                      setEditingHint(e.target.value);
                      updateActiveObject({ hint: e.target.value });
                    }}
                    className="w-full px-3 py-1.5 bg-indigo-900/50 border border-indigo-800 rounded-xl focus:border-indigo-400 focus:outline-hidden text-xs text-white h-12 resize-none"
                    placeholder="Descrivi dove si nasconde..."
                  />
                </div>

                {/* Adjust Sliders for perfect layout blending */}
                <div className="space-y-2 border-t border-indigo-900/50 pt-2.5">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-indigo-300 mb-0.5">
                      <span>Area sensibile raggio:</span>
                      <span>{editingRadius}%</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={12}
                      value={editingRadius}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setEditingRadius(val);
                        updateActiveObject({ radius: val });
                      }}
                      className="w-full h-1 bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>

                  {isStickerMode && (
                    <>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-indigo-300 mb-0.5">
                          <span>Scala Sticker:</span>
                          <span>{editingScale.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min={0.5}
                          max={3.0}
                          step={0.1}
                          value={editingScale}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setEditingScale(val);
                            updateActiveObject({ scale: val });
                          }}
                          className="w-full h-1 bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-indigo-300 mb-0.5">
                          <span>Rotazione:</span>
                          <span>{editingRotation}°</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          value={editingRotation}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setEditingRotation(val);
                            updateActiveObject({ rotation: val });
                          }}
                          className="w-full h-1 bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-indigo-300 mb-0.5">
                          <span>Opacità (Mimetismo):</span>
                          <span>{Math.round(editingOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={1.0}
                          step={0.05}
                          value={editingOpacity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setEditingOpacity(val);
                            updateActiveObject({ opacity: val });
                          }}
                          className="w-full h-1 bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedObjectId(null)}
                className="w-full py-1.5 bg-indigo-800 hover:bg-indigo-700 text-indigo-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Conferma Oggetto
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center p-8 text-center h-[240px]">
              <Eye className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
              <p className="text-xs font-bold text-slate-700">Nessun oggetto selezionato</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[150px]">
                Fai clic su un oggetto posizionato sulla mappa per impostare dettagli, rotazione, trasparenza e indizi di aiuto.
              </p>
            </div>
          )}

          {/* List of currently created items */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
              <span>Oggetti Creati ({objects.length})</span>
            </h4>

            {objects.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic text-center py-4">
                La barra degli oggetti è ancora vuota. Clicca sulla mappa in alto!
              </p>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {objects.map((obj) => (
                  <div
                    key={obj.id}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${
                      selectedObjectId === obj.id
                        ? "border-indigo-600 bg-indigo-50/50"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedObjectId(obj.id)}
                      className="flex items-center gap-2 overflow-hidden flex-1 text-left cursor-pointer focus:outline-hidden"
                    >
                      <span className="text-lg bg-slate-100 w-8 h-8 flex items-center justify-center rounded-lg leading-none shrink-0">
                        {obj.emoji || "🎯"}
                      </span>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                          {obj.name}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate">
                          X: {obj.x}%, Y: {obj.y}% | {obj.emoji ? "Sticker" : "Hotspot"}
                        </p>
                      </div>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteObject(obj.id);
                      }}
                      className="p-1 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
