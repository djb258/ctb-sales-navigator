import { useState } from "react";
import { FileSearch, Calculator, Gauge, PresentationIcon, Search } from "lucide-react";
import ClientSelector from "@/ui/components/sales/ClientSelector";
import MeetingCard from "@/ui/components/sales/MeetingCard";
import ProgressIndicator from "@/ui/components/sales/ProgressIndicator";
import { Button } from "@/ui/components/button";
import { Link } from "react-router-dom";

const SalesProcessHub = () => {
  const [selectedClient, setSelectedClient] = useState<string>();

  const meetings = [
    {
      id: 1,
      title: "Meeting 1: Discovery",
      description: "Client intake, needs analysis, and discovery session",
      route: "/sales/meeting1",
      icon: FileSearch,
      colorClass: "text-meeting1-emerald",
      gradientClass: "bg-gradient-meeting1",
    },
    {
      id: 2,
      title: "Meeting 2: Calculator + Compliance",
      description: "Monte Carlo simulations, insurance, compliance & marketing outputs",
      route: "/sales/meeting2",
      icon: Calculator,
      colorClass: "text-meeting2-royal",
      gradientClass: "bg-gradient-meeting2",
    },
    {
      id: 3,
      title: "Meeting 3: Operations",
      description: "Operations dashboards, service metrics, and performance tracking",
      route: "/sales/meeting3",
      icon: Gauge,
      colorClass: "text-meeting3-crimson",
      gradientClass: "bg-gradient-meeting3",
    },
    {
      id: 4,
      title: "Meeting 4: Cost & Presentation",
      description: "Final quotes, ROI summary, and client presentation",
      route: "/sales/meeting4",
      icon: PresentationIcon,
      colorClass: "text-meeting4-gold",
      gradientClass: "bg-gradient-meeting4",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <h1 className="text-2xl font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg">
                Sales Process Hub
              </h1>
            </Link>
            <ClientSelector value={selectedClient} onValueChange={setSelectedClient} />
          </div>
        </div>
      </header>

      {/* Progress Section */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <ProgressIndicator currentStep={0} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Select a Meeting Module</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Navigate through the CTB sales process. Each module is designed to guide you 
              through a specific stage of client engagement.
            </p>
          </div>

          {/* CRM Intake Gateway Banner */}
          <div className="mb-8">
            <Link to="/sales/crm-intake">
              <div className="bg-gradient-to-r from-hub-teal/10 to-meeting4-gold/10 border border-hub-teal/30 rounded-lg p-6 hover:border-hub-teal/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-hub-teal/20 flex items-center justify-center group-hover:bg-hub-teal/30 transition-colors">
                      <Search className="w-6 h-6 text-hub-teal" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg text-hub-teal mb-1">CRM Intake Gateway</h3>
                      <p className="text-sm text-muted-foreground">
                        Import company data from ActiveCampaign to begin a new meeting
                      </p>
                    </div>
                  </div>
                  <Button className="bg-meeting4-gold hover:bg-meeting4-gold/90 text-white">
                    Launch Gateway
                  </Button>
                </div>
              </div>
            </Link>
          </div>

          {!selectedClient && (
            <div className="bg-meeting2-royal/10 border border-meeting2-royal/20 rounded-lg p-4 mb-8 text-center">
              <p className="text-meeting2-royal font-medium">
                ⚠️ Please select a client above to begin the sales process
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                title={meeting.title}
                description={meeting.description}
                route={meeting.route}
                icon={meeting.icon}
                colorClass={meeting.colorClass}
                gradientClass={meeting.gradientClass}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary"></div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-1">CTB Doctrine Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  All modules follow the 20k/10k structure with MCP integration points
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesProcessHub;
