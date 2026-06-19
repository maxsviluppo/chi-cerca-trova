import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playFairyMagicSound } from "../utils/audio";

import splashBg from "../../assets/allegati/Image-8.jpeg";

interface SplashViewProps {
  onEnter: () => void;
}

interface SplashParticle {
  id: string;
  x: number;
  y: number;
  scale: number;
  type: "sparkle" | "glow";
  delay: number;
  duration: number;
  angle: number;
}

interface AmbientParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1400"; // Autumn enchanted library fallback

export const SplashView: React.FC<SplashViewProps> = ({ onEnter }) => {
  const [clickParticles, setClickParticles] = useState<SplashParticle[]>([]);
  const [ambientParticles, setAmbientParticles] = useState<AmbientParticle[]>([]);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [clickReady, setClickReady] = useState(true);
  const [bgImage, setBgImage] = useState<string>(() => {
    try {
      const savedBg = localStorage.getItem("custom_splash_bg");
      return savedBg || splashBg;
    } catch (e) {
      return splashBg;
    }
  });

  // Load image from localStorage on mount, else fallback to standard images
  useEffect(() => {
    // Initialize ambient stars floating gently in the background
    const stars = Array.from({ length: 30 }).map((_, i) => ({
      id: `ambient-gold-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 4,
      duration: 4 + Math.random() * 5,
      delay: Math.random() * 3,
    }));
    setAmbientParticles(stars);
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If local path fails, fallback to high-quality library template image
    if (bgImage !== FALLBACK_IMAGE) {
      setBgImage(FALLBACK_IMAGE);
    }
  };

  const handleClickScreen = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clickReady || isFadingOut) return;
    setClickReady(false);
    setIsFadingOut(true);

    // Play fairy chime sound
    playFairyMagicSound();

    // Find custom click coordinate and spawn a gorgeous burst of golden stardust
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const count = 40;
    const newParticles: SplashParticle[] = Array.from({ length: count }).map((_, i) => {
      const angle = Math.random() * 360;
      const distance = Math.random() * 70; // cluster close to the click point
      const rad = (angle * Math.PI) / 180;
      const px = clickX + Math.cos(rad) * distance;
      const py = clickY + Math.sin(rad) * distance;
      
      const scale = 0.5 + Math.random() * 1.4;
      const type = Math.random() > 0.4 ? "sparkle" : "glow";
      const delay = Math.random() * 0.25;
      const duration = 0.8 + Math.random() * 0.6;

      return {
        id: `click-sparkle-${i}-${Date.now()}`,
        x: px,
        y: py,
        scale,
        type,
        delay,
        duration,
        angle,
      };
    });

    setClickParticles(newParticles);

    // Clean dissolve transition triggers home view after sound & particle dispersion completes
    setTimeout(() => {
      onEnter();
    }, 1200);
  };

  return (
    <div
      onClick={handleClickScreen}
      className="fixed inset-0 z-50 overflow-hidden cursor-pointer select-none bg-black flex items-center justify-center animate-fadeIn"
    >
      {/* FULL-SCREEN IMAGE BACKGROUND */}
      <AnimatePresence mode="wait">
        {bgImage ? (
          <motion.img
            key={bgImage}
            src={bgImage}
            onError={handleImageError}
            alt="Splash Screen Background"
            referrerPolicy="no-referrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />
        ) : null}
      </AnimatePresence>

      {/* AMBIENT SHIMMER GOLD OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

      {/* FLOATING MAGICAL GOLDEN AMBIENT STARS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {ambientParticles.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0, y: "110vh" }}
            animate={{
              opacity: [0, 0.8, 0.8, 0],
              y: "-10vh",
              x: ["0vw", `${Math.random() * 8 - 4}vw`],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.9)] filter blur-[0.2px]"
            style={{
              left: `${star.x}%`,
              width: star.size,
              height: star.size,
            }}
          />
        ))}
      </div>

      {/* BOTTOM INSTRUCTION */}
      {!isFadingOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 z-10 pointer-events-none text-center"
        >
          <span className="text-[11px] sm:text-xs text-amber-200/90 font-medium tracking-[3px] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            Tocca in qualsiasi punto per iniziare
          </span>
        </motion.div>
      )}

      {/* TRANSITION OVERLAY - PURE DISSOLVE EFFECT CHROME ON CLICK */}
      <AnimatePresence>
        {isFadingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      {/* CLICK SPARKLING AND GLOWING PARTICLES WITH FADE-IN AND PULSE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        {clickParticles.map((star) => (
          <motion.div
            key={star.id}
            initial={{ 
              x: star.x, 
              y: star.y, 
              scale: 0, 
              opacity: 0, 
              rotate: star.angle 
            }}
            animate={{
              scale: [0, star.scale, star.scale * 1.3, star.scale * 0.9, 0],
              opacity: [0, 1, 0.9, 0.8, 0],
              rotate: star.angle + 180,
            }}
            transition={{ 
              duration: star.duration, 
              delay: star.delay,
              ease: "easeInOut" 
            }}
            className="absolute flex items-center justify-center"
            style={{
              transform: "translate(-50%, -50%)",
              width: star.type === "glow" ? "48px" : "24px",
              height: star.type === "glow" ? "48px" : "24px",
            }}
          >
            {star.type === "glow" ? (
              // Soft pulsating radial glow (bagliore)
              <div 
                className="w-full h-full rounded-full bg-amber-400/35 blur-[5px] animate-pulse"
              />
            ) : (
              // 4-point diamond sparkle SVG (scintilla)
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-[150%] h-[150%] rounded-full bg-amber-400/20 blur-[4px]" />
                <svg
                  viewBox="0 0 24 24"
                  fill="#f59e0b"
                  className="w-full h-full relative z-10 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]"
                >
                  <path d="M12 0c0 6.627 5.373 12 12 12-6.627 0-12 5.373-12 12 0-6.627-5.373-12-12-12 6.627 0 12-5.373 12-12z" />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
