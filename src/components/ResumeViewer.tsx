import { useState, useRef, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCcw, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// Import assets directly
import resumeImage from "@/assets/resume.png"; 
import resumePdf from "@/assets/resume.pdf";

const ResumeViewer = () => {
  const [scale, setScale] = useState(1); 
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
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

  // Reset view when closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }, 200);
    }
  };

  // Helper: Calculate boundaries based on a specific scale
  const getBoundaries = (currentScale: number) => {
    if (!containerRef.current || !imgRef.current) return { x: 0, y: 0 };
    
    const container = containerRef.current.getBoundingClientRect();
    // We use offsetWidth to get the base size, then multiply by scale
    const imgWidth = imgRef.current.offsetWidth * currentScale;
    const imgHeight = imgRef.current.offsetHeight * currentScale;

    const overflowX = (imgWidth - container.width) / 2;
    const overflowY = (imgHeight - container.height) / 2;

    return {
      x: Math.max(0, overflowX),
      y: Math.max(0, overflowY)
    };
  };

  // Unified Zoom Logic (Used by both Wheel and Buttons)
  const applyZoom = (newScale: number) => {
    const clampedScale = Math.min(Math.max(newScale, 1), 4);
    
    // Calculate new position to ensure we don't end up in the void
    const bounds = getBoundaries(clampedScale);
    const currentPos = positionRef.current;
    
    const clampedX = Math.max(-bounds.x, Math.min(bounds.x, currentPos.x));
    const clampedY = Math.max(-bounds.y, Math.min(bounds.y, currentPos.y));

    setScale(clampedScale);
    setPosition({ x: clampedX, y: clampedY }); // Snap position to new boundaries
    
    // Auto-center if hitting 100%
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
    if (scale <= 1) return; // Lock drag at 100%
    
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

    // Hard stop at boundaries (No void dragging)
    setPosition({
      x: Math.max(-bounds.x, Math.min(bounds.x, rawX)),
      y: Math.max(-bounds.y, Math.min(bounds.y, rawY)),
    });
  };

  const onMouseUp = () => setIsDragging(false);

  // Wheel Zoom - Self-contained with refs to avoid stale closures
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const currentScale = scaleRef.current;
      const currentPos = positionRef.current;
      const delta = e.deltaY * -0.002; 
      const nextScale = Math.min(Math.max(currentScale + delta, 1), 4);

      // Calculate boundaries for new scale
      if (!containerRef.current || !imgRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const imgWidth = imgRef.current.offsetWidth * nextScale;
      const imgHeight = imgRef.current.offsetHeight * nextScale;
      const overflowX = Math.max(0, (imgWidth - containerRect.width) / 2);
      const overflowY = Math.max(0, (imgHeight - containerRect.height) / 2);

      // Clamp position to new boundaries
      const clampedX = Math.max(-overflowX, Math.min(overflowX, currentPos.x));
      const clampedY = Math.max(-overflowY, Math.min(overflowY, currentPos.y));

      setScale(nextScale);
      setPosition(nextScale === 1 ? { x: 0, y: 0 } : { x: clampedX, y: clampedY });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-2 border-foreground text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
        >
          <FileText className="w-5 h-5" />
          Resume
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 border-none bg-transparent shadow-none outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <DialogTitle className="sr-only">Resume Viewer</DialogTitle>
        <DialogDescription className="sr-only">Interactive zoomable resume</DialogDescription>

        <div className="relative w-full h-full flex flex-col items-center justify-start gap-4 pt-4">
          
          {/* Toolbar - Above resume */}
          <div className="z-50 flex items-center gap-1 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in-up ring-1 ring-white/5">
            
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

            <div className="w-px h-4 bg-white/20 mx-1.5" />

            <DialogTrigger asChild>
              <Button variant="destructive" size="icon" className="rounded-full h-9 w-9 opacity-90 hover:opacity-100 shadow-lg">
                <X size={16} />
              </Button>
            </DialogTrigger>
          </div>

          {/* Viewport with transparent background */}
          <div 
            ref={containerRef}
            className={cn(
              "flex-1 w-full max-w-[90vw] overflow-hidden rounded-xl border border-white/10 flex items-center justify-center relative group select-none",
              scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            )}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
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
            
            {/* Pulse Hint */}
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
