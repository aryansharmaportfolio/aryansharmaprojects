import { useIsMobile } from "@/hooks/use-mobile";
import FalconViewerDesktop from "./FalconViewerDesktop";
import FalconViewerMobile from "./FalconViewerMobile";

export default function FalconViewer() {
  const isMobile = useIsMobile();
  
  // Return mobile version for screens < 768px, desktop for larger
  return isMobile ? <FalconViewerMobile /> : <FalconViewerDesktop />;
}
