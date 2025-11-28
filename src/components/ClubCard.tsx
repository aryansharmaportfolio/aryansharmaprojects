import { ArrowUpRight, Calendar, Sparkles, Trophy, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClubCardProps {
  title: string;
  role: string;
  period: string;
  description: string;
  skills: string[];
  onClick?: () => void;
  className?: string;
  logo?: string;
}

export function ClubCard({
  title,
  role,
  period,
  description,
  skills,
  onClick,
  className,
  logo
}: ClubCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative h-full w-full cursor-pointer perspective-1000",
        className
      )}
    >
      {/* 1. Outer Glow/Border Effect on Hover - Creates a colored rim light */}
      <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 blur-sm transition-all duration-500 group-hover:opacity-50 group-hover:blur-md" />

      {/* 2. Main Card Container */}
      <div className="relative h-full flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-2xl transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:border-white/20 group-hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
        
        {/* Ambient Background Light Orbs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-[80px] transition-all duration-700 group-hover:bg-blue-500/10" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/5 blur-[80px] transition-all duration-700 group-hover:bg-purple-500/10" />

        {/* --- Header Section --- */}
        <div className="relative space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              {/* Role Tag - Glowing Badge style */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)] transition-colors group-hover:border-blue-400/50 group-hover:text-blue-300">
                <Trophy className="h-3 w-3" />
                {role}
              </div>
              
              {/* Title with Gradient Reveal */}
              <h3 className="text-xl font-black leading-tight tracking-tight text-white/90 transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200">
                {title}
              </h3>
            </div>

            {/* Icon/Logo Placeholder */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:border-blue-500/30 group-hover:bg-blue-500/10">
              {logo ? (
                 <img src={logo} alt={title} className="h-8 w-8 object-contain" />
              ) : (
                 <Layers className="h-6 w-6 text-white/40 transition-colors group-hover:text-blue-400" />
              )}
            </div>
          </div>

          {/* Period */}
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <Calendar className="h-3.5 w-3.5" />
            <span className="tracking-wide uppercase text-neutral-400 group-hover:text-neutral-300 transition-colors">{period}</span>
          </div>
        </div>

        {/* --- Content Section --- */}
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {/* Description */}
          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-400 transition-colors group-hover:text-neutral-300">
            {description}
          </p>

          <div className="mt-auto space-y-4">
            {/* Divider Line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all group-hover:via-white/20" />

            {/* Skills Section - RENAMED TO "SKILLS" */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 group-hover:text-blue-400 transition-colors">
                  Skills
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-white/5 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-neutral-400 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hover Reveal Action Button */}
        <div className="absolute bottom-6 right-6 translate-x-10 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100">
          <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 backdrop-blur-md shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">View</span>
            <ArrowUpRight className="h-3 w-3 text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
