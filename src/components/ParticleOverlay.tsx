import React from "react";
import { motion, AnimatePresence } from "motion/react";

export interface ClickParticle {
  id: string;
  x: number; // coordinates relative to container width %
  y: number; // coordinates relative to container height %
  emoji?: string;
}

interface ParticleOverlayProps {
  particles: ClickParticle[];
  onComplete: (id: string) => void;
}

// Generate random direction values for radiating stars
const generateStars = (count: number = 10) => {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i * 360) / count + (Math.random() * 20 - 10);
    const distance = 45 + Math.random() * 65; // radius of travel in px
    const scale = 0.6 + Math.random() * 1.1;
    const colors = ["#fbbf24", "#38bdf8", "#34d399", "#f472b6", "#a78bfa", "#f87171", "#3b82f6", "#10b981"];
    const itemColor = colors[Math.floor(Math.random() * colors.length)];
    return {
      angle,
      distance,
      scale,
      color: itemColor,
    };
  });
};

// Generate cartoon cloud "poof" puffs
const generatePuffs = () => {
  return [
    { dx: -22, dy: -15, size: 48, delay: 0 },
    { dx: 22, dy: -18, size: 54, delay: 0.04 },
    { dx: -28, dy: 20, size: 42, delay: 0.07 },
    { dx: 30, dy: 15, size: 48, delay: 0.09 },
    { dx: 0, dy: 25, size: 58, delay: 0.02 },
    { dx: -10, dy: -30, size: 40, delay: 0.06 },
    { dx: 12, dy: 28, size: 46, delay: 0.08 }
  ];
};

export const ParticleOverlay: React.FC<ParticleOverlayProps> = ({
  particles,
  onComplete,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => {
          const stars = generateStars(14);
          const puffs = generatePuffs();

          return (
            <div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
            >
              {/* 1. Cartoon "Poof" Cloud Puffs */}
              {puffs.map((puff, idx) => (
                <motion.div
                  key={`puff-${idx}`}
                  initial={{ scale: 0.1, opacity: 0.95, x: 0, y: 0 }}
                  animate={{
                    scale: 1.5,
                    opacity: 0,
                    x: puff.dx,
                    y: puff.dy,
                  }}
                  transition={{ duration: 0.55, delay: puff.delay, ease: "easeOut" }}
                  className="absolute bg-slate-50/95 rounded-full border-2 border-slate-200/50 shadow-md"
                  style={{
                    width: puff.size,
                    height: puff.size,
                    marginLeft: -puff.size / 2,
                    marginTop: -puff.size / 2,
                  }}
                />
              ))}

              {/* 2. Main found object icon pop and scale up */}
              {particle.emoji && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 0 }}
                  animate={{
                    scale: [0, 2.7, 1.9, 0],
                    opacity: [0, 1, 1, 0],
                    y: -60,
                    rotate: [0, 20, -20, 35],
                  }}
                  transition={{ duration: 0.95, ease: "easeOut" }}
                  onAnimationComplete={() => onComplete(particle.id)}
                  className="absolute text-5xl flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] z-50"
                >
                  {particle.emoji}
                </motion.div>
              )}

              {/* 3. Burst star sparks radiating outwards */}
              {stars.map((star, idx) => {
                const rad = (star.angle * Math.PI) / 180;
                const targetX = Math.cos(rad) * star.distance;
                const targetY = Math.sin(rad) * star.distance;

                return (
                  <motion.div
                    key={idx}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                    animate={{
                      x: targetX,
                      y: targetY,
                      scale: star.scale,
                      opacity: 0,
                      rotate: star.angle + 360,
                    }}
                    transition={{ duration: 0.85, ease: "easeOut" }}
                    className="absolute w-4.5 h-4.5 flex items-center justify-center"
                    style={{
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={star.color}
                      className="w-full h-full filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                    >
                      <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
                    </svg>
                  </motion.div>
                );
              })}

              {/* 4. Concentric growing light ring wave */}
              <motion.div
                initial={{ width: 0, height: 0, opacity: 0.8 }}
                animate={{ width: 160, height: 160, opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="absolute border-4 border-indigo-400 rounded-full -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
