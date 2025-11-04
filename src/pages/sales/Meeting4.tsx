import { useState } from "react";
import { ArrowLeft, PresentationIcon, Download, CheckCircle2, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ClientSelector from "@/components/sales/ClientSelector";
import ProgressIndicator from "@/components/sales/ProgressIndicator";
import MeetingNavigation from "@/components/sales/MeetingNavigation";
import { toast } from "sonner";

const Meeting4 = () => {
  const [selectedClient, setSelectedClient] = useState<string>();

  const handleGeneratePDF = () => {
    toast.success("Generating final presentation PDF", {
      description: "MCP endpoint: /generateQuotePDF"
    });
  };

  // Mock pricing data
  const pricingTiers = [
    { name: "Base Package", cost: "$45,000", features: ["Core functionality", "Standard support", "Monthly reports"] },
    { name: "Professional", cost: "$75,000", features: ["Advanced features", "Priority support", "Weekly analytics", "Custom integrations"] },
    { name: "Enterprise", cost: "$125,000", features: ["Full platform access", "24/7 dedicated support", "Real-time dashboards", "White-label options", "Custom development"] },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MeetingNavigation />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/sales/hub">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-meeting4-gold/10 flex items-center justify-center">
                  <PresentationIcon className="h-5 w-5 text-meeting4-gold" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Meeting 4: Cost & Presentation</h1>
                  <p className="text-sm text-muted-foreground">Final quotes & ROI summary</p>
                </div>
              </div>
            </div>
            <ClientSelector value={selectedClient} onValueChange={setSelectedClient} />
          </div>
        </div>
      </header>

      {/* Progress Section */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <ProgressIndicator currentStep={4} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 pl-56">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Introduction Card */}
          <Card className="p-6 border-l-4 border-l-meeting4-gold">
            <h2 className="text-lg font-semibold text-meeting4-gold mb-2">Final Presentation</h2>
            <p className="text-muted-foreground">
              Comprehensive cost breakdown, ROI projections, and professional presentation materials 
              for client decision-making.
            </p>
          </Card>

          {/* Pricing Tiers */}
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`p-6 ${index === 1 ? 'border-2 border-meeting4-gold' : ''}`}>
                {index === 1 && (
                  <div className="bg-meeting4-gold text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3">
                    RECOMMENDED
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-3xl font-bold text-meeting4-gold mb-4">{tier.cost}</p>
                <ul className="space-y-2">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-meeting4-gold mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* ROI Summary */}
          <Card className="p-6 bg-meeting4-gold/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-meeting4-gold">
              <DollarSign className="h-5 w-5" />
              Return on Investment Analysis
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Projected ROI</p>
                <p className="text-2xl font-bold text-meeting4-gold">285%</p>
                <p className="text-xs text-muted-foreground mt-1">Over 3 years</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Break-even Point</p>
                <p className="text-2xl font-bold text-meeting4-gold">18 mo</p>
                <p className="text-xs text-muted-foreground mt-1">Estimated timeline</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Annual Savings</p>
                <p className="text-2xl font-bold text-meeting4-gold">$92K</p>
                <p className="text-xs text-muted-foreground mt-1">Year 2 onwards</p>
              </div>
            </div>
          </Card>

          {/* Cost Breakdown */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-meeting4-gold">Detailed Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span>Implementation & Setup</span>
                <span className="font-semibold">$15,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span>Software Licenses (Annual)</span>
                <span className="font-semibold">$35,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span>Training & Onboarding</span>
                <span className="font-semibold">$8,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span>Support & Maintenance</span>
                <span className="font-semibold">$12,000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-meeting4-gold/10 rounded-lg border border-meeting4-gold/20">
                <span className="font-bold text-lg">Total Investment (Year 1)</span>
                <span className="font-bold text-2xl text-meeting4-gold">$70,000</span>
              </div>
            </div>
          </Card>

          {/* Generate Outputs */}
          <Card className="p-6 bg-meeting4-gold/5 border-meeting4-gold/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-meeting4-gold" />
              Generate Presentation Materials
            </h3>
            <p className="text-muted-foreground mb-4">
              Create professional PDF presentation with all pricing, ROI analysis, and supporting materials.
            </p>
            <Button onClick={handleGeneratePDF} className="bg-meeting4-gold hover:bg-meeting4-gold/90 text-white">
              <Download className="mr-2 h-4 w-4" />
              Generate Quote PDF
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              MCP: <code className="text-xs bg-background px-2 py-1 rounded">/generateQuotePDF</code>
            </p>
          </Card>

          {/* Firebase Path Info */}
          <Card className="p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Firebase: sales_meeting_sessions/{'{client_uid}'}/cost_presentation
            </p>
          </Card>

          {/* Completion */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Sales Process Complete</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              All stages of the CTB sales process have been completed. Review the materials and 
              proceed with client presentation and closing.
            </p>
            <Link to="/sales/hub">
              <Button variant="outline">
                Return to Hub
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Meeting4;
