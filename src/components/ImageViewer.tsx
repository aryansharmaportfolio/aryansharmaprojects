import React, { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  src: string;
  alt: string;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ImageViewer = ({ src, alt, trigger, isOpen: externalIsOpen, onOpenChange: externalOnOpenChange }: ImageViewerProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? externalOnOpenChange! : setInternalIsOpen;

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
  const handleReset = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

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

  // Wheel Zoom Support
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isOpen || !containerRef.current?.contains(e.target as HTMLElement)) return;
      e.preventDefault();
      const delta = e.deltaY * -0.002;
      const nextScale = Math.min(Math.max(scaleRef.current + delta, 1), 4);
      // Simplify wheel zoom centering for stability
      setScale(nextScale);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
    };
    if (isOpen) document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 border-none bg-transparent shadow-none outline-none [&>button]:!top-8 [&>button]:!right-8 [&>button]:!text-white [&>button]:!bg-black/20 [&>button]:backdrop-blur-md [&>button]:!w-10 [&>button]:!h-10 [&>button]:rounded-full">
        <DialogTitle className="sr-only">Image Viewer</DialogTitle>
        <DialogDescription className="sr-only">{alt}</DialogDescription>

        <div className="relative w-full h-full flex flex-col items-center justify-start gap-4 pt-4 pointer-events-none">
          <div className="z-50 flex items-center gap-1 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={scale <= 1} className="text-white hover:bg-white/20 rounded-full h-9 w-9"><ZoomOut size={16} /></Button>
            <span className="text-white font-mono text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={scale >= 4} className="text-white hover:bg-white/20 rounded-full h-9 w-9"><ZoomIn size={16} /></Button>
            <div className="w-px h-4 bg-white/20 mx-1.5" />
            <Button variant="ghost" size="icon" onClick={handleReset} className="text-white hover:bg-white/20 rounded-full h-9 w-9"><RotateCcw size={16} /></Button>
          </div>

          <div 
            ref={containerRef}
            className={cn("flex-1 w-full max-w-[90vw] overflow-hidden rounded-xl border border-white/10 flex items-center justify-center relative pointer-events-auto", scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onClick={(e) => e.target === containerRef.current && handleOpenChange(false)}
          >
            <div style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }} className="will-change-transform">
              <img ref={imgRef} src={src} alt={alt} className="max-w-[85vw] max-h-[80vh] w-auto h-auto object-contain bg-black/50 shadow-2xl" draggable={false} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
