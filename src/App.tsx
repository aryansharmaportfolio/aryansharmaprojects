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
  const location = useLocation();
  const { pathname, hash, state } = location as {
    pathname: string;
    hash: string;
    state?: { section?: string } | null;
  };

  useEffect(() => {
    // 1) Anchor hash takes priority
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          window.scrollTo({ top: element.offsetTop, left: 0, behavior: "auto" });
        }
      }, 0);
      return;
    }

    // 2) If returning to home with a target section in state → jump instantly to that section
    if (pathname === "/" && state?.section) {
      setTimeout(() => {
        const el = document.getElementById(state.section!);
        if (el) {
          window.scrollTo({ top: el.offsetTop, left: 0, behavior: "auto" });
          // Clear history state after using it to prevent re-triggering
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search + window.location.hash);
        }
      }, 0);
      return;
    }

    // 3) Default behavior for normal route changes
    window.scrollTo(0, 0);
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
