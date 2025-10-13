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

interface CompanyOption {
  company_id: string;
  company_name: string;
}

interface MonteCarloConstant {
  id: string;
  constant_name: string;
  constant_value: number;
  description: string;
  active: boolean;
  category: string;
}

interface MonteCarloResults {
  baseline: { mean: number; p5: number; p95: number };
  self_insured: { mean: number; p5: number; p95: number };
  reference_based: { mean: number; p5: number; p95: number };
  map_drug: { mean: number; p5: number; p95: number };
  historical: Array<{
    yearCost: number;
    self_if_in_place: number;
    ref_if_in_place: number;
    map_if_in_place: number;
  }>;
  total_historical_savings_if_in_place: number;
  projection: {
    baseline: number;
    self_insured: number;
    reference: number;
    map_drug: number;
  };
  narrative: string;
}

interface ComplianceItem {
  requirement: string;
  checked: boolean;
  status: string;
}

interface MonteCarloInputs {
  renewal1?: number;
  renewal2?: number;
  renewal3?: number;
  current_cost?: number;
  iterations?: number;
  volatility_pct?: number;
  self_insured_active: boolean;
  reference_active: boolean;
  map_active: boolean;
  hist_cost1?: number;
  hist_cost2?: number;
  hist_cost3?: number;
}

function runMonteCarlo(inputs: MonteCarloInputs): MonteCarloResults {
  // ---------- INPUTS ----------
  const renewals = [
    parseFloat(String(inputs.renewal1 || 0))/100,
    parseFloat(String(inputs.renewal2 || 0))/100,
    parseFloat(String(inputs.renewal3 || 0))/100
  ].filter(n => !isNaN(n));

  const baseCost = parseFloat(String(inputs.current_cost || 0));
  const iterations = Number(inputs.iterations) || 1000;

  // ---------- DERIVED VOLATILITY ----------
  const meanRenewal = renewals.length > 0 ? renewals.reduce((a,b)=>a+b,0)/renewals.length : 0;
  const volatility =
    inputs.volatility_pct ??
    Math.sqrt(
      renewals.length > 0
        ? renewals.map(r => Math.pow(r - meanRenewal, 2)).reduce((a,b)=>a+b,0) / renewals.length
        : 0.15
    );

  // ---------- DOCTRINE CONSTANTS ----------
  const drugPct = 0.60;
  const hospitalPct = 0.40;
  const selfDiscount = inputs.self_insured_active ? 0.25 : 0;
  const refDiscount  = inputs.reference_active    ? 0.15 : 0;
  const mapDiscount  = inputs.map_active          ? 0.40 : 0;

  // ---------- BASELINE MONTE CARLO ----------
  const baseline=[], selfArr=[], refArr=[], mapArr=[];
  for(let i=0;i<iterations;i++){
    const rand = 1 + (Math.random()-0.5)*2*volatility;
    const cost = baseCost * rand;
    baseline.push(cost);
    selfArr.push(cost * (1 - selfDiscount));
    refArr.push(cost * (1 - refDiscount * (drugPct + hospitalPct)));
    mapArr.push(cost * (1 - mapDiscount * drugPct));
  }

  // ---------- STATS FUNCTION ----------
  function stats(arr: number[]){
    const sorted=[...arr].sort((a,b)=>a-b);
    const mean=sorted.reduce((a,b)=>a+b,0)/arr.length;
    const p5 = sorted[Math.floor(arr.length*0.05)];
    const p95=sorted[Math.floor(arr.length*0.95)];
    return {mean,p5,p95};
  }

  const baselineStats = stats(baseline);
  const selfStats     = stats(selfArr);
  const refStats      = stats(refArr);
  const mapStats      = stats(mapArr);

  // ---------- HISTORICAL "WHAT-IF" SAVINGS ----------
  // 3 years of actual spend (if available)
  const hist = [
    parseFloat(String(inputs.hist_cost1 || 0)),
    parseFloat(String(inputs.hist_cost2 || 0)),
    parseFloat(String(inputs.hist_cost3 || 0))
  ].filter(v => v>0);

  const histSavings = hist.map(c => ({
    yearCost: c,
    self_if_in_place: c * (1 - selfDiscount),
    ref_if_in_place:  c * (1 - refDiscount),
    map_if_in_place:  c * (1 - mapDiscount * drugPct)
  }));

  const totalHistSavings = histSavings.reduce((a,b)=>a + (b.yearCost - b.self_if_in_place),0);

  // ---------- FORWARD PROJECTION ----------
  const avgGrowth = meanRenewal;
  const nextYearProjection = baseCost * (1 + avgGrowth);

  const proj = {
    baseline: nextYearProjection,
    self_insured: nextYearProjection * (1 - selfDiscount),
    reference:    nextYearProjection * (1 - refDiscount),
    map_drug:     nextYearProjection * (1 - mapDiscount * drugPct)
  };

  // ---------- COMBINE RESULTS ----------
  const result: MonteCarloResults = {
    baseline: baselineStats,
    self_insured: selfStats,
    reference_based: refStats,
    map_drug: mapStats,
    historical: histSavings,
    total_historical_savings_if_in_place: totalHistSavings,
    projection: proj,
    narrative: ''
  };

  // ---------- NARRATIVE OUTPUT ----------
  result.narrative = `Had these programs been active over the past 3 years, total savings ≈ $${totalHistSavings.toFixed(0)}.
Looking ahead, current projection ≈ $${proj.baseline.toFixed(0)}; with self-insured ≈ $${proj.self_insured.toFixed(0)} (-${((selfDiscount)*100).toFixed(0)}%); reference ≈ $${proj.reference.toFixed(0)}; MAP Drug ≈ $${proj.map_drug.toFixed(0)}.`;

  return result;
}

