import { useParams, useLocation } from "react-router-dom";
import DynamicSidebar from "@/components/DynamicSidebar";
import { useState, useEffect } from "react";
import FalconViewer from "@/components/FalconViewer";
import ZoomerCFDViewer from "@/components/ZoomerCFDViewer"; 
import MagneticTilt from "@/components/motion/MagneticTilt";
import ImageViewer from "@/components/ImageViewer";
import ProjectLoader from "@/components/ProjectLoader";
import { FileText, Wrench, Code, ChevronDown, Rocket, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types & Data for Zoomer Project ---

interface TradeStudyData {
  config: string;
  speed: string;
  chord: string;
  cd: string;
  image: string;
  isChosen?: boolean;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const returnSection = location.state?.from || 'projects';
  
  // Simulated Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Show loader for 1.5s then fade in content
    const loadTimer = setTimeout(() => setIsLoading(false), 1500);
    const fadeTimer = setTimeout(() => setOpacity(1), 1600);
    
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  // --- Zoomer Specific Data ---
  const zoomerPhase1Data: TradeStudyData[] = [
    { config: "Long Configuration", speed: "Mach 0.373", chord: "3.4 in", cd: "0.437", image: "/zoomer-images/Phase 1/l1_ts_long.png" },
    { config: "Standard Configuration", speed: "Mach 0.373", chord: "3.29 in", cd: "0.338", image: "/zoomer-images/Phase 1/l1_ts_standard.png", isChosen: true },
    { config: "Short Configuration", speed: "Mach 0.373", chord: "3.1 in", cd: "0.449", image: "/zoomer-images/Phase 1/l1_ts_short.png" },
  ];

  const zoomerPhase6Data: TradeStudyData[] = [
    { config: "Long Configuration", speed: "Mach 0.803", chord: "3.4 in", cd: "0.471", image: "/zoomer-images/Phase 6/l2_ts_long.png" },
    { config: "Standard Configuration", speed: "Mach 0.803", chord: "3.29 in", cd: "0.475", image: "/zoomer-images/Phase 6/l2_ts_standard.png", isChosen: true },
    { config: "Short Configuration", speed: "Mach 0.803", chord: "3.1 in", cd: "0.472", image: "/zoomer-images/Phase 6/l2_ts_short.png" },
  ];

  // Helper for rendering Trade Study Cards
  const TradeStudyCard = ({ data }: { data: TradeStudyData }) => (
    <div className={cn("bg-card/50 backdrop-blur border rounded-xl overflow-hidden transition-all duration-300 group", data.isChosen ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]" : "border-white/10 opacity-70 hover:opacity-100")}>
      <div className="relative aspect-video bg-black/20 overflow-hidden">
        <ImageViewer 
          src={data.image} 
          alt={data.config}
          trigger={
            <div className="w-full h-full cursor-zoom-in relative group/img">
              <img src={data.image} alt={data.config} className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover/img:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                <ZoomIn className="text-white drop-shadow-md" />
              </div>
            </div>
          }
        />
        {data.isChosen && <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-lg">SELECTED</div>}
      </div>
      <div className="p-4 space-y-2">
        <h4 className="font-bold text-sm sm:text-base text-white">{data.config}</h4>
        <div className="grid grid-cols-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
          <span>Speed:</span> <span className="text-foreground text-right">{data.speed}</span>
          <span>Root Chord:</span> <span className="text-foreground text-right">{data.chord}</span>
          <span>Drag Coeff:</span> <span className="font-mono text-primary text-right">{data.cd}</span>
        </div>
      </div>
    </div>
  );

  // Helper for Gallery Image Grid
  const GalleryImage = ({ src, alt, caption }: { src: string, alt: string, caption?: string }) => (
    <div className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/20">
      <ImageViewer 
        src={src} 
        alt={alt}
        trigger={
          <div className="cursor-zoom-in overflow-hidden aspect-square">
            <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <ZoomIn className="w-8 h-8 text-white" />
            </div>
          </div>
        }
      />
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur p-2 text-xs text-center text-white/90 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {caption}
        </div>
      )}
    </div>
  );

  // --- RENDER CONTENT ---
  
  if (isLoading) return <ProjectLoader />;

  const projectData: Record<string, any> = {
    "falcon-9-model": { /* ... existing Falcon data ... */ },
    "zoomer-rocket": {
      name: "Zoomer Project Showcase",
      description: "A complete journey from trade studies and modeling to L1/L2 certification flights.",
      logo: "/zoomer-images/Phase 3/zoomer-thumbnail.jpg", 
    },
  };

  const project = projectData[id || ""];

  if (!project && id !== "falcon-9-model") return <div className="min-h-screen flex items-center justify-center">Project not found.</div>;

  // --- ZOOMER ROCKET CUSTOM LAYOUT ---
  if (id === "zoomer-rocket") {
    return (
      <>
        <DynamicSidebar returnSection={returnSection} />
        
        <div className="min-h-screen bg-background text-foreground transition-opacity duration-700" style={{ opacity }}>
          
          {/* 1. HERO SECTION */}
          <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
             {/* Background Image with Overlay */}
             <div className="absolute inset-0 z-0">
               <img src="/zoomer-images/Phase 3/zoomer-thumbnail.jpg" alt="Zoomer Hero" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-background" />
             </div>

             {/* Content */}
             <div className="relative z-10 text-center px-4 space-y-4 max-w-4xl mx-auto mt-20">
               <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl animate-fade-in-up">
                 ZOOMER PROJECT
               </h1>
               <p className="text-lg md:text-2xl text-white/80 font-light max-w-2xl mx-auto animate-fade-in-up delay-100">
                 Tripoli Level 1 & Level 2 Certified High-Power Rocket
               </p>
             </div>

             {/* Bouncing Arrow */}
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-pulse z-20 cursor-pointer" onClick={() => document.getElementById('phase-1')?.scrollIntoView({ behavior: 'smooth' })}>
                <span className="text-xs font-mono uppercase tracking-widest">Scroll to Explore</span>
                <ChevronDown className="w-6 h-6 animate-bounce" />
             </div>
          </section>

          {/* 2. MAIN CONTENT (The 8 Phases) */}
          <div className="container mx-auto max-w-5xl px-4 py-20 space-y-32">
            
            {/* PHASE 1: L1 TRADE STUDY */}
            <section id="phase-1" className="scroll-mt-24 space-y-8">
              <div className="border-l-4 border-primary pl-4">
                <h2 className="text-3xl font-bold text-white mb-1">Phase 1: L1 Analysis</h2>
                <p className="text-muted-foreground">Trade study comparing drag coefficients based on root chord lengths.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {zoomerPhase1Data.map((d, i) => <TradeStudyCard key={i} data={d} />)}
              </div>
            </section>

            {/* PHASE 2: MODELING */}
            <section className="space-y-8">
              <div className="border-l-4 border-blue-500 pl-4">
                 <h2 className="text-3xl font-bold text-white mb-1">Phase 2: Modeling</h2>
                 <p className="text-muted-foreground">Interactive CFD & Design Analysis.</p>
              </div>
              <div className="w-full h-[600px] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <ZoomerCFDViewer />
              </div>
            </section>

            {/* PHASE 3: FABRICATION */}
            <section className="space-y-8">
              <div className="border-l-4 border-amber-500 pl-4">
                 <h2 className="text-3xl font-bold text-white mb-1">Phase 3: Fabrication</h2>
                 <p className="text-muted-foreground">Construction of the airframe, fin can, and avionics assembly.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <GalleryImage src="/zoomer-images/Phase 3/fin_can.jpg" alt="Fin Can" caption="Internal Fin Can Structure" />
                <GalleryImage src="/zoomer-images/Phase 3/gps_module.jpg" alt="Avionics" caption="GPS & Flight Computer" />
                <GalleryImage src="/zoomer-images/Phase 3/zoomer-thumbnail.jpg" alt="Painting" caption="Final Assembly & Painting" />
              </div>
            </section>

            {/* PHASE 4: L1 LAUNCH */}
            <section className="space-y-8">
              <div className="border-l-4 border-green-500 pl-4">
                 <h2 className="text-3xl font-bold text-white mb-1">Phase 4: L1 Launch</h2>
                 <p className="text-muted-foreground">Actual launch day media - Level 1 Certification Flight.</p>
              </div>
              <div className="flex justify-center py-8">
                <MagneticTilt intensity={15} className="w-full max-w-2xl">
                   <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5">
                      <ImageViewer 
                        src="/zoomer-images/Phase 4/launch_day.jpg" 
                        alt="L1 Launch Day"
                        trigger={<img src="/zoomer-images/Phase 4/launch_day.jpg" alt="L1 Launch" className="w-full h-auto cursor-zoom-in" />}
                      />
                      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-green-400 border border-green-500/30">
                        STATUS: SUCCESS
                      </div>
                   </div>
                </MagneticTilt>
              </div>
            </section>

            {/* PHASE 5: L1 RECOVERY */}
            <section className="space-y-8">
               <div className="border-l-4 border-green-500 pl-4">
                 <h2 className="text-3xl font-bold text-white mb-1">Phase 5: Recovery & Cert</h2>
                 <p className="text-muted-foreground">Successful recovery and Level 1 certification award.</p>
               </div>
               <div className="grid md:grid-cols-2 gap-8">
                 <GalleryImage src="/zoomer-images/Phase 5/l1_successful_recovery.jpg" alt="Recovery" caption="Rocket Recovered Intact" />
                 <GalleryImage src="/zoomer-images/Phase 5/l1_tripoli_certificate.jpeg" alt="Certificate" caption="Tripoli L1 Certification" />
               </div>
            </section>

            {/* PHASE 6: L2 TRADE STUDY */}
            <section className="space-y-8">
              <div className="border-l-4 border-purple-500 pl-4">
                <h2 className="text-3xl font-bold text-white mb-1">Phase 6: L2 Upgrade Analysis</h2>
                <p className="text-muted-foreground">Optimizing aerodynamics for higher Mach numbers (Mach ~0.8).</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {zoomerPhase6Data.map((d, i) => <TradeStudyCard key={i} data={d} />)}
              </div>
            </section>

            {/* PHASE 7: L2 LAUNCH */}
            <section className="space-y-8">
              <div className="border-l-4 border-purple-500 pl-4">
                 <h2 className="text-3xl font-bold text-white mb-1">Phase 7: L2 Launch</h2>
                 <p className="text-muted-foreground">Actual launch day media - Level 2 Certification Flight.</p>
              </div>
              <div className="flex justify-center py-8">
                <MagneticTilt intensity={15} className="w-full max-w-2xl">
                   <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5 bg-neutral-900">
                      {/* Note: Placeholder used as no specific Phase 7 image was found in upload list. */}
                      <ImageViewer 
                        src="/zoomer-images/Phase 4/launch_day.jpg" 
                        alt="L2 Launch Day (Placeholder)"
                        trigger={<img src="/zoomer-images/Phase 4/launch_day.jpg" alt="L2 Launch" className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity cursor-zoom-in grayscale hover:grayscale-0" />}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className="text-white/20 text-4xl font-black uppercase rotate-[-15deg] border-4 border-white/20 p-4 rounded-xl">L2 Launch Media</span>
                      </div>
                   </div>
                </MagneticTilt>
              </div>
            </section>

             {/* PHASE 8: L2 RECOVERY */}
             <section className="space-y-8 pb-20">
               <div className="border-l-4 border-purple-500 pl-4">
                 <h2 className="text-3xl font-bold text-white mb-1">Phase 8: L2 Success</h2>
                 <p className="text-muted-foreground">Dual deployment recovery and Level 2 certification award.</p>
               </div>
               <div className="grid md:grid-cols-2 gap-8">
                 <GalleryImage src="/zoomer-images/Phase 8/l2_successful_recovery.jpg" alt="L2 Recovery" caption="Dual Deployment Success" />
                 <GalleryImage src="/zoomer-images/Phase 8/l2_tripoli_certificate.jpeg" alt="L2 Certificate" caption="Tripoli L2 Certification" />
               </div>
            </section>

          </div>
        </div>
      </>
    );
  }

  // --- DEFAULT FALLBACK FOR OTHER PROJECTS (e.g. Falcon 9) ---
  const defaultProject = projectData["falcon-9-model"]; 
  // (Note: In a real app, you'd keep the generic rendering logic here for non-Zoomer projects)
  
  return (
    <>
      <DynamicSidebar returnSection={returnSection} />
      <div className="min-h-screen bg-background transition-opacity duration-700 ease-in-out" style={{ opacity }}>
        <div className="relative h-[350px] sm:h-[450px] md:h-[600px] overflow-hidden ml-12 sm:ml-14 md:ml-16">
          <div className="absolute inset-0 z-10">
            {id === "falcon-9-model" ? <FalconViewer /> : <img src={defaultProject?.logo} className="w-full h-full object-cover" />}
          </div>
        </div>
        {/* ... Rest of generic project detail ... */}
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">{defaultProject?.name}</h1>
            <p className="text-xl text-muted-foreground">{defaultProject?.description}</p>
            {/* Add generic content here if needed for Falcon 9 */}
        </div>
      </div>
    </>
  );
};

export default ProjectDetail;
