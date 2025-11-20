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
import WorkDetail from "@/pages/WorkDetail";
import NotFound from "@/pages/NotFound";

function ScrollToAnchor() {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    // If there's an anchor (e.g. #portfolio)
    if (hash) {
      // Wait for DOM to update, then jump instantly
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          // Instantly set scroll position (no animation)
          window.scrollTo({
            top: element.offsetTop,
            left: 0,
            behavior: "auto", // ensures instant jump
          });
        }
      }, 0);
    } else if (!state?.section) {
      // No hash AND no section in state → just go to top of page
      // We check state?.section to prevent scrolling to top when returning from a project
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, state]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToAnchor />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/club/:id" element={<ClubDetail />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/work/:id" element={<WorkDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
