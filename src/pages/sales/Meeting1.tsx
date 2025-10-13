import { useState } from "react";
import { ArrowLeft, FileSearch, Save, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ClientSelector from "@/components/sales/ClientSelector";
import ProgressIndicator from "@/components/sales/ProgressIndicator";
import { toast } from "sonner";

const Meeting1 = () => {
  const [selectedClient, setSelectedClient] = useState<string>();
  const [discoveryNotes, setDiscoveryNotes] = useState("");
  const [clientNeeds, setClientNeeds] = useState("");
  const [budget, setBudget] = useState("");

  const handleGenerateSummary = () => {
    toast.success("Discovery summary generation triggered", {
      description: "MCP endpoint: /generateDiscoverySummary"
    });
  };

  const handleSave = () => {
    toast.success("Discovery data saved", {
      description: "Firebase path: sales_meeting_sessions/{client_uid}/discovery"
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
                <div className="w-10 h-10 rounded-lg bg-meeting1-emerald/10 flex items-center justify-center">
                  <FileSearch className="h-5 w-5 text-meeting1-emerald" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Meeting 1: Discovery</h1>
                  <p className="text-sm text-muted-foreground">Client intake & needs analysis</p>
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
          <ProgressIndicator currentStep={1} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Introduction Card */}
          <Card className="p-6 border-l-4 border-l-meeting1-emerald">
            <h2 className="text-lg font-semibold text-meeting1-emerald mb-2">Discovery Session</h2>
            <p className="text-muted-foreground">
              Capture client information, business needs, challenges, and objectives. 
              This data forms the foundation for the entire sales process.
            </p>
          </Card>

          {/* Discovery Form */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="needs">Client Needs & Objectives</Label>
                <Textarea
                  id="needs"
                  placeholder="Describe the client's primary business needs, goals, and challenges..."
                  value={clientNeeds}
                  onChange={(e) => setClientNeeds(e.target.value)}
                  className="mt-2 min-h-32"
                />
              </div>

              <div>
                <Label htmlFor="budget">Budget Range</Label>
                <Input
                  id="budget"
                  type="text"
                  placeholder="e.g., $50,000 - $100,000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="notes">Discovery Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes from the discovery conversation..."
                  value={discoveryNotes}
                  onChange={(e) => setDiscoveryNotes(e.target.value)}
                  className="mt-2 min-h-48"
                />
              </div>
            </div>
          </Card>

          {/* MCP Actions */}
          <Card className="p-6 bg-meeting1-emerald/5 border-meeting1-emerald/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-meeting1-emerald" />
              AI-Powered Actions
            </h3>
            <div className="flex gap-4">
              <Button 
                onClick={handleGenerateSummary}
                className="bg-meeting1-emerald hover:bg-meeting1-emerald/90"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Summary
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              MCP Endpoint: <code className="text-xs bg-background px-2 py-1 rounded">
                /generateDiscoverySummary
              </code>
            </p>
          </Card>

          {/* Save Actions */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Firebase: sales_meeting_sessions/{'{client_uid}'}/discovery
            </p>
            <Button onClick={handleSave} size="lg">
              <Save className="mr-2 h-4 w-4" />
              Save Discovery Data
            </Button>
          </div>

          {/* Next Steps */}
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-3">Next: Meeting 2</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Proceed to the Calculator & Compliance module for Monte Carlo simulations and compliance checks.
            </p>
            <Link to="/sales/meeting2">
              <Button variant="outline" className="border-meeting2-royal text-meeting2-royal hover:bg-meeting2-royal hover:text-white">
                Continue to Meeting 2
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Meeting1;
