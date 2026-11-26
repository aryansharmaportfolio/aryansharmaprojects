import safranPhoto from "../assets/safran.jpg.asset.json";

export interface Experience {
  id: string;
  title: string;
  role: string;
  description: string;
  image?: string;
  date: string;
}

export const experiences: Experience[] = [
  {
    id: "utari-composite-research",
    title: "UTARI Composite Research",
    role: "Undergraduate Research Assistant",
    description: "Working under the mentorship of Dr. Lin and a PhD candidate, focusing on impact drop tower systematically crushing composite materials to ensure the next generation of aerospace materials is nothing short of indestructible.",
    image: "/utari-thumbnail.jpg",
    date: "JAN 2026 - MAY 2026",
  },
  {
    id: "work-safran",
    title: "Safran Electronics & Defense, Avionics",
    role: "Mechanical Engineer Intern",
    image: safranPhoto.url,
    description: "Contributing to the design and development of avionics enclosures and mechanical systems for defense-grade aerospace electronics, gaining hands-on experience with industry-standard CAD tools and manufacturing processes.",
    date: "JUN 2026 - DEC 2026",
  },
];