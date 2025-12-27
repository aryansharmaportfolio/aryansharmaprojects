import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Rocket, ChevronDown } from "lucide-react";
import { VERTEX_SHADER, FRAGMENT_SHADER } from "@/lib/shaders";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // STATE
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // CONFIGURATION
  const frameCount = 136; 
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const requestRef = useRef<number | null>(null);

  // WEBGL REFS
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // 1. PRELOAD IMAGES
  useEffect(() => {
    let loadedCount = 0;
    const imageArray: HTMLImageElement[] = [];

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const fileName = `ezgif-frame-${i.toString().padStart(3, "0")}.jpg`;
      img.src = `/hero-frames/${fileName}`;
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) setTimeout(() => setIsLoaded(true), 500);
      };
      img.onerror = () => {
        loadedCount++; 
        if (loadedCount === frameCount) setIsLoaded(true);
      };
      imageArray.push(img);
    }
    imagesRef.current = imageArray;
  }, []);

  // 2. INITIALIZE WEBGL (The Engine)
  useEffect(() => {
    if (!canvasRef.current) return;

    const gl = canvasRef.current.getContext("webgl");
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }
    glRef.current = gl;

    // Compile Shaders
    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);
    programRef.current = program;

    // Create Full Screen Quad (2 Triangles)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Create Texture Container
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set texture parameters for smooth scaling (Linear)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textureRef.current = texture;

  }, []); // Run once on mount

  // 3. THE RENDER LOOP
  useEffect(() => {
    if (!isLoaded || !glRef.current || !programRef.current || !textureRef.current) return;

    const gl = glRef.current;
    const program = programRef.current;
    
    // Cache uniform locations to save CPU cycles
    const uScrollLoc = gl.getUniformLocation(program, "uScroll");
    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uResolutionLoc = gl.getUniformLocation(program, "uResolution");

    const render = () => {
      const container = containerRef.current;
      if (!container) return;

      // Scroll Math
      const scrollableDistance = container.scrollHeight - window.innerHeight;
      const rawProgress = window.scrollY / scrollableDistance;
      const progress = Math.min(Math.max(rawProgress, 0), 1);
      setScrollProgress(progress);

      // --- OPTIMIZATION: Heavy Culling ---
      if (rawProgress > 1.2) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      // 1. Get Current Image Frame
      if (imagesRef.current.length > 0) {
        const frameIndex = Math.min(
          frameCount - 1,
          Math.floor(progress * (frameCount - 1))
        );
        const img = imagesRef.current[frameIndex];

        if (img && img.complete && img.naturalWidth > 0) {
           // 2. RESIZE CANVAS
           if (canvasRef.current) {
             const displayWidth = window.innerWidth;
             const displayHeight = window.innerHeight;
             if (canvasRef.current.width !== displayWidth || canvasRef.current.height !== displayHeight) {
                canvasRef.current.width = displayWidth;
                canvasRef.current.height = displayHeight;
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
             }
           }

           // 3. UPLOAD TEXTURE TO GPU
           gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
           gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

           // 4. UPDATE UNIFORMS
           gl.uniform1f(uScrollLoc, progress);
           gl.uniform1f(uTimeLoc, (Date.now() - startTimeRef.current) / 1000.0);
           gl.uniform2f(uResolutionLoc, gl.drawingBufferWidth, gl.drawingBufferHeight);

           // 5. DRAW
           gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      }
      requestRef.current = requestAnimationFrame(render);
    };

    render();
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isLoaded]);

  // CSS Transforms for Title
  const textOpacity = Math.max(0, 1 - scrollProgress * 3);

  return (
    <div className="relative w-full">
      {/* SCROLL SPACER */}
      <div ref={containerRef} className="h-[300vh] w-full pointer-events-none" />

      {/* FIXED LAYER */}
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden bg-[#2b2b2b]">
        
        {/* Loading Overlay */}
        <div 
          className={cn(
            "absolute inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-1000",
            isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
            <div className="relative flex flex-col items-center">
              <div className="relative flex items-center justify-center w-24 h-24 mb-8">
                 <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse" />
                 <div className="relative flex items-center justify-center w-full h-full rounded-full border-2 border-white/10 bg-white/5 backdrop-blur-sm">
                    <Rocket className="w-10 h-10 text-white animate-pulse" strokeWidth={1.5} />
                 </div>
              </div>
            </div>
        </div>

        {/* Content */}
        <div className={cn("relative w-full h-full transition-opacity duration-1000", isLoaded ? "opacity-100" : "opacity-0")}>
            
            {/* THE WEBGL CANVAS */}
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Title Overlay */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
              style={{ opacity: textOpacity }}
            >
              <div className="text-center px-4">
                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
                  PROJECT <br /> PORTFOLIO
                </h1>
                
                {/* --- UPDATED SCROLL INDICATOR --- */}
                <div className="mt-16 flex flex-col items-center gap-4">
                  <p className="text-white font-bold text-sm md:text-base tracking-[0.2em] animate-pulse drop-shadow-xl">
                    SCROLL TO EXPLORE
                  </p>
                  <ChevronDown className="w-8 h-8 text-white animate-bounce drop-shadow-xl" strokeWidth={2.5} />
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
