import { Rocket } from "lucide-react";

const ProjectLoader = () => {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center animate-out fade-out duration-500 fill-mode-forwards" style={{ animationDelay: '1.5s' }}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        <Rocket className="w-16 h-16 text-primary animate-bounce relative z-10" />
      </div>
      <p className="mt-4 text-muted-foreground font-mono text-sm tracking-widest animate-pulse">INITIALIZING...</p>
    </div>
  );
};

export default ProjectLoader;
