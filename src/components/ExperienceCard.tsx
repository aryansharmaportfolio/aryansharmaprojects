import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import type { Experience } from "@/lib/experiences";

const ExperienceCard = ({ title, role, description, image, date }: Experience) => (
  <Dialog>
    <Card className="group relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-card/80 backdrop-blur border-foreground/5 transition-all duration-500 hover:border-foreground/20 hover:shadow-2xl">
      {image && (
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      )}
      <div className="experience-card-shade absolute inset-0" />
      <DialogTrigger asChild>
        <Button variant="ghost" aria-label={`View ${title}`} className="absolute inset-0 block h-full w-full whitespace-normal rounded-none p-0 text-left hover:bg-transparent hover:text-foreground">
          <span className="absolute top-2 sm:top-4 left-2 sm:left-4 z-30 pointer-events-none">
            <span className="experience-date-pill block px-2 sm:px-3 py-1 sm:py-1.5 backdrop-blur-md rounded-full border border-foreground/10 text-xs font-bold text-foreground uppercase tracking-wider drop-shadow-md">
              {date}
            </span>
          </span>
          <span className="absolute inset-x-0 top-14 sm:top-16 bottom-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
            <span className="block text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2 drop-shadow-lg">{title}</span>
            <span className="block text-sm sm:text-base text-foreground/90 font-medium">{role}</span>
            <span className="hidden lg:line-clamp-2 text-sm text-foreground/80 leading-relaxed mt-2">{description}</span>
          </span>
        </Button>
      </DialogTrigger>
    </Card>
    <DialogContent className="max-w-3xl w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto rounded-lg bg-background text-foreground">
      <DialogHeader className="pr-6 text-left">
        <DialogTitle className="text-xl sm:text-2xl font-bold leading-snug tracking-normal">{title}</DialogTitle>
        <DialogDescription className="text-sm sm:text-base text-foreground/90">{role}</DialogDescription>
      </DialogHeader>
      <p className="text-xs font-bold text-muted-foreground">{date}</p>
      {image && <img src={image} alt={title} className="w-full h-48 sm:h-64 object-cover rounded-lg" />}
      <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{description}</p>
    </DialogContent>
  </Dialog>
);

export default ExperienceCard;