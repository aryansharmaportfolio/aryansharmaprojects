import { useParams, useLocation } from "react-router-dom";
import DynamicSidebar from "@/components/DynamicSidebar";
import { useState, useEffect, useRef } from "react";
import FalconViewer from "@/components/FalconViewer";
import ZoomerCFDViewer from "@/components/ZoomerCFDViewer";
import MagneticTilt from "@/components/motion/MagneticTilt";
import ImageViewer from "@/components/ImageViewer";
import { ChevronDown, ZoomIn, Play, Pause, Volume2, VolumeX, Rocket, Wrench, Code, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// --- All Zoomer Images for Preloading ---
const ZOOMER_IMAGES = [
  "/zoomer-images/phase-1/l1_ts_long.png",
  "/zoomer-images/phase-1/l1_ts_standard.png",
  "/zoomer-images/phase-1/l1_ts_short.png",
  "/zoomer-images/phase-3/fin_can.jpg",
  "/zoomer-images/phase-3/gps_module.jpg",
  "/zoomer-images/phase-3/zoomer-thumbnail.jpg",
  "/zoomer-images/phase-4/launch_day.jpg",
  "/zoomer-images/phase-5/l1_successful_recovery.jpg",
  "/zoomer-images/phase-5/l1_tripoli_certificate.jpeg",
  "/zoomer-images/phase-6/l2_ts_long.png",
  "/zoomer-images/phase-6/l2_ts_standard.png",
  "/zoomer-images/phase-6/l2_ts_short.png",
  "/zoomer-images/phase-8/l2_successful_recovery.jpg",
  "/zoomer-images/phase-8/l2_tripoli_certificate.jpeg",
];

// --- Preload Images Helper ---
const preloadImages = (urls: string[]): Promise<void[]> => {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve even on error to not block
          img.src = url;
        })
    )
  );
};

// --- Asset Loader Component ---
const AssetLoader = () => (
  <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
    <div className="relative flex flex-col items-center">
      <div className="relative flex items-center justify-center w-24 h-24 mb-8">
         {/* Pulse Effect */}
         <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse" />
         {/* Glassmorphism Circle */}
         <div className="relative flex items-center justify-center w-full h-full rounded-full border-2 border-white/10 bg-white/5 backdrop-blur-sm">
            <Rocket className="w-10 h-10 text-white animate-pulse" strokeWidth={1.5} />
         </div>
      </div>
    </div>
  </div>
);

// --- Types & Data for Zoomer Project ---

interface TradeStudyData {
  config: string;
  speed: string;
  chord: string;
  cd: string;
  image: string;
  isChosen?: boolean;
}

// --- PHASE COMPONENT ---
interface PhaseProps {
  id?: string;
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}

const Phase = ({ id, title, subtitle, color, children }: PhaseProps) => (
  <motion.section
    id={id}
    className="scroll-mt-24 space-y-8"
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className={`border-l-4 pl-4`} style={{ borderColor: color }}>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{title}</h2>
      <p className="text-muted-foreground text-sm sm:text-base">{subtitle}</p>
    </div>
    {children}
  </motion.section>
);

// --- VIDEO PLAYER COMPONENT (Updated with Auto-Pause & Auto-Resume) ---
interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string; 
}

