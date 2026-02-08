import React, { useRef, useEffect, useState } from 'react';

interface ScratchHeartProps {
  onReveal: () => void;
  isRevealed: boolean;
}

const ScratchHeart: React.FC<ScratchHeartProps> = ({ onReveal, isRevealed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef<{ x: number, y: number } | null>(null);

  // Configuration
  const width = 450;
  const height = 450;
  const brushSize = 30;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Initialize canvas
    canvas.width = width;
    canvas.height = height;

    // Draw the initial gold heart
    drawGoldHeart(ctx, width, height);

  }, []);

  // Handle the "Reveal All" effect when isRevealed becomes true
  useEffect(() => {
    if (isRevealed) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear the canvas smoothly or instantly
      ctx.clearRect(0, 0, width, height);
    }
  }, [isRevealed]);

  const drawGoldHeart = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.beginPath();
    
    // Heart path
    ctx.moveTo(w / 2, h * 0.2);
    ctx.bezierCurveTo(
      w / 2, h * 0.15, 
      w * 0.1, h * 0.05, 
      w * 0.1, h * 0.45
    );
    ctx.bezierCurveTo(
      w * 0.1, h * 0.65, 
      w * 0.4, h * 0.85, 
      w / 2, h * 0.95
    );
    ctx.bezierCurveTo(
      w * 0.6, h * 0.85, 
      w * 0.9, h * 0.65, 
      w * 0.9, h * 0.45
    );
    ctx.bezierCurveTo(
      w * 0.9, h * 0.05, 
      w / 2, h * 0.15, 
      w / 2, h * 0.2
    );
    
    ctx.closePath();
    ctx.clip(); // Clip subsequent drawing to the heart shape

    // Create Gold Gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#BF953F');
    gradient.addColorStop(0.25, '#FCF6BA');
    gradient.addColorStop(0.5, '#B38728');
    gradient.addColorStop(0.75, '#FBF5B7');
    gradient.addColorStop(1, '#AA771C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Add some "glitter" noise
    for (let i = 0; i < 800; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#FFF' : '#FFD700';
        ctx.globalAlpha = Math.random() * 0.8;
        ctx.beginPath();
        ctx.arc(
            Math.random() * w,
            Math.random() * h,
            Math.random() * 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    ctx.restore();
  };

  const getMousePos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    // Scale coordinates to match internal canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    // Smooth scratching: Draw line from last position
    if (lastPos.current) {
      ctx.beginPath();
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We only check the pixels inside a central bounding box of the heart to save performance
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let opaquePixels = 0;
    
    // Check every 4th pixel (optimization)
    // i starts at 3 (alpha channel of first pixel)
    // stride is 16 (4 bytes per pixel * 4 pixels skip)
    for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] > 0) {
            opaquePixels++;
        }
    }

    // Total samples checked
    const totalSamples = pixels.length / 16;
    
    // The heart covers roughly 50-60% of the canvas area.
    // We want to trigger reveal when about 50% of the heart is scratched away.
    // So if opaque pixels drop below ~25-30% of total canvas area.
    const opaquePercentage = (opaquePixels / totalSamples) * 100;
    
    // Threshold: if less than 25% of the canvas is opaque, consider it revealed
    if (opaquePercentage < 25 && !isRevealed) {
        onReveal();
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed) return;
    setIsDrawing(true);
    const { x, y } = getMousePos(e.nativeEvent);
    lastPos.current = { x, y };
    scratch(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isRevealed) return;
    // Prevent scrolling on touch devices while scratching
    if (e.type === 'touchmove') {
      // e.preventDefault(); // React synthetic events don't support preventDefault on passive listeners easily, handled by touch-action css
    }
    
    const { x, y } = getMousePos(e.nativeEvent);
    scratch(x, y);
    lastPos.current = { x, y };
    
    // Throttle progress check
    if (Math.random() > 0.8) {
        checkProgress();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPos.current = null;
    checkProgress();
  };

  return (
    <div className="relative flex items-center justify-center w-full max-w-[450px] aspect-square mx-auto select-none">
      {/* Background Layer (The Hashtag) */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="text-center transform -rotate-12">
           <h2 className="font-['Montserrat'] font-bold text-xl md:text-2xl text-rose-600 drop-shadow-sm px-4 tracking-wider">
             #SamGotMusTaken
           </h2>
        </div>
      </div>

      {/* Foreground Layer (The Scratch Card) */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full z-10 cursor-pointer touch-none transition-opacity duration-700 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default ScratchHeart;
