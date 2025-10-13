import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Play, Save, Presentation, X, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MonteCarloConstant {
  id: string;
  constant_name: string;
  constant_value: number;
  description: string;
  active: boolean;
  category: string;
}

interface MonteCarloResults {
  mean: number;
  p5: number;
  p95: number;
  distribution: number[];
}

interface ComplianceItem {
  requirement: string;
  checked: boolean;
  status: string;
}

function runMonteCarlo(baseline: number, volatility: number, iterations = 1000): MonteCarloResults {
  const results: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const rand = 1 + (Math.random() - 0.5) * 2 * volatility;
    results.push(baseline * rand);
  }
  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  results.sort((a, b) => a - b);
  const p5 = results[Math.floor(iterations * 0.05)];
  const p95 = results[Math.floor(iterations * 0.95)];
  return { mean, p5, p95, distribution: results };
}

export default function Meeting2Workbench() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [presentationMode, setPresentationMode] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [meetingId, setMeetingId] = useState<string>("");
  
  // Monte Carlo State
  const [constants, setConstants] = useState<MonteCarloConstant[]>([]);
  const [baseline, setBaseline] = useState<number>(100000);
  const [volatility, setVolatility] = useState<number>(0.15);
  const [iterations, setIterations] = useState<number>(1000);
  const [mcResults, setMcResults] = useState<MonteCarloResults | null>(null);
  
  // Compliance State
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([
    { requirement: "ERISA Compliance", checked: false, status: "pending" },
    { requirement: "Form 5500 Filing", checked: false, status: "pending" },
    { requirement: "ACA Reporting", checked: false, status: "pending" },
    { requirement: "SPD Distribution", checked: false, status: "pending" },
  ]);
  
  // Sniper Marketing State
  const [marketingCopy, setMarketingCopy] = useState<string>("");

  useEffect(() => {
    loadConstants();
    loadSessionData();
  }, []);

  const loadConstants = async () => {
    const { data, error } = await supabase
      .from('montecarlo_constants' as any)
      .select('*')
      .order('category');
    
    if (error) {
      console.error('Error loading constants:', error);
      return;
    }
    
    if (data) {
      setConstants(data as unknown as MonteCarloConstant[]);
    }
  };

  const loadSessionData = async () => {
    // Try to get company_id from URL params or local storage
    const urlParams = new URLSearchParams(window.location.search);
    const urlCompanyId = urlParams.get('company_id');
    
    if (urlCompanyId) {
      setCompanyId(urlCompanyId);
      await loadMeetingData(urlCompanyId);
    }
  };

  const loadMeetingData = async (compId: string) => {
    const { data, error } = await supabase
      .from('meeting2_master' as any)
      .select('*')
      .eq('company_id', compId)
      .maybeSingle();

    if (data) {
      const meetingData = data as any;
      setMeetingId(meetingData.meeting_id);
      setPresentationMode(meetingData.presentation_mode || false);
      
      if (meetingData.montecarlo_results) {
        setMcResults(meetingData.montecarlo_results);
      }
      
      if (meetingData.compliance_status) {
        setComplianceItems(meetingData.compliance_status);
      }
      
      if (meetingData.marketing_copy) {
        setMarketingCopy(meetingData.marketing_copy);
      }
    }
  };

  const handleToggleConstant = async (id: string) => {
    const updated = constants.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    );
    setConstants(updated);

    const constant = updated.find(c => c.id === id);
    if (constant) {
      await supabase
        .from('montecarlo_constants' as any)
        .update({ active: constant.active })
        .eq('id', id);
    }
  };

  const handleRunSimulation = () => {
    const results = runMonteCarlo(baseline, volatility, iterations);
    setMcResults(results);
    
    toast({
      title: "Simulation Complete",
      description: `Mean: $${results.mean.toFixed(0)} | P5: $${results.p5.toFixed(0)} | P95: $${results.p95.toFixed(0)}`,
      className: "bg-meeting2-royal/10 border-meeting2-royal/30",
    });
  };

  const handleSaveMonteCarlo = async () => {
    if (!companyId || !mcResults) return;

    const { error } = await supabase
      .from('meeting2_master' as any)
      .upsert({
        company_id: companyId,
        montecarlo_results: mcResults,
      });

    if (error) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Monte Carlo Saved",
        className: "bg-meeting2-royal/10 border-meeting2-royal/30",
      });
    }
  };

  const handleSaveCompliance = async () => {
    if (!companyId) return;

    const { error } = await supabase
      .from('meeting2_master' as any)
      .upsert({
        company_id: companyId,
        compliance_status: complianceItems,
      });

    if (error) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Compliance Saved",
        className: "bg-meeting2-royal/10 border-meeting2-royal/30",
      });
    }
  };

  const handleSaveMarketing = async () => {
    if (!companyId) return;

    const { error } = await supabase
      .from('meeting2_master' as any)
      .upsert({
        company_id: companyId,
        marketing_copy: marketingCopy,
      });

    if (error) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Marketing Copy Saved",
        className: "bg-meeting2-royal/10 border-meeting2-royal/30",
      });
    }
  };

  const handleSaveAll = async () => {
    if (!companyId) return;

    const { error } = await supabase
      .from('meeting2_master' as any)
      .upsert({
        company_id: companyId,
        montecarlo_results: mcResults,
        compliance_status: complianceItems,
        marketing_copy: marketingCopy,
        presentation_mode: presentationMode,
      });

    if (error) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "All Data Saved",
        description: "Monte Carlo, Compliance, and Marketing saved successfully",
        className: "bg-meeting2-royal/10 border-meeting2-royal/30",
      });
    }
  };

  const handleEnterPresentation = async () => {
    await handleSaveAll();
    setPresentationMode(true);
  };

  const handleExitPresentation = () => {
    setPresentationMode(false);
  };

  const calculateComplianceScore = () => {
    const completed = complianceItems.filter(item => item.checked).length;
    return Math.round((completed / complianceItems.length) * 100);
  };

  if (presentationMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-meeting2-royal">Meeting 2 Presentation</h1>
            <Button 
              onClick={handleExitPresentation}
              variant="outline"
              className="border-meeting2-royal text-meeting2-royal hover:bg-meeting2-royal hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Exit Presentation Mode
            </Button>
          </div>

          {/* Monte Carlo Summary */}
          {mcResults && (
            <Card className="mb-8 border-meeting2-royal/20">
              <CardHeader>
                <CardTitle className="text-meeting2-royal">Cost Projection Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-meeting2-royal">${mcResults.mean.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Mean Cost</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-meeting2-royal">${mcResults.p5.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">5th Percentile</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-meeting2-royal">${mcResults.p95.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">95th Percentile</div>
                  </div>
                </div>
                
                <div className="h-64 flex items-end gap-1">
                  {mcResults.distribution.slice(0, 50).map((value, idx) => {
                    const maxVal = Math.max(...mcResults.distribution);
                    const height = (value / maxVal) * 100;
                    return (
                      <div 
                        key={idx} 
                        className="flex-1 bg-meeting2-royal/60 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance Scorecard */}
          <Card className="mb-8 border-meeting2-royal/20">
            <CardHeader>
              <CardTitle className="text-meeting2-royal">Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-meeting2-royal">{calculateComplianceScore()}%</div>
                <div className="text-muted-foreground">Complete</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {complianceItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className={`w-4 h-4 rounded-full ${item.checked ? 'bg-meeting2-royal' : 'bg-muted-foreground/20'}`} />
                    <span className="font-medium">{item.requirement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Marketing Copy */}
          {marketingCopy && (
            <Card className="mb-8 border-meeting2-royal/20">
              <CardHeader>
                <CardTitle className="text-meeting2-royal">ROI Marketing Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-foreground">{marketingCopy}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Button */}
          <div className="flex justify-center">
            <Button className="bg-meeting4-gold hover:bg-meeting4-gold/90 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export to PDF
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/sales/hub')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
            <h1 className="text-4xl font-bold text-meeting2-royal">Meeting 2 Workbench</h1>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleRunSimulation}
              variant="outline"
              className="border-meeting2-royal text-meeting2-royal hover:bg-meeting2-royal hover:text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Re-run Simulation
            </Button>
            <Button 
              onClick={handleSaveAll}
              variant="outline"
              className="border-meeting2-royal text-meeting2-royal hover:bg-meeting2-royal hover:text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save All
            </Button>
            <Button 
              onClick={handleEnterPresentation}
              className="bg-meeting4-gold hover:bg-meeting4-gold/90 text-white"
            >
              <Presentation className="w-4 h-4 mr-2" />
              Enter Presentation Mode
            </Button>
          </div>
        </div>

        {/* Operator Mode - 3 Column Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Monte Carlo Section */}
          <Card className="border-meeting2-royal/20">
            <CardHeader>
              <CardTitle className="text-meeting2-royal">Monte Carlo Simulation</CardTitle>
              <CardDescription>Configure and run cost projections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Constants */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Active Constants</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {constants.map(constant => (
                    <div key={constant.id} className="flex items-start gap-2">
                      <Checkbox 
                        checked={constant.active}
                        onCheckedChange={() => handleToggleConstant(constant.id)}
                      />
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{constant.constant_name}</div>
                        <div className="text-xs text-muted-foreground">{constant.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div>
                <Label htmlFor="baseline">Baseline Cost ($)</Label>
                <Input 
                  id="baseline"
                  type="number" 
                  value={baseline}
                  onChange={(e) => setBaseline(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="volatility">Volatility</Label>
                <Input 
                  id="volatility"
                  type="number" 
                  step="0.01"
                  value={volatility}
                  onChange={(e) => setVolatility(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="iterations">Iterations</Label>
                <Input 
                  id="iterations"
                  type="number" 
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                />
              </div>

              <Button 
                onClick={handleRunSimulation}
                className="w-full bg-meeting2-royal hover:bg-meeting2-royal/90"
              >
                Run Simulation
              </Button>

              {/* Results */}
              {mcResults && (
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <div className="text-sm">
                    <span className="font-semibold">Mean:</span> ${mcResults.mean.toFixed(2)}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">P5:</span> ${mcResults.p5.toFixed(2)}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">P95:</span> ${mcResults.p95.toFixed(2)}
                  </div>
                  <Button 
                    onClick={handleSaveMonteCarlo}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    Save to Supabase
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Section */}
          <Card className="border-meeting2-royal/20">
            <CardHeader>
              <CardTitle className="text-meeting2-royal">Compliance Checklist</CardTitle>
              <CardDescription>Track regulatory requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {complianceItems.map((item, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={item.checked}
                      onCheckedChange={(checked) => {
                        const updated = [...complianceItems];
                        updated[idx].checked = checked as boolean;
                        setComplianceItems(updated);
                      }}
                    />
                    <Label className="font-medium">{item.requirement}</Label>
                  </div>
                  <Select 
                    value={item.status}
                    onValueChange={(value) => {
                      const updated = [...complianceItems];
                      updated[idx].status = value;
                      setComplianceItems(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <Button 
                onClick={handleSaveCompliance}
                variant="outline"
                className="w-full"
              >
                Save to Supabase
              </Button>
            </CardContent>
          </Card>

          {/* Sniper Marketing Section */}
          <Card className="border-meeting2-royal/20">
            <CardHeader>
              <CardTitle className="text-meeting2-royal">Sniper Marketing</CardTitle>
              <CardDescription>Generate ROI-focused copy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="marketing">Marketing Copy</Label>
                <Textarea 
                  id="marketing"
                  placeholder="Generate or paste your marketing copy here..."
                  value={marketingCopy}
                  onChange={(e) => setMarketingCopy(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
              </div>

              <Button 
                onClick={handleSaveMarketing}
                variant="outline"
                className="w-full"
              >
                Save to Supabase
              </Button>

              {mcResults && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <div className="font-semibold mb-2">Quick Stats for Copy:</div>
                  <div>• Avg Savings: ${(baseline - mcResults.mean).toFixed(0)}</div>
                  <div>• Best Case: ${(baseline - mcResults.p5).toFixed(0)}</div>
                  <div>• Compliance: {calculateComplianceScore()}%</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