export default function Meeting2Workbench() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [presentationMode, setPresentationMode] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [meetingId, setMeetingId] = useState<string>("");
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  
  // Monte Carlo State
  const [constants, setConstants] = useState<MonteCarloConstant[]>([]);
  const [renewal1, setRenewal1] = useState<number>(5);
  const [renewal2, setRenewal2] = useState<number>(7);
  const [renewal3, setRenewal3] = useState<number>(6);
  const [currentCost, setCurrentCost] = useState<number>(100000);
  const [iterations, setIterations] = useState<number>(1000);
  const [selfInsuredActive, setSelfInsuredActive] = useState<boolean>(true);
  const [referenceActive, setReferenceActive] = useState<boolean>(true);
  const [mapActive, setMapActive] = useState<boolean>(true);
  const [histCost1, setHistCost1] = useState<number>(0);
  const [histCost2, setHistCost2] = useState<number>(0);
  const [histCost3, setHistCost3] = useState<number>(0);
  const [allowEditHistory, setAllowEditHistory] = useState<boolean>(false);
  const [mcResults, setMcResults] = useState<MonteCarloResults | null>(null);

  // Auto-compute historical costs from renewals (reverse engineering)
  useEffect(() => {
    if (!currentCost || !renewal1) return;
    
    const renewals = [renewal1, renewal2, renewal3].filter(r => r > 0);
    if (renewals.length === 0) return;

    // Normalize to decimal (e.g., 10% -> 0.10)
    const normalized = renewals.map(r => r > 1 ? r / 100 : r);
    
    // Compute backwards from current cost
    const results: number[] = [];
    let prev = currentCost;
    for (const r of normalized) {
      const last = prev / (1 + r);
      results.push(last);
      prev = last;
    }

    // Only update if not in edit mode
    if (!allowEditHistory) {
      setHistCost1(results[0] || 0);
      setHistCost2(results[1] || 0);
      setHistCost3(results[2] || 0);
    }
  }, [currentCost, renewal1, renewal2, renewal3, allowEditHistory]);
  
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
    loadCompanies();
    loadSessionData();
  }, []);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('company_profiles' as any)
      .select('company_id, company_name')
      .order('company_name');
    
    if (data) {
      setCompanies(data as unknown as CompanyOption[]);
    }
  };

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

  const handleConstantValueChange = (id: string, value: number) => {
    const updated = constants.map(c => 
      c.id === id ? { ...c, constant_value: value } : c
    );
    setConstants(updated);
  };

  const handleRunSimulation = () => {
    const results = runMonteCarlo({
      renewal1,
      renewal2,
      renewal3,
      current_cost: currentCost,
      iterations,
      self_insured_active: selfInsuredActive,
      reference_active: referenceActive,
      map_active: mapActive,
      hist_cost1: histCost1,
      hist_cost2: histCost2,
      hist_cost3: histCost3,
    });
    setMcResults(results);
    setMarketingCopy(results.narrative); // Auto-populate marketing copy
    
    toast({
      title: "Simulation Complete",
      description: `Baseline: $${results.baseline.mean.toFixed(0)} | Historical savings if in place: $${results.total_historical_savings_if_in_place.toFixed(0)}`,
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

  const handleCompanySelect = (selectedCompanyId: string) => {
    setCompanyId(selectedCompanyId);
    loadMeetingData(selectedCompanyId);
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
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-xl font-bold text-meeting2-royal">${mcResults.baseline.mean.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Baseline Mean</div>
                    <div className="text-xs mt-1">P5: ${mcResults.baseline.p5.toFixed(0)}</div>
                    <div className="text-xs">P95: ${mcResults.baseline.p95.toFixed(0)}</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-xl font-bold text-green-600">${mcResults.self_insured.mean.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Self-Insured</div>
                    <div className="text-xs mt-1 text-green-600">Save: ${(mcResults.baseline.mean - mcResults.self_insured.mean).toFixed(0)}</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">${mcResults.reference_based.mean.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Reference-Based</div>
                    <div className="text-xs mt-1 text-blue-600">Save: ${(mcResults.baseline.mean - mcResults.reference_based.mean).toFixed(0)}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">${mcResults.map_drug.mean.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">MAP Drugs</div>
                    <div className="text-xs mt-1 text-purple-600">Save: ${(mcResults.baseline.mean - mcResults.map_drug.mean).toFixed(0)}</div>
                  </div>
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
          <div className="flex items-center gap-3">
            <Label htmlFor="company-select" className="text-sm font-medium">Company:</Label>
            <Select value={companyId} onValueChange={handleCompanySelect}>
              <SelectTrigger id="company-select" className="w-64">
                <SelectValue placeholder="Select a company..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map(company => (
                  <SelectItem key={company.company_id} value={company.company_id}>
                    {company.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6">
          {!companyId && (
            <Card className="mb-4 border-meeting2-royal/20 bg-muted/50">
              <CardContent className="py-4 text-center">
                <p className="text-sm text-muted-foreground">💡 Select a company above to save your work to the database</p>
              </CardContent>
            </Card>
          )}
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
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {constants.map(constant => (
                    <div key={constant.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={constant.active}
                          onCheckedChange={() => handleToggleConstant(constant.id)}
                        />
                        <Label className="text-sm font-medium flex-1">{constant.constant_name}</Label>
                      </div>
                      {constant.active && (
                        <div className="ml-6 space-y-1">
                          <Input 
                            type="number"
                            value={constant.constant_value}
                            onChange={(e) => handleConstantValueChange(constant.id, Number(e.target.value))}
                            className="h-8 text-sm"
                            step="0.01"
                          />
                          <p className="text-xs text-muted-foreground">{constant.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div>
                <Label htmlFor="current-cost">Current Cost ($)</Label>
                <Input 
                  id="current-cost"
                  type="number" 
                  value={currentCost}
                  onChange={(e) => setCurrentCost(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="renewal1">Renewal 1 (%)</Label>
                  <Input 
                    id="renewal1"
                    type="number" 
                    value={renewal1}
                    onChange={(e) => setRenewal1(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="renewal2">Renewal 2 (%)</Label>
                  <Input 
                    id="renewal2"
                    type="number" 
                    value={renewal2}
                    onChange={(e) => setRenewal2(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="renewal3">Renewal 3 (%) <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input 
                    id="renewal3"
                    type="number" 
                    value={renewal3}
                    onChange={(e) => setRenewal3(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Reverse-Engineered History Section */}
              <Card className="bg-muted/50 border-meeting2-royal/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-meeting2-royal">Reverse-Engineered History</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setAllowEditHistory(!allowEditHistory)}
                    >
                      {allowEditHistory ? "🔒 Lock" : "✏️ Edit"}
                    </Button>
                  </div>
                  <CardDescription className="text-xs">
                    Computed from current cost + renewals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="hist-cost1" className="text-xs">Last Year Cost</Label>
                      <Input 
                        id="hist-cost1"
                        type="number" 
                        value={histCost1}
                        onChange={(e) => setHistCost1(Number(e.target.value))}
                        disabled={!allowEditHistory}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hist-cost2" className="text-xs">Prior Year Cost</Label>
                      <Input 
                        id="hist-cost2"
                        type="number" 
                        value={histCost2}
                        onChange={(e) => setHistCost2(Number(e.target.value))}
                        disabled={!allowEditHistory}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  {histCost3 > 0 && (
                    <div>
                      <Label htmlFor="hist-cost3" className="text-xs">Year 3 Cost</Label>
                      <Input 
                        id="hist-cost3"
                        type="number" 
                        value={histCost3}
                        onChange={(e) => setHistCost3(Number(e.target.value))}
                        disabled={!allowEditHistory}
                        className="h-8 text-sm"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                <Label htmlFor="iterations">Iterations</Label>
                <Input 
                  id="iterations"
                  type="number" 
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Doctrine Options</Label>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="self-insured"
                    checked={selfInsuredActive}
                    onCheckedChange={(checked) => setSelfInsuredActive(checked as boolean)}
                  />
                  <Label htmlFor="self-insured" className="text-sm">Self-Insured (25% discount)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="reference"
                    checked={referenceActive}
                    onCheckedChange={(checked) => setReferenceActive(checked as boolean)}
                  />
                  <Label htmlFor="reference" className="text-sm">Reference-Based (15% discount)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="map"
                    checked={mapActive}
                    onCheckedChange={(checked) => setMapActive(checked as boolean)}
                  />
                  <Label htmlFor="map" className="text-sm">MAP Drugs (40% discount)</Label>
                </div>
              </div>

              <Button 
                onClick={handleRunSimulation}
                className="w-full bg-meeting2-royal hover:bg-meeting2-royal/90"
              >
                Run Simulation
              </Button>

              {/* Results */}
              {mcResults && (
                <div className="space-y-2 p-4 bg-muted rounded-lg max-h-80 overflow-y-auto">
                  <div className="text-xs font-semibold mb-2">Baseline</div>
                  <div className="text-sm space-y-1 mb-3">
                    <div><span className="font-semibold">Mean:</span> ${mcResults.baseline.mean.toFixed(0)}</div>
                    <div><span className="font-semibold">P5:</span> ${mcResults.baseline.p5.toFixed(0)}</div>
                    <div><span className="font-semibold">P95:</span> ${mcResults.baseline.p95.toFixed(0)}</div>
                  </div>

                  <div className="text-xs font-semibold mb-2 text-green-600">Self-Insured</div>
                  <div className="text-sm space-y-1 mb-3">
                    <div><span className="font-semibold">Mean:</span> ${mcResults.self_insured.mean.toFixed(0)}</div>
                    <div className="text-green-600">Saves: ${(mcResults.baseline.mean - mcResults.self_insured.mean).toFixed(0)}</div>
                  </div>

                  <div className="text-xs font-semibold mb-2 text-blue-600">Reference-Based</div>
                  <div className="text-sm space-y-1 mb-3">
                    <div><span className="font-semibold">Mean:</span> ${mcResults.reference_based.mean.toFixed(0)}</div>
                    <div className="text-blue-600">Saves: ${(mcResults.baseline.mean - mcResults.reference_based.mean).toFixed(0)}</div>
                  </div>

                  <div className="text-xs font-semibold mb-2 text-purple-600">MAP Drugs</div>
                  <div className="text-sm space-y-1 mb-3">
                    <div><span className="font-semibold">Mean:</span> ${mcResults.map_drug.mean.toFixed(0)}</div>
                    <div className="text-purple-600">Saves: ${(mcResults.baseline.mean - mcResults.map_drug.mean).toFixed(0)}</div>
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
                  <div className="font-semibold mb-2">Auto-Generated Narrative:</div>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{mcResults.narrative}</p>
                  <div className="mt-3 pt-3 border-t">
                    <div className="font-semibold mb-1">Quick Stats:</div>
                    <div>• Compliance: {calculateComplianceScore()}%</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
