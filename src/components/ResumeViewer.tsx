import { useState, useRef, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCcw, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// Import both files from assets to ensure they load correctly
import resumeImage from "@/assets/resume.png"; 
import resumePdf from "@/assets/resume.pdf";

const ResumeViewer = () => {
  const [scale, setScale] = useState(1); // Default scale 1 (100%)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset view when closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }, 200);
    }
  };

  // 1. BOUNDARY LOGIC: Calculate max drag allowed based on current zoom
  const getBoundaries = (currentScale: number) => {
    if (!containerRef.current || !imgRef.current) return { x: 0, y: 0 };
    
    const container = containerRef.current.getBoundingClientRect();
    const img = imgRef.current.getBoundingClientRect();
    
    // Calculate how much the image overflows the container
    // (Image Dimension / Scale) gives original size, then * Scale gives current size
    // We use offsetWidth to get the rendered size before transform for stable calculation base
    const imgWidth = imgRef.current.offsetWidth * currentScale;
    const imgHeight = imgRef.current.offsetHeight * currentScale;

    const overflowX = (imgWidth - container.width) / 2;
    const overflowY = (imgHeight - container.height) / 2;

    // If image is smaller than container, drag is 0. Otherwise, limit to overflow.
    return {
      x: Math.max(0, overflowX),
      y: Math.max(0, overflowY)
    };
  };

  // ZOOM CONTROLS (Min 100%, Max 400%)
  const updateScale = (newScale: number) => {
    const clampedScale = Math.min(Math.max(newScale, 1), 4);
    setScale(clampedScale);
    
    // If zooming out, check if we need to snap position back to boundaries
    if (clampedScale < scale) {
      const bounds = getBoundaries(clampedScale);
      setPosition(prev => ({
        x: Math.max(-bounds.x, Math.min(bounds.x, prev.x)),
        y: Math.max(-bounds.y, Math.min(bounds.y, prev.y))
      }));
    }
    
    // If reset to 100%, center perfectly
    if (clampedScale === 1) setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => updateScale(scale + 0.5);
  const handleZoomOut = () => updateScale(scale - 0.5);
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // DRAG LOGIC
  const onMouseDown = (e: React.MouseEvent) => {
    // Only allow drag if zoomed in
    if (scale <= 1) return;
    
    e.preventDefault();
    setIsDragging(true);
    // Record where the mouse is relative to the current image position
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

    // Clamp position to boundaries so no "black void"
    setPosition({
      x: Math.max(-bounds.x, Math.min(bounds.x, rawX)),
      y: Math.max(-bounds.y, Math.min(bounds.y, rawY)),
    });
  };

  const onMouseUp = () => setIsDragging(false);

  // WHEEL ZOOM (No Ctrl required)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Sensitivity factor
      const delta = e.deltaY * -0.002; 
      const nextScale = Math.min(Math.max(scale + delta, 1), 4);
      
      setScale(nextScale);

      // Auto-center if hitting 100%
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [scale]); // Re-bind when scale changes to keep logic fresh

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
      
      <DialogContent className="max-w-[95vw] w-full h-[92vh] p-0 border-none bg-transparent shadow-none outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <DialogTitle className="sr-only">Resume Viewer</DialogTitle>
        <DialogDescription className="sr-only">Interactive zoomable resume</DialogDescription>

        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
          
          {/* --- TOOLBAR --- */}
          <div className="absolute top-6 z-50 flex items-center gap-1 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in-up ring-1 ring-white/5">
            
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

            {/* DOWNLOAD BUTTON: Points to the imported PDF variable */}
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

          {/* --- VIEWPORT --- */}
          <div 
            ref={containerRef}
            className={cn(
              "w-full h-full overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-sm flex items-center justify-center relative group",
              scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            )}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

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
                // Added max-width/height constraints to ensure it fits initially
                className="max-w-[85vw] max-h-[85vh] w-auto h-auto object-contain rounded shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white select-none pointer-events-none" 
                draggable={false}
              />
            </div>
            
            {/* HINT OVERLAY: Removed group-hover logic so it stays visible */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-semibold tracking-widest uppercase pointer-events-none animate-pulse shadow-xl z-40">
              Scroll to Zoom • Drag to Pan
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeViewer;
