import { useState } from "react";
import { ArrowLeft, Calculator, Play, FileCheck, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ClientSelector from "@/components/sales/ClientSelector";
import ProgressIndicator from "@/components/sales/ProgressIndicator";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Meeting2 = () => {
  const [selectedClient, setSelectedClient] = useState<string>();
  const [scenarios, setScenarios] = useState("10000");
  const [riskLevel, setRiskLevel] = useState("moderate");

  const handleSimulation = () => {
    toast.success("Monte Carlo simulation started", {
      description: "MCP endpoint: /simulateMonteCarlo"
    });
  };

  const handleCompliance = () => {
    toast.success("Compliance check initiated", {
      description: "MCP endpoint: /checkCompliance"
    });
  };

  const handleGenerateOutputs = () => {
    toast.success("Generating presentation outputs", {
      description: "MCP endpoint: /generateQuotePDF"
    });
  };

  return (
    <div className="min-h-screen bg-background">
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
                <div className="w-10 h-10 rounded-lg bg-meeting2-royal/10 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-meeting2-royal" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Meeting 2: Calculator + Compliance</h1>
                  <p className="text-sm text-muted-foreground">Main presentation node</p>
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
          <ProgressIndicator currentStep={2} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Introduction Card */}
          <Card className="p-6 border-l-4 border-l-meeting2-royal">
            <h2 className="text-lg font-semibold text-meeting2-royal mb-2">Hero Presentation Node</h2>
            <p className="text-muted-foreground">
              Monte Carlo simulations, insurance analysis, compliance verification, educational content, 
              sniper marketing strategies, and automated output generation.
            </p>
          </Card>

          {/* Tabs for different sections */}
          <Tabs defaultValue="monte-carlo" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="monte-carlo">Monte Carlo</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="outputs">Outputs</TabsTrigger>
            </TabsList>

            <TabsContent value="monte-carlo" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-meeting2-royal">Monte Carlo Simulation</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scenarios">Number of Scenarios</Label>
                    <Input
                      id="scenarios"
                      type="number"
                      value={scenarios}
                      onChange={(e) => setScenarios(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="risk">Risk Profile</Label>
                    <select
                      id="risk"
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value)}
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                  <Button onClick={handleSimulation} className="bg-meeting2-royal hover:bg-meeting2-royal/90">
                    <Play className="mr-2 h-4 w-4" />
                    Run Simulation
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  MCP: <code className="text-xs bg-background px-2 py-1 rounded">/simulateMonteCarlo</code>
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-meeting2-royal">Compliance Verification</h3>
                <p className="text-muted-foreground mb-4">
                  Verify all regulatory requirements and compliance standards for the proposed solution.
                </p>
                <Button onClick={handleCompliance} className="bg-meeting2-royal hover:bg-meeting2-royal/90">
                  <FileCheck className="mr-2 h-4 w-4" />
                  Check Compliance
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  MCP: <code className="text-xs bg-background px-2 py-1 rounded">/checkCompliance</code>
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-meeting2-royal">Educational Content</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Insurance Fundamentals</h4>
                    <p className="text-sm text-muted-foreground">
                      Educational materials on insurance products and strategies
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Risk Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive guides on managing financial risk
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Sniper Marketing Strategies</h4>
                    <p className="text-sm text-muted-foreground">
                      Targeted marketing approaches for high-value prospects
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="outputs" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-meeting2-royal">Generate Outputs</h3>
                <p className="text-muted-foreground mb-4">
                  Create professional presentation materials, quotes, and documentation.
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleGenerateOutputs} className="bg-meeting2-royal hover:bg-meeting2-royal/90">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Quote PDF
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  MCP: <code className="text-xs bg-background px-2 py-1 rounded">/generateQuotePDF</code>
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Firebase Path Info */}
          <Card className="p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Firebase: sales_meeting_sessions/{'{client_uid}'}/calc_compliance
            </p>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-3">Next: Meeting 3</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Proceed to Operations & Service module for operational dashboards and metrics.
            </p>
            <Link to="/sales/meeting3">
              <Button variant="outline" className="border-meeting3-crimson text-meeting3-crimson hover:bg-meeting3-crimson hover:text-white">
                Continue to Meeting 3
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Meeting2;
