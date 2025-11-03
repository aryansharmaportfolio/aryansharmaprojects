import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
// --- ADD THIS IMPORT ---
import { MoveLeft } from 'lucide-react';

interface DynamicSidebarProps {
  sections: { id: string; title: string }[];
}

const DynamicSidebar = ({ sections }: DynamicSidebarProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [sections]);

  return (
    <nav className="sticky top-0 h-screen w-64 p-8 flex flex-col space-y-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            // --- MODIFIED TEXT ---
            className="text-2xl font-bold text-foreground hover:bg-transparent hover:text-primary transition-colors duration-300"
          >
            Back to Portfolio
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-8">
          <nav className="flex flex-col space-y-4">
            {/* --- MODIFIED LINK FOR MOBILE --- */}
            <Link
              to="/"
              className="text-2xl font-bold text-foreground hover:text-primary transition-colors duration-300 flex items-center"
            >
              <MoveLeft className="mr-2 h-6 w-6" />
              <span>Back to Portfolio</span>
            </Link>
            <Separator />
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(section.id)?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }}
                className={`text-lg transition-colors duration-300 ${
                  activeSection === section.id
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {section.title}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="hidden md:flex flex-col space-y-2">
        {/* --- MODIFIED LINK FOR DESKTOP --- */}
        <Link
          to="/"
          className="text-2xl font-bold text-foreground hover:text-primary transition-colors duration-300 group flex items-center"
        >
          {/* This icon will animate on hover */}
          <MoveLeft className="mr-2 h-6 w-6 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>
            Back to Portfolio
          </span>
        </Link>
        <Separator />
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(section.id)?.scrollIntoView({
                behavior: 'smooth',
              });
            }}
            className={`text-lg transition-colors duration-300 ${
              activeSection === section.id
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {section.title}
          </a>
        ))}
      </div>
    </n<ctrl63>
