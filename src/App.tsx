
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PatrolProvider } from "./context/PatrolContext";
import Index from "./pages/Index";
import Routes from "./pages/Routes";
import Patrol from "./pages/Patrol";
import Log from "./pages/Log";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PatrolProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/routes" element={<Routes />} />
            <Route path="/patrol" element={<Patrol />} />
            <Route path="/log" element={<Log />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PatrolProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
