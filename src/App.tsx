import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SalesProcessHub from "./pages/sales/SalesProcessHub";
import CRMIntakeGateway from "./pages/sales/CRMIntakeGateway";
import Meeting1 from "./pages/sales/Meeting1";
import Meeting2 from "./pages/sales/Meeting2";
import Meeting3 from "./pages/sales/Meeting3";
import Meeting4 from "./pages/sales/Meeting4";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sales/hub" element={<SalesProcessHub />} />
          <Route path="/sales/crm-intake" element={<CRMIntakeGateway />} />
          <Route path="/sales/meeting1" element={<Meeting1 />} />
          <Route path="/sales/meeting2" element={<Meeting2 />} />
          <Route path="/sales/meeting3" element={<Meeting3 />} />
          <Route path="/sales/meeting4" element={<Meeting4 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
