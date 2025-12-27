import React, { useState, useRef, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCcw, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// Import assets directly
import resumeImage from "@/assets/resume.png"; 
import resumePdf from "@/assets/resume.pdf";

const ResumeViewer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1); 
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const scaleRef = useRef(scale);
  const positionRef = useRef(position);

  useEffect(() => {
    scaleRef.current = scale;
    positionRef.current = position;
  }, [scale, position]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }, 200);
    }
  };

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

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return; 
    
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
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
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* FIXED BUTTON STYLING */}
        <Button 
          variant="outline" 
          className="gap-2 border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300"
        >
          <FileText className="w-5 h-5" />
          Resume
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className={cn(
          "max-w-[95vw] w-full h-[95vh] p-0 border-none bg-transparent shadow-none outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "[&>button]:!top-8 [&>button]:!right-8", 
          "[&>button]:!opacity-100", 
          "[&>button]:!bg-transparent hover:[&>button]:!bg-transparent", 
          "[&>button]:!border-none [&>button]:!ring-0 [&>button]:!outline-none", 
          "[&>button]:text-white",
          "[&>button>svg]:!w-8 [&>button>svg]:!h-8", 
          "[&>button>svg]:!stroke-[3px]", 
          "[&>button]:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]", 
          "hover:[&>button]:drop-shadow-[0_0_15px_rgba(255,255,255,1)]", 
          "[&>button]:transition-transform [&>button]:duration-300 hover:[&>button]:scale-110"
        )}
      >
        <DialogTitle className="sr-only">Resume Viewer</DialogTitle>
        <DialogDescription className="sr-only">Interactive zoomable resume</DialogDescription>

        <div className="relative w-full h-full flex flex-col items-center justify-start gap-4 pt-4 pointer-events-none">
          
          {/* Toolbar */}
          <div className="z-50 flex items-center gap-1 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in-up ring-1 ring-white/5 pointer-events-auto">
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomOut} 
              disabled={scale <= 1}
              className="text-white/90 hover:bg-white/20 hover:text-white rounded-full h-9 w-9 transition-colors disabled:opacity-30"
            >
              <ZoomOut size={16} />
            </Button>
            
            <span className="text-white font-mono text-xs w-12 text-center font-medium tabular-nums select-none">
              {Math.round(scale * 100)}%
            </span>
            
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

            <a href={resumePdf} download="Aryan_Sharma_Resume.pdf" title="Download PDF">
              <Button variant="default" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-9 w-9 ml-1 shadow-lg shadow-primary/20">
                <Download size={16} />
              </Button>
            </a>
          </div>

          {/* Viewport */}
          <div 
            ref={containerRef}
            className={cn(
              "flex-1 w-full max-w-[90vw] overflow-hidden rounded-xl border border-white/10 flex items-center justify-center relative group select-none pointer-events-auto",
              scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            )}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onClick={handleBackgroundClick}
          >
            <div
              className="will-change-transform shadow-2xl origin-center transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
            >
              <img 
                ref={imgRef}
                src={resumeImage} 
                alt="Resume" 
                className="max-w-[85vw] max-h-[80vh] w-auto h-auto object-contain rounded shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white select-none pointer-events-none" 
                draggable={false}
              />
            </div>
            
            <div className={cn(
              "absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-semibold tracking-widest uppercase pointer-events-none shadow-xl z-40",
              "animate-pulse" 
            )}>
              Scroll to Zoom • Drag to Pan
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeViewer;
