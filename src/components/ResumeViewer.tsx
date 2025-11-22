import React, { useState, useRef, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCcw, FileText, ScanLine } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import resumeImage from "@/assets/resume.png"; 
import resumePdf from "@/assets/resume.pdf";

const ResumeViewer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1); 
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isScanning, setIsScanning] = useState(false);
  
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Refs to access state inside event listeners without triggering re-renders
  const scaleRef = useRef(scale);
  const positionRef = useRef(position);

  // Keep refs synced with state
  useEffect(() => {
    scaleRef.current = scale;
    positionRef.current = position;
  }, [scale, position]);

  // Reset view when closed & Trigger Animations on Open
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Trigger scan effect
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 2500); // Scan lasts 2.5s
    } else {
      setTimeout(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setIsScanning(false);
      }, 200);
    }
  };

  // Helper: Calculate boundaries based on a specific scale
  const getBoundaries = (currentScale: number) => {
    if (!containerRef.current || !imgRef.current) return { x: 0, y: 0 };
    
    const container = containerRef.current.getBoundingClientRect();
    const imgWidth = imgRef.current.offsetWidth * currentScale;
    const imgHeight = imgRef.current.offsetHeight * currentScale;

    const overflowX = (imgWidth - container.width) / 2;
    const overflowY = (imgHeight - container.height) / 2;

    return {
      x: Math.max(0, overflowX),
      y: Math.max(0, overflowY)
    };
  };

  // Unified Zoom Logic
  const applyZoom = (newScale: number) => {
    const clampedScale = Math.min(Math.max(newScale, 1), 4);
    
    const bounds = getBoundaries(clampedScale);
    const currentPos = positionRef.current;
    
    const clampedX = Math.max(-bounds.x, Math.min(bounds.x, currentPos.x));
    const clampedY = Math.max(-bounds.y, Math.min(bounds.y, currentPos.y));

    setScale(clampedScale);
    setPosition({ x: clampedX, y: clampedY });
    
    if (clampedScale === 1) setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => applyZoom(scale + 0.5);
  const handleZoomOut = () => applyZoom(scale - 0.5);
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag Logic
  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const bounds = getBoundaries(scale);
    const rawX = e.clientX - startPos.x;
    const rawY = e.clientY - startPos.y;
    setPosition({
      x: Math.max(-bounds.x, Math.min(bounds.x, rawX)),
      y: Math.max(-bounds.y, Math.min(bounds.y, rawY)),
    });
  };

  const onMouseUp = () => setIsDragging(false);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setIsOpen(false);
    }
  };

  // Wheel Zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (!containerRef.current?.contains(target)) return;

      e.preventDefault();
      e.stopPropagation();

      const currentScale = scaleRef.current;
      const currentPos = positionRef.current;
      const delta = e.deltaY * -0.002; 
      const nextScale = Math.min(Math.max(currentScale + delta, 1), 4);

      if (!containerRef.current || !imgRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const imgWidth = imgRef.current.offsetWidth * nextScale;
      const imgHeight = imgRef.current.offsetHeight * nextScale;
      const overflowX = Math.max(0, (imgWidth - containerRect.width) / 2);
      const overflowY = Math.max(0, (imgHeight - containerRect.height) / 2);

      const clampedX = Math.max(-overflowX, Math.min(overflowX, currentPos.x));
      const clampedY = Math.max(-overflowY, Math.min(overflowY, currentPos.y));

      setScale(nextScale);
      setPosition(nextScale === 1 ? { x: 0, y: 0 } : { x: clampedX, y: clampedY });
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-2 border-foreground text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
        >
          <FileText className="w-5 h-5" />
          Resume
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className={cn(
          "max-w-[95vw] w-full h-[95vh] p-0 border-none bg-transparent shadow-none outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "[&>button]:hidden" // Hide default close
        )}
      >
        <DialogTitle className="sr-only">Resume Viewer</DialogTitle>
        <DialogDescription className="sr-only">Interactive zoomable resume</DialogDescription>

        {/* Styles for Holographic Effects */}
        <style>{`
           @keyframes scan-sweep {
             0% { top: 0%; opacity: 0; }
             10% { opacity: 1; }
             90% { opacity: 1; }
             100% { top: 100%; opacity: 0; }
           }
           .animate-scan-sweep {
             animation: scan-sweep 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
             background: linear-gradient(to bottom, transparent, rgba(56, 189, 248, 0.5), transparent);
             box-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
           }
           @keyframes hologram-enter {
             0% { transform: scale(0.9) translateY(30px) rotateX(10deg); opacity: 0; filter: blur(8px); }
             100% { transform: scale(1) translateY(0) rotateX(0deg); opacity: 1; filter: blur(0px); }
           }
           .hologram-wrapper {
             animation: hologram-enter 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
             transform-origin: center top;
             perspective: 1200px;
           }
           @keyframes grid-fade {
             0% { opacity: 0; transform: scale(1.1); }
             100% { opacity: 0.15; transform: scale(1); }
           }
           .bg-tech-grid {
             background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
             linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
             background-size: 40px 40px;
             animation: grid-fade 1.5s ease-out forwards;
           }
        `}</style>

        <div className="relative w-full h-full flex flex-col items-center justify-start gap-4 pt-4 pointer-events-none">
          
          {/* Tech Grid Background */}
          <div className="absolute inset-0 bg-tech-grid pointer-events-none z-0" />

          {/* Custom Close Button */}
          <button 
            onClick={() => handleOpenChange(false)}
            className={cn(
              "absolute top-4 right-4 md:top-8 md:right-8 z-[60] pointer-events-auto",
              "text-white transition-all duration-300 hover:scale-110 hover:rotate-90 focus:outline-none",
              "drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)]"
            )}
            aria-label="Close resume viewer"
          >
            <X className="w-8 h-8 stroke-[3px]" />
          </button>

          {/* Toolbar */}
          <div className={cn(
            "z-50 flex items-center gap-1 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in-up ring-1 ring-white/5 pointer-events-auto",
            isMobile && "scale-90" // Slightly smaller on mobile
          )}>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomOut} 
              disabled={scale <= 1}
              className="text-white/90 hover:bg-white/20 hover:text-white rounded-full h-9 w-9 transition-colors disabled:opacity-30"
            >
              <ZoomOut size={16} />
            </Button>
            
            {/* Hide percent on mobile to save space */}
            {!isMobile && (
              <span className="text-white font-mono text-xs w-12 text-center font-medium tabular-nums select-none">
                {Math.round(scale * 100)}%
              </span>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomIn} 
              disabled={scale >= 4}
              className="text-white/90 hover:bg-white/20 hover:text-white rounded-full h-9 w-9 transition-colors disabled:opacity-30"
            >
              <ZoomIn size={16} />
            </Button>

            <div className="w-px h-4 bg-white/20 mx-1.5" />

            <Button variant="ghost" size="icon" onClick={handleReset} className="text-white/90 hover:bg-white/20 hover:text-white rounded-full h-9 w-9 transition-colors" title="Reset View">
              <RotateCcw size={16} />
            </Button>

            {/* Desktop Download Button (Icon Only) */}
            {!isMobile && (
              <>
                <div className="w-px h-4 bg-white/20 mx-1.5" />
                <a href={resumePdf} download="Aryan_Sharma_Resume.pdf" title="Download PDF">
                  <Button variant="default" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-9 w-9 shadow-lg shadow-primary/20">
                    <Download size={16} />
                  </Button>
                </a>
              </>
            )}
          </div>

          {/* Viewport Container */}
          <div 
            ref={containerRef}
            className={cn(
              "flex-1 w-full max-w-[95vw] md:max-w-[90vw] overflow-hidden rounded-xl border border-white/10 flex items-center justify-center relative group select-none pointer-events-auto z-10",
              scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            )}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onClick={handleBackgroundClick}
          >
            {/* Holographic Wrapper for Entrance Animation */}
            <div className="hologram-wrapper relative">
              
              {/* Scanning Laser Line */}
              {isScanning && (
                <div className="absolute left-[-10%] right-[-10%] h-1 z-50 pointer-events-none animate-scan-sweep blur-[1px]">
                  <div className="absolute w-full h-full bg-cyan-400/50 blur-sm" />
                  <div className="absolute w-full h-[2px] bg-white/80" />
                </div>
              )}

              {/* Transform Container for Pan/Zoom */}
              <div
                className="will-change-transform shadow-[0_0_50px_rgba(0,0,0,0.5)] origin-center transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                }}
              >
                <img 
                  ref={imgRef}
                  src={resumeImage} 
                  alt="Resume" 
                  className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain rounded bg-white select-none pointer-events-none" 
                  draggable={false}
                />
              </div>
            </div>
            
            {/* Drag Hint (Desktop Only) */}
            {!isMobile && (
              <div className={cn(
                "absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-semibold tracking-widest uppercase pointer-events-none shadow-xl z-40 opacity-0",
                scale > 1 && "animate-pulse opacity-100" 
              )}>
                Drag to Pan
              </div>
            )}
          </div>

          {/* Mobile Floating Download Button */}
          {isMobile && (
            <div className="absolute bottom-10 z-50 w-full flex justify-center pointer-events-auto animate-fade-in-up">
              <a href={resumePdf} download="Aryan_Sharma_Resume.pdf">
                <Button 
                  size="lg" 
                  className="rounded-full gap-2 bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.4)] border-2 border-white/20"
                >
                  <Download size={20} />
                  Download PDF
                </Button>
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeViewer;
