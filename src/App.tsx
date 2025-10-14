import { useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  BrowserRouter as Router,
} from "react-router-dom";
import Index from "@/pages/Index";
import ClubDetail from "@/pages/ClubDetail";
import ProjectDetail from "@/pages/ProjectDetail";
import NotFound from "@/pages/NotFound";

function App() {
  const location = useLocation();

  useEffect(() => {
    const scrollToHash = () => {
      if (location.hash) {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        window.scrollTo(0, 0);
      }
    };

    const timer = setTimeout(() => {
      scrollToHash();
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/club/:id" element={<ClubDetail />} />
      <Route path="/project/:id" element={<ProjectDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default Root;
