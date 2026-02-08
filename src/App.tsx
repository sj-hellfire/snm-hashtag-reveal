import React, { useState, useEffect } from 'react';
import ScratchHeart from './components/ScratchHeart';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';

export default function App() {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
    triggerFireworks();
  };

  const triggerFireworks = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-start pt-12 pb-8 px-4 overflow-y-auto overflow-x-hidden relative">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-rose-200 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-0 w-72 h-72 bg-amber-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-rose-100 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg z-10 flex flex-col items-center gap-6 md:gap-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3 md:space-y-5 shrink-0"
        >
          <h1 className="font-['Montserrat'] text-xl md:text-2xl text-stone-600 tracking-wide uppercase font-medium">
            Hashtag Reveal!
          </h1>
          
          <div className="font-['Great_Vibes'] text-5xl md:text-7xl text-stone-800 leading-tight">
            Samarth & Muskan
          </div>

          <p className="font-['Montserrat'] text-stone-600 text-sm md:text-lg leading-relaxed max-w-md mx-auto px-2">
            are getting married on <span className="font-semibold text-rose-500">8th & 9th March</span>.
            <br />
            We're super duper excited for the wedding. Are you!?
          </p>
        </motion.div>

        {/* Scratch Card Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="w-full flex flex-col items-center justify-center relative"
        >
             {!isRevealed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-8 left-0 right-0 text-center z-20"
                >
                  <span className="text-xs font-['Montserrat'] text-stone-400 uppercase tracking-widest animate-pulse">
                    Scratch to Reveal
                  </span>
                </motion.div>
             )}
            
            <ScratchHeart onReveal={handleReveal} isRevealed={isRevealed} />
        </motion.div>

        {/* Footer / Reveal Message */}
        <div className="h-20 flex items-center justify-center shrink-0 w-full">
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-center"
            >
              <h3 className="font-['Great_Vibes'] text-4xl md:text-5xl text-stone-800 mb-2">
                See you there!
              </h3>
              <div className="w-16 h-1 bg-rose-400 mx-auto rounded-full"></div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
