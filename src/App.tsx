import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import { PatrolProvider } from "./context/PatrolContext";
import Index from "./pages/Index";
import RoutesPage from "./pages/Routes";
import Patrol from "./pages/Patrol";
import Log from "./pages/Log";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ScheduleMonitor from "./components/ScheduleMonitor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PatrolProvider>
        <Toaster />
        <Sonner />
        <ScheduleMonitor />
        <BrowserRouter>
          <RouterRoutes>
            <Route path="/" element={<Index />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/patrol" element={<Patrol />} />
            <Route path="/log" element={<Log />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </BrowserRouter>
      </PatrolProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
