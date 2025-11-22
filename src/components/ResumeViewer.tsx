import { useState, useRef, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCcw, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// Import the image from assets so the path is guaranteed to be correct
import resumeImage from "@/assets/resume.png"; 

const ResumeViewer = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }, 200);
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 4));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
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
      
      <DialogContent className="max-w-[95vw] w-full h-[92vh] p-0 border-none bg-transparent shadow-none outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <DialogTitle className="sr-only">Resume Viewer</DialogTitle>
        <DialogDescription className="sr-only">Interactive zoomable resume</DialogDescription>

        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
          
          {/* Toolbar */}
          <div className="absolute top-6 z-50 flex items-center gap-1 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in-up ring-1 ring-white/5">
            
            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white/90 hover:bg-white/20 hover:text-white rounded-full h-9 w-9 transition-colors">
              <ZoomOut size={16} />
            </Button>
            
            <span className="text-white font-mono text-xs w-12 text-center font-medium tabular-nums select-none">
              {Math.round(scale * 100)}%
            </span>
            
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white/90 hover:bg-white/20 hover:text-white rounded-full h-9 w-9 transition-colors">
              <ZoomIn size={16} />
            </Button>

            <div className="w-px h-4 bg-white/20 mx-1.5" />

            <Button variant="ghost" size="icon" onClick={handleReset} className="text-white/90 hover:bg-white/20 hover:text-white rounded-full h-9 w-9 transition-colors" title="Reset View">
              <RotateCcw size={16} />
            </Button>

            {/* Note: This still points to public/resume.pdf for the download action. 
                Keep your resume.pdf in the public folder! */}
            <a href="/resume.pdf" download="Aryan_Sharma_Resume.pdf" title="Download PDF">
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

          {/* Viewer Area */}
          <div 
            ref={containerRef}
            className="w-full h-full overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-sm cursor-grab active:cursor-grabbing flex items-center justify-center relative group"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div
              className="transition-transform duration-100 ease-out will-change-transform shadow-2xl origin-center"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
            >
              {/* The actual Image - using the imported variable now */}
              <img 
                src={resumeImage} 
                alt="Resume" 
                className="max-w-[85vw] max-h-[85vh] h-auto w-auto object-contain rounded shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white select-none pointer-events-none" 
              />
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-white/50 text-[10px] font-medium tracking-widest uppercase pointer-events-none transition-opacity duration-500 group-hover:opacity-0">
              Scroll to Zoom • Drag to Pan
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeViewer;
