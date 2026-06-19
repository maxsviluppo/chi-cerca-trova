import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, RotateCcw, AlertCircle } from "lucide-react";
import { playFairyMagicSound, playBtnClick } from "../utils/audio";

import splashBg from "../../assets/allegati/Image-8.jpeg";

interface SplashViewProps {
  onEnter: () => void;
}

interface SplashParticle {
  id: string;
  x: number;
  y: number;
  angle: number;
  distance: number;
  scale: number;
  speed: number;
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playFairyMagicSound();
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64String = uploadEvent.target?.result as string;
        if (base64String) {
          localStorage.setItem("custom_splash_bg", base64String);
          setBgImage(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBg = (e: React.MouseEvent) => {
    e.stopPropagation();
    playBtnClick();
    localStorage.removeItem("custom_splash_bg");
    setBgImage(splashBg);
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

    const count = 45;
    const newParticles: SplashParticle[] = Array.from({ length: count }).map((_, i) => {
      const angle = (i * 360) / count + (Math.random() * 20 - 10);
      const distance = 90 + Math.random() * 160;
      const scale = 0.6 + Math.random() * 1.6;
      const speed = 0.9 + Math.random() * 0.9;
      return {
        id: `click-gold-${i}-${Date.now()}`,
        x: clickX,
        y: clickY,
        angle,
        distance,
        scale,
        speed,
      };
    });

    setClickParticles(newParticles);

    // Clean dissolve transition triggers home view after sound & particle dispersion completes
    setTimeout(() => {
      onEnter();
    }, 1100);
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

      {/* CONCENTRIC CLICKS GOLD STARDUST DISPERSION PARTICLES */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        {clickParticles.map((star) => {
          const rad = (star.angle * Math.PI) / 180;
          const targetX = Math.cos(rad) * star.distance;
          const targetY = Math.sin(rad) * star.distance;

          return (
            <motion.div
              key={star.id}
              initial={{ x: star.x, y: star.y, scale: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: star.x + targetX * star.speed,
                y: star.y + targetY * star.speed,
                scale: [star.scale, star.scale * 1.7, 0],
                opacity: [1, 0.9, 0],
                rotate: star.angle + (Math.random() * 360),
              }}
              transition={{ duration: 1.1, ease: [0.1, 0.8, 0.2, 1] }}
              className="absolute w-6 h-6 flex items-center justify-center"
              style={{
                transform: "translate(-50%, -50%)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="#f59e0b"
                className="w-full h-full filter drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]"
              >
                <path d="M12 0l3.09 6.26L22 7.27l-5 4.87 1.18 6.88L12 15.77l-6.18 3.25L7 12.14l-5-4.87 6.91-1.01L12 0z" />
              </svg>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
