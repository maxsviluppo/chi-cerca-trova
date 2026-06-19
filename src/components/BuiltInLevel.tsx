import React from "react";
import { HiddenObject } from "../types";

interface BuiltInLevelProps {
  onObjectClick: (objId: string) => void;
  foundObjectIds: Set<string>;
}

// Built-in level hidden objects data matched perfectly with coordinate points (0-100 scale)
export const BUILT_IN_LEVEL_OBJECTS: HiddenObject[] = [
  {
    id: "bi_star",
    name: "Stella Dorata",
    x: 74.5,
    y: 19.5,
    radius: 5,
    emoji: "⭐",
    hint: "Sotto la luna, appoggiata sul comignolo del camino.",
  },
  {
    id: "bi_cat",
    name: "Gattino Grigio",
    x: 41,
    y: 35.5,
    radius: 4.5,
    emoji: "🐱",
    hint: "Si sta godendo il calduccio addormentato sul tetto spiovente.",
  },
  {
    id: "bi_key",
    name: "Chiave Antica",
    x: 62.5,
    y: 81.5,
    radius: 4,
    emoji: "🔑",
    hint: "Appesa sulla porta di legno rossa, pronta ad aprire la casa.",
  },
  {
    id: "bi_apple",
    name: "Mela Rossa",
    x: 18.5,
    y: 53.5,
    radius: 4.5,
    emoji: "🍎",
    hint: "Un frutto maturo, nascosto tra le fronde dell'albero a sinistra.",
  },
  {
    id: "bi_mushroom",
    name: "Fungo Magico",
    x: 14.5,
    y: 86.5,
    radius: 4,
    emoji: "🍄",
    hint: "Sotto l'ombra dei rami dell'albero, tra i fiori di campo.",
  },
  {
    id: "bi_spider",
    name: "Ragno Birbante",
    x: 52.5,
    y: 47.0,
    radius: 4,
    emoji: "🕷️",
    hint: "Pende pigramente sotto la sporgenza del tetto, sopra la finestra.",
  },
  {
    id: "bi_clover",
    name: "Quadrifoglio Portafortuna",
    x: 88.5,
    y: 87.5,
    radius: 3.5,
    emoji: "🍀",
    hint: "Nascosto nell'erba soffice, sul lato destro del vialetto.",
  },
  {
    id: "bi_balloon",
    name: "Palloncino Sfondato",
    x: 83.5,
    y: 45.0,
    radius: 5,
    emoji: "🎈",
    hint: "Vola alto a destra della casa, impigliato nell'aria tiepida.",
  }
];

