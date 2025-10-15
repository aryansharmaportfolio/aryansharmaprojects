import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import ClubDetail from "@/pages/ClubDetail";
import ProjectDetail from "@/pages/ProjectDetail";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Router>
      {/* ScrollToAnchor component removed */}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/club/:id" element={<ClubDetail />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
