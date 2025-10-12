import { Mail, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import profilePicture from "@/assets/profile-picture.png";

const AboutMe = () => {
  return (
    <section id="about" className="py-24 px-6 bg-secondary/50">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Profile */}
          <div className="flex flex-col items-center space-y-6 animate-fade-in">
            <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-primary shadow-2xl">
              <img
                src={profilePicture}
                alt="Aryan Sharma"
                className="w-full h-full object-cover"
              />
            </div>
            
            <h2 className="text-3xl font-bold text-foreground">Aryan Sharma</h2>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="gap-2 border-2 border-foreground text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                asChild
              >
                <a href="mailto:aryan@example.com">
                  <Mail className="w-5 h-5" />
                  Email
                </a>
              </Button>
              
              <Button
                variant="outline"
                className="gap-2 border-2 border-foreground text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                asChild
              >
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              </Button>
            </div>
          </div>

          {/* Right Column - Bio */}
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-5xl font-bold text-foreground border-b-4 border-primary inline-block pb-2">
              About Me
            </h2>
            
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                I'm a student majoring in <span className="font-semibold text-foreground">Aerospace Engineering</span> at the University of Texas at Arlington, passionate about turning complex theories into a tangible reality. My path is rooted in hands-on application, from analyzing flight dynamics on the Design-Build-Fly team to constructing high-powered rockets with UTA's AeroMavs. My dedication to aerospace took flight when I co-founded my high school's first aerospace club, growing it to over 115 members.
              </p>
              
              <p>
                I continue to pursue that same drive for innovation and leadership, blending my technical skills with a commitment to teamwork and pushing the limits of what we can achieve in the sky.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