export const BuiltInLevel: React.FC<BuiltInLevelProps> = ({
  onObjectClick,
  foundObjectIds,
}) => {
  return (
    <div className="relative w-full h-full bg-linear-to-b from-sky-200 via-sky-100 to-emerald-50 select-none border-none overflow-hidden">
      
      {/* Dynamic Keyframe Animations for Cartoon Vibes */}
      <style>{`
        @keyframes puff {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(-70px) translateX(25px) scale(1.5); opacity: 0; }
        }
        @keyframes swing {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-35deg); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.5deg); }
        }
        @keyframes cloud-move {
          0% { transform: translateX(-10%); }
          100% { transform: translateX(110%); }
        }
        @keyframes fire-glow {
          0%, 100% { fill: #f59e0b; filter: drop-shadow(0 0 4px #ef4444); }
          50% { fill: #f97316; filter: drop-shadow(0 0 10px #f97316); }
        }
        @keyframes light-pulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.55; }
        }
        .animate-puff-1 { animation: puff 4s infinite linear; }
        .animate-puff-2 { animation: puff 4.2s infinite linear 1.4s; }
        .animate-puff-3 { animation: puff 3.8s infinite linear 2.8s; }
        .animate-swing { transform-origin: left center; animation: swing 4s infinite ease-in-out; }
        .animate-sway { transform-origin: bottom center; animation: sway 6s infinite ease-in-out; }
        .animate-cloud-1 { animation: cloud-move 45s infinite linear; }
        .animate-cloud-2 { animation: cloud-move 60s infinite linear -15s; }
        .animate-fire { animation: fire-glow 1.2s infinite ease-in-out; }
        .animate-light { animation: light-pulse 2.5s infinite ease-in-out; }
      `}</style>

      {/* --- BACKGROUND SKY & CLOUDS --- */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-300 to-sky-100 pointer-events-none" />
      
      {/* Drifting Clouds */}
      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none overflow-hidden">
        <svg className="absolute top-4 w-28 h-10 animate-cloud-1 fill-white/80 opacity-90" viewBox="0 0 100 40">
          <path d="M 10,25 C 10,15 25,12 35,16 C 40,8 55,8 60,15 C 70,12 85,15 85,25 C 90,28 90,35 80,35 L 15,35 C 5,35 5,28 10,25 Z" />
        </svg>
        <svg className="absolute top-12 w-32 h-12 animate-cloud-2 fill-white/60 opacity-80" viewBox="0 0 100 40">
          <path d="M 10,25 C 10,15 25,12 35,16 C 40,8 55,8 60,15 C 70,12 85,15 85,25 C 90,28 90,35 80,35 L 15,35 C 5,35 5,28 10,25 Z" />
        </svg>
      </div>

      {/* Sun/Moon Glow */}
      <div className="absolute top-6 left-12 w-20 h-20 rounded-full bg-amber-100/90 blur-md shadow-[0_0_40px_#fef08a] pointer-events-none flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-amber-50" />
      </div>

      {/* --- LEVEL LANDSCAPE --- */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 750" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        
        {/* Distant Hills */}
        <path d="M-100,550 Q150,420 400,520 T900,480 T1200,530 L1200,800 L-100,800 Z" fill="#a7f3d0" opacity="0.6" />
        <path d="M-50,600 Q200,500 500,580 T1100,540 L1100,800 L-50,800 Z" fill="#6ee7b7" opacity="0.8" />
        {/* Main Meadow */}
        <path d="M-50,660 Q250,580 600,650 T1100,620 L1100,800 L-50,800 Z" fill="#34d399" />

        {/* --- TREE (Swaying) --- */}
        <g className="animate-sway">
          {/* Tree Trunk */}
          <path d="M170,680 Q180,550 185,450 Q200,450 195,550 T190,680 Z" fill="#78350f" />
          <path d="M130,520 Q170,500 185,470" stroke="#78350f" strokeWidth="12" strokeLinecap="round" />
          <path d="M230,500 Q190,480 185,460" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
          
          {/* Tree Foliage (The Apple bi_apple hides here) */}
          <circle cx="140" cy="420" r="65" fill="#059669" />
          <circle cx="230" cy="410" r="60" fill="#059669" />
          <circle cx="185" cy="360" r="75" fill="#10b981" />
          <circle cx="185" cy="420" r="65" fill="#10b981" opacity="0.9" />
        </g>

        {/* --- CARTOON COZY HOUSE --- */}
        {/* House Base Shadow */}
        <ellipse cx="600" cy="690" rx="220" ry="25" fill="#064e3b" opacity="0.25" />

        {/* Chimney */}
        <path d="M720,280 L765,280 L765,150 L720,150 Z" fill="#475569" stroke="#1e293b" strokeWidth="6" strokeLinejoin="round" />
        <path d="M710,150 L775,150 L775,128 L710,128 Z" fill="#334155" stroke="#1e293b" strokeWidth="6" strokeLinejoin="round" />

        {/* Main Base Walls */}
        <path d="M430,680 L430,420 L730,420 L730,680 Z" fill="#fef3c7" stroke="#334155" strokeWidth="8" strokeLinejoin="round" />
        {/* Right Wing Annex */}
        <path d="M730,680 L730,480 L850,480 L850,680 Z" fill="#fde68a" stroke="#334155" strokeWidth="8" strokeLinejoin="round" />

        {/* Roof Side/Gable */}
        <path d="M390,430 L580,240 L770,430 Z" fill="#eb4848" stroke="#334155" strokeWidth="8" strokeLinejoin="round" />
        <path d="M715,490 L790,410 L865,490 Z" fill="#dc2626" stroke="#334155" strokeWidth="7" strokeLinejoin="round" />

        {/* Window - Attic (Circular) */}
        <circle cx="580" cy="340" r="28" fill="#fef08a" stroke="#334155" strokeWidth="6" />
        <line x1="580" y1="312" x2="580" y2="368" stroke="#334155" strokeWidth="4" />
        <line x1="552" y1="340" x2="608" y2="368" stroke="#334155" strokeWidth="4" />

        {/* Door Frame & Door (Red Cozy Door) */}
        <rect x="585" y="520" width="75" height="155" rx="6" fill="#dc2626" stroke="#334155" strokeWidth="7" />
        {/* Door glass pane */}
        <rect x="598" y="535" width="49" height="45" rx="3" fill="#67e8f9" stroke="#334155" strokeWidth="4" />
        <line x1="622" y1="535" x2="622" y2="580" stroke="#334155" strokeWidth="2" />
        {/* Door Knob */}
        <circle cx="602" cy="610" r="5" fill="#f59e0b" stroke="#334155" strokeWidth="2" />

        {/* Main Windows with Light Pulse (Hearthside window) */}
        <rect x="470" y="475" width="85" height="85" rx="8" fill="#fef08a" stroke="#334155" strokeWidth="7" />
        <rect x="475" y="480" width="75" height="75" rx="6" fill="#fef08a" className="animate-light" />
        
        {/* Window panes frames */}
        <line x1="512" y1="475" x2="512" y2="560" stroke="#334155" strokeWidth="5" />
        <line x1="470" y1="517" x2="555" y2="517" stroke="#334155" strokeWidth="5" />

        {/* Swinging Window Pane/Shutter (Interactive Graphic matching user request!) */}
        <g transform="translate(470, 475)">
          {/* Wooden shutter swing */}
          <rect x="-42" y="0" width="42" height="85" rx="4" fill="#d97706" stroke="#334155" strokeWidth="5" className="animate-swing" />
          <line x1="-32" y1="20" x2="-10" y2="20" stroke="#451a03" strokeWidth="3" />
          <line x1="-32" y1="65" x2="-10" y2="65" stroke="#451a03" strokeWidth="3" />
        </g>

        {/* Small Annex Window */}
        <rect x="765" y="520" width="55" height="55" rx="4" fill="#a5f3fc" stroke="#334155" strokeWidth="6" />
        <line x1="792.5" y1="520" x2="792.5" y2="575" stroke="#334155" strokeWidth="4" />
        <line x1="765" y1="547.5" x2="820" y2="547.5" stroke="#334155" strokeWidth="4" />

        {/* Stone Path */}
        <path d="M620,680 L610,750 L580,750 L600,680 Z" fill="#64748b" opacity="0.3" />
        <circle cx="612" cy="700" r="8" fill="#64748b" />
        <circle cx="598" cy="718" r="10" fill="#64748b" />
        <circle cx="605" cy="738" r="12" fill="#64748b" />

        {/* Garden fence */}
        <path d="M780,680 L780,640" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
        <path d="M805,680 L805,640" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
        <path d="M830,680 L830,640" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
        <path d="M855,680 L855,640" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
        <path d="M770,665 L865,665" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
        <path d="M770,648 L865,648" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />

        {/* Garden Flowers */}
        <circle cx="340" cy="710" r="12" fill="#f43f5e" />
        <circle cx="340" cy="710" r="4" fill="#fef08a" />
        <circle cx="325" cy="722" r="10" fill="#ec4899" />
        <circle cx="325" cy="722" r="3" fill="#fef08a" />
        
        <circle cx="895" cy="715" r="14" fill="#a855f7" />
        <circle cx="895" cy="715" r="4" fill="#fef08a" />
        <circle cx="915" cy="705" r="12" fill="#ec4899" />
        <circle cx="915" cy="705" r="3" fill="#fef08a" />
      </svg>

      {/* --- CARTOON CHIMNEY SMOKE PUFFS (Drifting and fading away!) --- */}
      <div className="absolute top-[80px] left-[71.5%] w-16 h-28 pointer-events-none overflow-visible">
        {/* Each circle rises out of the stove/chimney area */}
        <div className="absolute bottom-2 left-6 w-5 h-5 rounded-full bg-slate-400/70 blur-[1px] animate-puff-1" />
        <div className="absolute bottom-2 left-6 w-6 h-6 rounded-full bg-slate-300/80 blur-[2px] animate-puff-2" />
        <div className="absolute bottom-2 left-6 w-4 h-4 rounded-full bg-slate-400/60 blur-[1px] animate-puff-3" />
      </div>

      {/* --- RENDER THE INTERACTIVE HIDDEN OBJECTS/EMOJIS INSIDE THE SCENE --- */}
      {BUILT_IN_LEVEL_OBJECTS.map((obj) => {
        const isFound = foundObjectIds.has(obj.id);
        return (
          <button
            key={obj.id}
            id={`target-${obj.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isFound) {
                onObjectClick(obj.id);
              }
            }}
            disabled={isFound}
            className={`absolute flex items-center justify-center rounded-full transition-all duration-500 cursor-pointer select-none
              ${isFound 
                ? "scale-0 rotate-[180deg] opacity-0 pointer-events-none" 
                : "focus:outline-hidden hover:bg-white/15 active:scale-95"}`}
            style={{
              left: `${obj.x}%`,
              top: `${obj.y}%`,
              width: `${obj.radius * 2}%`,
              height: `${obj.radius * 2 * 1.33}%`, // Scale to compensate aspect ratio
              transform: `translate(-50%, -50%)`,
            }}
            title={obj.name}
          >
            {/* The cartoon object itself rendered as emoji */}
            <span 
              className="text-2xl sm:text-3xl md:text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] cursor-pointer"
              style={{
                fontSize: "min(3.2vw, 36px)"
              }}
            >
              {obj.emoji}
            </span>
          </button>
        );
      })}
    </div>
  );
};
