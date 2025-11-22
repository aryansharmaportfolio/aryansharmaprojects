import { useState, useRef, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCcw, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResumeViewerProps {
  trigger?: React.ReactNode;
}

const ResumeViewer = ({ trigger }: ResumeViewerProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom when closed/opened
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }, 200);
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const onMouseUp = () => setIsDragging(false);

  // Add wheel support for zooming
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 group border-2 border-foreground text-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300">
            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Resume
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 border-none bg-transparent shadow-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        
        {/* Accessibility Titles (Hidden visually but required) */}
        <DialogTitle className="sr-only">Resume Viewer</DialogTitle>
        <DialogDescription className="sr-only">An interactive view of Aryan Sharma's resume</DialogDescription>

        {/* Main Viewer Container */}
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          
          {/* Toolbar */}
          <div className="absolute top-4 z-50 flex items-center gap-2 p-2 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl animate-fade-in-up">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white hover:bg-white/20 rounded-full h-10 w-10">
              <ZoomOut size={18} />
            </Button>
            <span className="text-white/80 text-xs font-mono w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white hover:bg-white/20 rounded-full h-10 w-10">
              <ZoomIn size={18} />
            </Button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <Button variant="ghost" size="icon" onClick={handleReset} className="text-white hover:bg-white/20 rounded-full h-10 w-10" title="Reset View">
              <RotateCcw size={18} />
            </Button>
            <a href="/resume.pdf" download="Aryan_Sharma_Resume.pdf">
              <Button variant="default" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-10 w-10 ml-1">
                <Download size={18} />
              </Button>
            </a>
            <div className="w-px h-4 bg-white/20 mx-1" />
            {/* Custom Close Button inside toolbar */}
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon" className="rounded-full h-10 w-10 opacity-80 hover:opacity-100">
                <X size={18} />
              </Button>
            </DialogTrigger>
          </div>

          {/* Image Area */}
          <div 
            ref={containerRef}
            className="w-full h-full overflow-hidden bg-black/90 rounded-xl border border-white/10 backdrop-blur-sm cursor-grab active:cursor-grabbing flex items-center justify-center"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <div
              className="transition-transform duration-75 ease-linear will-change-transform shadow-2xl"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
            >
              {/* Replace with your actual Resume Image path */}
              <img 
                src="/resume.png" 
                alt="Aryan Sharma Resume" 
                className="max-h-[85vh] w-auto object-contain rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white"
                draggable={false}
              />
            </div>
          </div>
          
          <div className="absolute bottom-6 text-white/40 text-xs font-light tracking-widest uppercase pointer-events-none animate-pulse">
            Scroll to Zoom • Drag to Pan
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeViewer;
