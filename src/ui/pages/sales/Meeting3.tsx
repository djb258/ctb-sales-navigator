import { useState } from "react";
import { ArrowLeft, Gauge, RefreshCw, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import ClientSelector from "@/ui/components/sales/ClientSelector";
import ProgressIndicator from "@/ui/components/sales/ProgressIndicator";
import MeetingNavigation from "@/ui/components/sales/MeetingNavigation";
import { toast } from "sonner";

const Meeting3 = () => {
  const [selectedClient, setSelectedClient] = useState<string>();

  const handleFetchMetrics = () => {
    toast.success("Fetching operations metrics", {
      description: "MCP endpoint: /fetchOperationsMetrics"
    });
  };

  // Mock data for demonstration
  const metrics = [
    { label: "Active Projects", value: "12", trend: "+3", color: "text-meeting1-emerald" },
    { label: "Service Level", value: "98.5%", trend: "+2.1%", color: "text-meeting2-royal" },
    { label: "Response Time", value: "< 2h", trend: "-15min", color: "text-meeting3-crimson" },
    { label: "Client Satisfaction", value: "4.8/5", trend: "+0.3", color: "text-meeting4-gold" },
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
                <div className="w-10 h-10 rounded-lg bg-meeting3-crimson/10 flex items-center justify-center">
                  <Gauge className="h-5 w-5 text-meeting3-crimson" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Meeting 3: Operations & Service</h1>
                  <p className="text-sm text-muted-foreground">Operational dashboards & metrics</p>
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
          <ProgressIndicator currentStep={3} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 pl-56">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Introduction Card */}
          <Card className="p-6 border-l-4 border-l-meeting3-crimson">
            <h2 className="text-lg font-semibold text-meeting3-crimson mb-2">Operations Dashboard</h2>
            <p className="text-muted-foreground">
              Monitor operational performance, service delivery metrics, and real-time analytics 
              to ensure optimal client service quality.
            </p>
          </Card>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <TrendingUp className={`h-4 w-4 ${metric.color}`} />
                </div>
                <p className={`text-3xl font-bold ${metric.color} mb-1`}>{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.trend} from last period</p>
              </Card>
            ))}
          </div>

          {/* Service Metrics */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-meeting3-crimson">Service Metrics</h3>
              <Button 
                onClick={handleFetchMetrics}
                variant="outline"
                size="sm"
                className="border-meeting3-crimson text-meeting3-crimson hover:bg-meeting3-crimson hover:text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Ticket Resolution Rate</span>
                  <span className="font-semibold text-meeting3-crimson">94%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-meeting3-crimson h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">First Contact Resolution</span>
                  <span className="font-semibold text-meeting3-crimson">87%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-meeting3-crimson h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Customer Retention</span>
                  <span className="font-semibold text-meeting3-crimson">96%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-meeting3-crimson h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              MCP: <code className="text-xs bg-background px-2 py-1 rounded">/fetchOperationsMetrics</code>
            </p>
          </Card>

          {/* Performance Overview */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-meeting3-crimson">Performance Overview</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">System Uptime</h4>
                <p className="text-2xl font-bold text-meeting3-crimson mb-1">99.97%</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Average Load Time</h4>
                <p className="text-2xl font-bold text-meeting3-crimson mb-1">1.2s</p>
                <p className="text-xs text-muted-foreground">Global average</p>
              </div>
            </div>
          </Card>

          {/* Firebase Path Info */}
          <Card className="p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Firebase: sales_meeting_sessions/{'{client_uid}'}/operations
            </p>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-3">Next: Meeting 4</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Proceed to Cost & Presentation module for final quotes and ROI summary.
            </p>
            <Link to="/sales/meeting4">
              <Button variant="outline" className="border-meeting4-gold text-meeting4-gold hover:bg-meeting4-gold hover:text-white">
                Continue to Meeting 4
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Meeting3;