const VideoPlayer = ({ src, poster, className }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Auto-Play/Pause Logic using IntersectionObserver
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Video is IN view (at least 50%)
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
              })
              .catch((error) => {
                // Auto-play was prevented (often due to browser policies if unmuted)
                console.log("Autoplay prevented:", error);
                setIsPlaying(false);
              });
          }
        } else {
          // Video is OUT of view
          if (!video.paused) {
            video.pause();
            setIsPlaying(false);
          }
        }
      },
      {
        threshold: 0.5, // Trigger when 50% of the video is visible
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5 bg-black group",
        className 
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={isMuted}
        loop
        playsInline
        className="w-full h-full object-cover" 
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play/Pause Overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300 cursor-pointer",
          !isPlaying ? "bg-black/40" : "bg-transparent",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
        onClick={togglePlay}
      >
        {!isPlaying && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"
          >
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </motion.div>
        )}
      </div>

      {/* Controls Bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-green-400 border border-green-500/30">
        STATUS: SUCCESS
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const returnSection = location.state?.from || "projects";

  // Asset Preloading State
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [opacity, setOpacity] = useState(0);

  // Hero parallax scroll - use window scroll instead of target ref to avoid hydration issues
  const { scrollY } = useScroll();
  
  // Transform based on first viewport height (hero section)
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const heroY = useTransform(scrollY, [0, 800], [0, 150]);
  const smoothHeroY = useSpring(heroY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    // Preload all Zoomer images if viewing Zoomer project
    if (id === "zoomer-rocket") {
      preloadImages(ZOOMER_IMAGES).then(() => {
        setAssetsLoaded(true);
        setTimeout(() => setOpacity(1), 100);
      });
    } else {
      // For other projects, no heavy preloading needed
      setAssetsLoaded(true);
      setTimeout(() => setOpacity(1), 100);
    }
  }, [id]);

  // --- Zoomer Specific Data (with fixed paths) ---
  const zoomerPhase1Data: TradeStudyData[] = [
    { config: "Long Configuration", speed: "Mach 0.373", chord: "3.4 in", cd: "0.437", image: "/zoomer-images/phase-1/l1_ts_long.png" },
    { config: "Standard Configuration", speed: "Mach 0.373", chord: "3.29 in", cd: "0.338", image: "/zoomer-images/phase-1/l1_ts_standard.png", isChosen: true },
    { config: "Short Configuration", speed: "Mach 0.373", chord: "3.1 in", cd: "0.449", image: "/zoomer-images/phase-1/l1_ts_short.png" },
  ];

  const zoomerPhase6Data: TradeStudyData[] = [
    { config: "Long Configuration", speed: "Mach 0.803", chord: "3.4 in", cd: "0.471", image: "/zoomer-images/phase-6/l2_ts_long.png" },
    { config: "Standard Configuration", speed: "Mach 0.803", chord: "3.29 in", cd: "0.475", image: "/zoomer-images/phase-6/l2_ts_standard.png", isChosen: true },
    { config: "Short Configuration", speed: "Mach 0.803", chord: "3.1 in", cd: "0.472", image: "/zoomer-images/phase-6/l2_ts_short.png" },
  ];

  // Helper for rendering Trade Study Cards
  const TradeStudyCard = ({ data }: { data: TradeStudyData }) => (
    <motion.div
      className={cn(
        "bg-card/50 backdrop-blur border rounded-xl overflow-hidden transition-all duration-300 group",
        data.isChosen
          ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]"
          : "border-white/10 opacity-70 hover:opacity-100"
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-video bg-black/20 overflow-hidden">
        <ImageViewer
          src={data.image}
          alt={data.config}
          trigger={
            <div className="w-full h-full cursor-zoom-in relative group/img">
              <img
                src={data.image}
                alt={data.config}
                className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover/img:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                <ZoomIn className="text-white drop-shadow-md" />
              </div>
            </div>
          }
        />
        {data.isChosen && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-lg">
            SELECTED
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h4 className="font-bold text-sm sm:text-base text-white">{data.config}</h4>
        <div className="grid grid-cols-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
          <span>Speed:</span> <span className="text-foreground text-right">{data.speed}</span>
          <span>Root Chord:</span> <span className="text-foreground text-right">{data.chord}</span>
          <span>Drag Coeff:</span> <span className="font-mono text-primary text-right">{data.cd}</span>
        </div>
      </div>
    </motion.div>
  );

  // Helper for Gallery Image Grid
  const GalleryImage = ({ src, alt, caption }: { src: string; alt: string; caption?: string }) => (
    <motion.div
      className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/20"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <ImageViewer
        src={src}
        alt={alt}
        trigger={
          <div className="cursor-zoom-in overflow-hidden aspect-square">
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
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
    </motion.div>
  );

  // --- Show Loader While Assets Load ---
  if (!assetsLoaded) return <AssetLoader />;

  // --- RENDER CONTENT ---

  // --- ZOOMER ROCKET CUSTOM LAYOUT ---
  if (id === "zoomer-rocket") {
    return (
      <>
        <DynamicSidebar returnSection={returnSection} />

        <div className="min-h-screen bg-background text-foreground transition-opacity duration-700" style={{ opacity }}>
          {/* 1. HERO SECTION with Parallax */}
          <section className="relative h-screen w-full overflow-hidden">
            {/* Background Image with Parallax */}
            <motion.div
              className="absolute inset-0 z-0"
              style={{ opacity: heroOpacity, scale: heroScale, y: smoothHeroY }}
            >
              <img
                src="/zoomer-images/phase-3/zoomer-thumbnail.jpg"
                alt="Zoomer Hero"
                className="w-full h-full object-cover"
              />
              {/* Seamless gradient transition to content - matching main hero to about me */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </motion.div>

            {/* Content - Optimized for mobile viewing */}
            <motion.div
              className="relative z-10 h-full flex flex-col items-center justify-end pb-24 sm:pb-32 md:justify-center md:pb-0 px-4"
              style={{ opacity: heroOpacity }}
            >
              {/* Bouncing Arrow - Positioned for mobile */}
              <motion.div
                className="flex flex-col items-center gap-2 sm:gap-4 z-20 cursor-pointer"
                onClick={() => document.getElementById("phase-1")?.scrollIntoView({ behavior: "smooth" })}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-white font-bold text-xs sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] animate-pulse drop-shadow-xl uppercase">
                  Scroll to Explore
                </p>
                <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-bounce drop-shadow-xl" strokeWidth={2.5} />
              </motion.div>
            </motion.div>
          </section>

          {/* 2. MAIN CONTENT (The 8 Phases) */}
          <div className="container mx-auto max-w-5xl px-4 py-20 space-y-32">
            {/* PHASE 1: L1 TRADE STUDY */}
            <Phase id="phase-1" title="Phase 1: L1 Analysis" subtitle="Trade study comparing drag coefficients based on root chord lengths for (Mach ~0.373)." color="hsl(var(--primary))">
              <div className="grid md:grid-cols-3 gap-6">
                {zoomerPhase1Data.map((d, i) => (
                  <TradeStudyCard key={i} data={d} />
                ))}
              </div>
            </Phase>

            {/* PHASE 2: MODELING - Responsive height */}
            <Phase title="Phase 2: Modeling" subtitle="Modeled in SolidWorks, click below to explore the 3D model." color="#3b82f6">
              <div className="w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <ZoomerCFDViewer />
              </div>
            </Phase>

            {/* PHASE 3: FABRICATION */}
            <Phase title="Phase 3: Fabrication" subtitle="Construction of the nose cone, fin can, and airframe." color="#f59e0b">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <GalleryImage src="/zoomer-images/phase-3/fin_can.jpg" alt="Fin Can" caption="Fin Can Assembly" />
                <GalleryImage src="/zoomer-images/phase-3/gps_module.jpg" alt="Avionics" caption="GPS Module" />
                <GalleryImage src="/zoomer-images/phase-3/zoomer-thumbnail.jpg" alt="Painting" caption="Painted and Fully Assembled" />
              </div>
            </Phase>

            {/* PHASE 4: L1 LAUNCH (FIXED: Side-by-Side & Shortened) */}
            <Phase title="Phase 4: L1 Launch" subtitle="Level 1 Certification Flight (Austin, TX)." color="#22c55e">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Launch Photo with Tilt */}
                <MagneticTilt intensity={12} className="w-full">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5 h-64 md:h-80">
                    <ImageViewer
                      src="/zoomer-images/phase-4/launch_day.jpg"
                      alt="L1 Launch Day"
                      trigger={
                        <img
                          src="/zoomer-images/phase-4/launch_day.jpg"
                          alt="L1 Launch"
                          className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-500"
                        />
                      }
                    />
                    {/* STATUS SUCCESS BOX REMOVED HERE */}
                  </div>
                </MagneticTilt>

                {/* Launch Video */}
                <MagneticTilt intensity={12} className="w-full">
                  <VideoPlayer
                    src="/zoomer-images/phase-4/launch_video_l1.mp4"
                    poster="/zoomer-images/phase-4/launch_day.jpg"
                    className="h-64 md:h-80 w-full"
                  />
                </MagneticTilt>
              </div>
            </Phase>

            {/* PHASE 5: L1 RECOVERY */}
            <Phase title="Phase 5: L1 Success" subtitle="Successful recovery and Level 1 certification award." color="#22c55e">
              <div className="grid md:grid-cols-2 gap-8">
                <GalleryImage src="/zoomer-images/phase-5/l1_successful_recovery.jpg" alt="Recovery" caption="Successful Recovery" />
                <GalleryImage src="/zoomer-images/phase-5/l1_tripoli_certificate.jpeg" alt="Certificate" caption="Tripoli L1 Certification" />
              </div>
            </Phase>

            {/* PHASE 6: L2 TRADE STUDY */}
            <Phase title="Phase 6: L2 Upgrade Analysis" subtitle="Trade study comparing drag coefficients based on root chord lengths for higher Mach number (Mach ~0.803)." color="#a855f7">
              <div className="grid md:grid-cols-3 gap-6">
                {zoomerPhase6Data.map((d, i) => (
                  <TradeStudyCard key={i} data={d} />
                ))}
              </div>
            </Phase>

            {/* PHASE 7: L2 LAUNCH (with Tilt + Video) */}
            <Phase title="Phase 7: L2 Launch" subtitle="Level 2 Certification Flight (Hearne, TX)." color="#a855f7">
              <div className="flex justify-center py-4">
                <MagneticTilt intensity={8} className="w-full max-w-2xl">
                  <VideoPlayer
                    src="/zoomer-images/phase-7/launch_video_l2.mp4"
                    poster="/zoomer-images/phase-3/zoomer-thumbnail.jpg"
                  />
                </MagneticTilt>
              </div>
            </Phase>

            {/* PHASE 8: L2 RECOVERY */}
            <Phase title="Phase 8: L2 Success" subtitle="Successful recovery and Level 2 certification award." color="#a855f7">
              <div className="grid md:grid-cols-2 gap-8 pb-20">
                <GalleryImage src="/zoomer-images/phase-8/l2_successful_recovery.jpg" alt="L2 Recovery" caption="Successful Recovery" />
                <GalleryImage src="/zoomer-images/phase-8/l2_tripoli_certificate.jpeg" alt="L2 Certificate" caption="Tripoli L2 Certification" />
              </div>
            </Phase>
          </div>
        </div>
      </>
    );
  }

  // --- FALCON 9 PROJECT (with Summary/Tech/Skills restored and STYLED like ClubDetail) ---
  const falconProject = {
    name: "Falcon 9-Inspired 3D Model",
    description: "A detailed SolidWorks model inspired by SpaceX's Falcon 9 rocket.",
    technologies: ["SolidWorks"],
    skills: ["CAD Modeling", "Engineering Design"],
    summary: [
      "Designed a detailed scale model of the Falcon 9 launch vehicle, focusing on accuracy and printability.",
      "Utilized advanced SolidWorks features including lofting and shelling to create complex aerodynamic surfaces.",
      "Engineered the assembly to be modular, allowing for the separation of stages and payload fairing.",
      "Sketched the model on a publicly available recreation of the falcon 9 blueprint created by Ryan Steven Horowitz.",
    ],
    referenceImages: [
      { src: "/falcon-images/falcon-blueprint.jpg", alt: "Falcon 9 Blueprint", credit: "Credit: Ryan Steven Horowitz" },
      { src: "/falcon-images/falcon-diagram.jpg", alt: "Falcon 9 Diagram" },
    ],
  };

  return (
    <>
      <DynamicSidebar returnSection={returnSection} />
      <div className="min-h-screen bg-background transition-opacity duration-700 ease-in-out" style={{ opacity }}>
        {/* 3D Viewer - Optimized heights for mobile */}
        <div className="relative h-[280px] sm:h-[380px] md:h-[500px] lg:h-[600px] overflow-hidden ml-10 sm:ml-12 md:ml-14 lg:ml-16">
          <div className="absolute inset-0 z-10">
            <FalconViewer />
          </div>
        </div>

        {/* Project Info with Summary/Tech/Skills - Better mobile margins */}
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-6xl ml-10 sm:ml-12 md:ml-14 lg:ml-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{falconProject.name}</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12">{falconProject.description}</p>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Column: Summary */}
            <div className="space-y-6">
              {/* Styled Header matching ClubDetail */}
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground border-l-4 border-primary pl-3">
                  Summary
                </h2>
              </div>
              
              {/* Styled List matching ClubDetail */}
              <ul className="space-y-4">
                {falconProject.summary.map((item, i) => (
                  <li key={i} className="flex gap-4 text-foreground/90 leading-relaxed">
                    <span className="text-primary mt-1">▸</span>
                    <p className="text-base sm:text-lg">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Technologies & Skills */}
            <div className="space-y-10">
              
              {/* Technologies Used */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground border-l-4 border-primary pl-3">
                    Technologies Used
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {falconProject.technologies.map((tech) => (
                    <span
                      key={tech}
                      // UPDATED CLASSES: Light grey bg, black text
                      className="px-4 py-2 bg-gray-200 border border-gray-300 rounded-full text-sm font-medium text-black hover:bg-gray-300 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills Used */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                     <Code className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground border-l-4 border-primary pl-3">
                    Skills Used
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {falconProject.skills.map((skill) => (
                    <span
                      key={skill}
                      // UPDATED CLASSES: Light grey bg, black text
                      className="px-4 py-2 bg-gray-200 border border-gray-300 rounded-full text-sm font-medium text-black hover:bg-gray-300 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reference Section with MagneticTilt Images - Fixed mobile layout */}
          <div className="py-8 sm:py-12 max-w-6xl -ml-10 sm:-ml-12 md:-ml-14 lg:-ml-16">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg border border-primary/20">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground border-l-4 border-primary pl-2 sm:pl-3">
                References
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {falconProject.referenceImages.map((img, i) => (
                <MagneticTilt key={i} intensity={6}>
                  <div className="flex flex-col">
                    <ImageViewer
                      src={img.src}
                      alt={img.alt}
                      trigger={
                        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white/5 shadow-2xl cursor-zoom-in group h-40 sm:h-48 md:h-56 lg:h-64">
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <ZoomIn className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      }
                    />
                    {/* Credit caption badge styled like club card dates */}
                    {img.credit && (
                      <div className="mt-2 sm:mt-3 self-start">
                        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                          <p className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                            {img.credit}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </MagneticTilt>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetail;
