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

// Utility functions for number formatting
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

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
  bad_year_stats: {
    count: number;
    frequency: number;
    avg_spike_pct: number;
    total_extra_cost: number;
    avg_extra_per_bad_year: number;
    iterations: number[];
  };
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
  bad_year_frequency?: number;
  bad_year_increase_min?: number;
  bad_year_increase_max?: number;
  use_self_insured?: boolean;
  use_rbp?: boolean;
  use_map?: boolean;
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
  const selfDisc = 0.25;
  const rbpDisc  = 0.15;
  const mapDisc  = 0.60;

  // ---------- BAD-YEAR SETTINGS ----------
  const badFreq = Number(inputs.bad_year_frequency) || 5;
  const badMin  = (Number(inputs.bad_year_increase_min) || 30) / 100;
  const badMax  = (Number(inputs.bad_year_increase_max) || 40) / 100;

  // ---------- BASELINE MONTE CARLO WITH SEQUENTIAL SAVINGS ----------
  const baseline=[], selfArr=[], refArr=[], mapArr=[];
  const badYearIterations: number[] = [];
  const badYearSpikes: number[] = [];
  const badYearExtraCosts: number[] = [];
  
  for(let i=0;i<iterations;i++){
    const rand = 1 + (Math.random()-0.5)*2*volatility;
    let cost = baseCost * rand;
    const normalCost = cost;

    // Simulate 1-in-N bad year
    if (i % badFreq === 0) {
      const spikeMultiplier = 1 + (badMin + Math.random() * (badMax - badMin));
      cost = cost * spikeMultiplier;
      badYearIterations.push(i);
      badYearSpikes.push((spikeMultiplier - 1) * 100);
      badYearExtraCosts.push(cost - normalCost);
    }

    // Baseline = current fully-insured scenario
    baseline.push(cost);

    let currentScenarioCost = cost;

    // Step 1: Self-Insured (applies only if toggled)
    if (inputs.use_self_insured) {
      currentScenarioCost *= (1 - selfDisc);
    }
    selfArr.push(currentScenarioCost);

    // Step 2: Reference-Based Pricing (adds RBP layer if checked)
    if (inputs.use_rbp) {
      currentScenarioCost *= (1 - rbpDisc);
    }
    refArr.push(currentScenarioCost);

    // Step 3: MAP (applies only to drug portion)
    if (inputs.use_map) {
      currentScenarioCost *= (1 - drugPct * mapDisc);
    }
    mapArr.push(currentScenarioCost);
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

  const histSavings = hist.map(c => {
    let currentCost = c;
    
    if (inputs.use_self_insured) currentCost *= (1 - selfDisc);
    const self_if_in_place = currentCost;
    
    if (inputs.use_rbp) currentCost *= (1 - rbpDisc);
    const ref_if_in_place = currentCost;
    
    if (inputs.use_map) currentCost *= (1 - drugPct * mapDisc);
    const map_if_in_place = currentCost;

    return {
      yearCost: c,
      self_if_in_place,
      ref_if_in_place,
      map_if_in_place
    };
  });

  const totalHistSavings = histSavings.reduce((a,b)=>a + (b.yearCost - b.map_if_in_place),0);

  // ---------- FORWARD PROJECTION ----------
  const avgGrowth = meanRenewal;
  let nextYearProjection = baseCost * (1 + avgGrowth);

  const projections = {
    baseline: nextYearProjection
  };

  if (inputs.use_self_insured) nextYearProjection *= (1 - selfDisc);
  const self_insured = nextYearProjection;
  
  if (inputs.use_rbp) nextYearProjection *= (1 - rbpDisc);
  const reference = nextYearProjection;
  
  if (inputs.use_map) nextYearProjection *= (1 - drugPct * mapDisc);
  const map_drug = nextYearProjection;

  const proj = {
    baseline: projections.baseline,
    self_insured,
    reference,
    map_drug
  };

  // ---------- BAD YEAR STATISTICS ----------
  const badYearCount = badYearIterations.length;
  const avgSpikePct = badYearSpikes.length > 0 
    ? badYearSpikes.reduce((a,b) => a+b, 0) / badYearSpikes.length 
    : 0;
  const totalExtraCost = badYearExtraCosts.reduce((a,b) => a+b, 0);
  const avgExtraPerBadYear = badYearCount > 0 ? totalExtraCost / badYearCount : 0;

  // ---------- COMBINE RESULTS ----------
  const result: MonteCarloResults = {
    baseline: baselineStats,
    self_insured: selfStats,
    reference_based: refStats,
    map_drug: mapStats,
    historical: histSavings,
    total_historical_savings_if_in_place: totalHistSavings,
    projection: proj,
    narrative: '',
    bad_year_stats: {
      count: badYearCount,
      frequency: badFreq,
      avg_spike_pct: avgSpikePct,
      total_extra_cost: totalExtraCost,
      avg_extra_per_bad_year: avgExtraPerBadYear,
      iterations: badYearIterations
    }
  };

  // ---------- NARRATIVE OUTPUT ----------
  let programs = [];
  if (inputs.use_self_insured) programs.push("Self-Insured (-25%)");
  if (inputs.use_rbp) programs.push("Reference-Based Pricing (-15%)");
  if (inputs.use_map) programs.push("MAP Drug Savings (-60% of 60% drug spend)");
  
  const badYearPct = ((badYearCount / iterations) * 100).toFixed(1);
  
  result.narrative = `Applied programs: ${programs.join(", ") || "None"}.\n\nHad these programs been active over the past 3 years, total savings ≈ ${formatCurrency(totalHistSavings)}.
Looking ahead, current projection ≈ ${formatCurrency(proj.baseline)}; with sequential savings: self-insured ≈ ${formatCurrency(proj.self_insured)}; reference ≈ ${formatCurrency(proj.reference)}; MAP Drug ≈ ${formatCurrency(proj.map_drug)}.

Bad Year Impact: In ${badYearCount} of ${iterations} simulations (${badYearPct}%), costs spiked by an average of ${avgSpikePct.toFixed(1)}% (${(badMin*100).toFixed(0)}–${(badMax*100).toFixed(0)}% range). This added approximately ${formatCurrency(totalExtraCost)} in unexpected costs across all simulations, averaging ${formatCurrency(avgExtraPerBadYear)} per bad year event.`;

  // Helper function for formatting inside runMonteCarlo
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

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
  const [badYearFrequency, setBadYearFrequency] = useState<number>(5);
  const [badYearIncreaseMin, setBadYearIncreaseMin] = useState<number>(30);
  const [badYearIncreaseMax, setBadYearIncreaseMax] = useState<number>(40);
  const [useSelfInsured, setUseSelfInsured] = useState<boolean>(true);
  const [useRbp, setUseRbp] = useState<boolean>(true);
  const [useMap, setUseMap] = useState<boolean>(true);
  const [mcResults, setMcResults] = useState<MonteCarloResults | null>(null);
  const [showRawOutput, setShowRawOutput] = useState<boolean>(false);

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
      bad_year_frequency: badYearFrequency,
      bad_year_increase_min: badYearIncreaseMin,
      bad_year_increase_max: badYearIncreaseMax,
      use_self_insured: useSelfInsured,
      use_rbp: useRbp,
      use_map: useMap,
    });
    setMcResults(results);
    setMarketingCopy(results.narrative); // Auto-populate marketing copy
    
    toast({
      title: "Simulation Complete",
      description: `Baseline: ${formatCurrency(results.baseline.mean)} | Historical savings: ${formatCurrency(results.total_historical_savings_if_in_place)}`,
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
                    <div className="text-xl font-bold text-meeting2-royal">{formatCurrency(mcResults.baseline.mean)}</div>
                    <div className="text-xs text-muted-foreground">Baseline Mean</div>
                    <div className="text-xs mt-1">P5: {formatCurrency(mcResults.baseline.p5)}</div>
                    <div className="text-xs">P95: {formatCurrency(mcResults.baseline.p95)}</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{formatCurrency(mcResults.self_insured.mean)}</div>
                    <div className="text-xs text-muted-foreground">Self-Insured</div>
                    <div className="text-xs mt-1 text-green-600">Save: {formatCurrency(mcResults.baseline.mean - mcResults.self_insured.mean)}</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{formatCurrency(mcResults.reference_based.mean)}</div>
                    <div className="text-xs text-muted-foreground">Reference-Based</div>
                    <div className="text-xs mt-1 text-blue-600">Save: {formatCurrency(mcResults.baseline.mean - mcResults.reference_based.mean)}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{formatCurrency(mcResults.map_drug.mean)}</div>
                    <div className="text-xs text-muted-foreground">MAP Drugs</div>
                    <div className="text-xs mt-1 text-purple-600">Save: {formatCurrency(mcResults.baseline.mean - mcResults.map_drug.mean)}</div>
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

          {/* One-Slide Storyboard */}
          <Card className="mb-8 border-meeting2-royal/20">
            <CardHeader>
              <CardTitle className="text-meeting2-royal">The Compliance Hub: One Source, Every Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visual Layout */}
              <div className="relative p-8 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20 rounded-lg border-2 border-teal-200 dark:border-teal-800">
                {/* Center Hub */}
                <div className="flex justify-center mb-8">
                  <div className="bg-teal-500 text-white rounded-2xl p-6 shadow-xl max-w-md text-center">
                    <div className="text-2xl font-bold mb-3">Compliance Hub</div>
                    <div className="text-sm space-y-1">
                      <div>Master Library · Regulatory Updates</div>
                      <div>State-Specific Rules · Annual Sync</div>
                    </div>
                  </div>
                </div>

                {/* Spokes (Clients) */}
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((client) => (
                    <div key={client} className="relative">
                      {/* Arrow from center */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-center">
                        <div className="text-xs text-teal-600 dark:text-teal-400 font-medium bg-white dark:bg-background px-2 py-1 rounded border border-teal-300">
                          One-way pull
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-muted rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800 shadow-md">
                        <div className="font-semibold text-sm mb-3 text-center">Client Compliance App</div>
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 text-xs p-1 rounded text-center">System</div>
                            <div className="flex-1 bg-amber-100 dark:bg-amber-900/30 text-xs p-1 rounded text-center">Payroll</div>
                          </div>
                          <div className="bg-red-100 dark:bg-red-900/30 text-xs p-1 rounded text-center">HR</div>
                          <div className="text-xs text-center text-muted-foreground mt-2">
                            Last Synced: 2024-12-15
                          </div>
                          <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <span>🛡️</span>
                            <span>Audit-Ready</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTB Altitude Legend */}
              <div className="bg-muted/50 rounded-lg p-4 border">
                <div className="font-semibold text-sm mb-3">CTB Altitude Legend</div>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">60k ft – Vision</div>
                    <div className="text-muted-foreground">One-source compliance for every client</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">40k ft – System</div>
                    <div className="text-muted-foreground">Hub → Spoke architecture</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">30k ft – Workflow</div>
                    <div className="text-muted-foreground">Auto-populate → HR completes → Audit trail</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">20k ft – Data Flow</div>
                    <div className="text-muted-foreground">Supabase → Supabase replication</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">10k ft – Execution</div>
                    <div className="text-muted-foreground">HR dashboard + annual update</div>
                  </div>
                </div>
              </div>

              {/* Sales Talking Points */}
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="font-semibold text-sm mb-3 text-blue-700 dark:text-blue-400">Three Short Sales Talking Points</div>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-blue-600 dark:text-blue-400">1.</span>
                    <span>Every client starts compliant and stays compliant—no manual updates required.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-600 dark:text-blue-400">2.</span>
                    <span>Our master hub pushes the right rules, forms, and deadlines to each client automatically.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-600 dark:text-blue-400">3.</span>
                    <span>Color-coded dashboards show exactly what's done, pending, or overdue—so audits never surprise you.</span>
                  </div>
                </div>
              </div>

              {/* Footer Tagline Options */}
              <div className="text-center pt-4 border-t">
                <div className="text-sm font-semibold mb-2 text-muted-foreground">Tagline Options (≤ 6 words):</div>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">Compliance handled—automatically, every year.</div>
                  <div className="text-muted-foreground">One source. Zero guesswork. Always current.</div>
                  <div className="text-muted-foreground">Your compliance—simplified, synced, secure.</div>
                </div>
              </div>
            </CardContent>
          </Card>

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

  const tocSections = [
    { id: "monte-carlo", label: "Monte Carlo" },
    { id: "compliance", label: "Compliance" },
    { id: "marketing", label: "Marketing" },
    { id: "storyboard", label: "Storyboard" },
    { id: "results", label: "Results" }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Table of Contents - Fixed Sidebar */}
      <div className="fixed left-4 top-20 z-50 w-48">
        <Card className="border-meeting2-royal/30 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-meeting2-royal">Quick Nav</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {tocSections.map(section => (
              <Button
                key={section.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs hover:bg-meeting2-royal/10 hover:text-meeting2-royal"
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto px-6 py-12 pl-56">
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
          <Card id="monte-carlo" className="border-meeting2-royal/20 scroll-mt-24">
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

              {/* Bad-Year Factor Section */}
              <Card className="bg-muted/50 border-orange-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-orange-600">Bad-Year Factor</CardTitle>
                  <CardDescription className="text-xs">
                    Simulate catastrophic claims years (1-in-N)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="bad-freq" className="text-xs">Frequency</Label>
                      <Input 
                        id="bad-freq"
                        type="number" 
                        value={badYearFrequency}
                        onChange={(e) => setBadYearFrequency(Number(e.target.value))}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Every N years</p>
                    </div>
                    <div>
                      <Label htmlFor="bad-min" className="text-xs">Min Spike %</Label>
                      <Input 
                        id="bad-min"
                        type="number" 
                        value={badYearIncreaseMin}
                        onChange={(e) => setBadYearIncreaseMin(Number(e.target.value))}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Minimum</p>
                    </div>
                    <div>
                      <Label htmlFor="bad-max" className="text-xs">Max Spike %</Label>
                      <Input 
                        id="bad-max"
                        type="number" 
                        value={badYearIncreaseMax}
                        onChange={(e) => setBadYearIncreaseMax(Number(e.target.value))}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Maximum</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Program Selection Section */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-blue-600 dark:text-blue-400">Program Selection</CardTitle>
                  <CardDescription className="text-xs">
                    Select which programs to apply sequentially
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="use-self-insured"
                      checked={useSelfInsured}
                      onCheckedChange={(checked) => setUseSelfInsured(checked as boolean)}
                    />
                    <Label htmlFor="use-self-insured" className="text-sm cursor-pointer">
                      Apply Self-Insured (-25%)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="use-rbp"
                      checked={useRbp}
                      onCheckedChange={(checked) => setUseRbp(checked as boolean)}
                    />
                    <Label htmlFor="use-rbp" className="text-sm cursor-pointer">
                      Apply Reference-Based Pricing (-15%)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="use-map"
                      checked={useMap}
                      onCheckedChange={(checked) => setUseMap(checked as boolean)}
                    />
                    <Label htmlFor="use-map" className="text-sm cursor-pointer">
                      Apply MAP Drug Savings (-60% of 60% drug spend)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    💡 Programs apply sequentially in order. Uncheck any that the client already has in place.
                  </p>
                </CardContent>
              </Card>

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
                    <div><span className="font-semibold">Mean:</span> {formatCurrency(mcResults.baseline.mean)}</div>
                    <div><span className="font-semibold">P5:</span> {formatCurrency(mcResults.baseline.p5)}</div>
                    <div><span className="font-semibold">P95:</span> {formatCurrency(mcResults.baseline.p95)}</div>
                  </div>

                  <div className="text-xs font-semibold mb-2 text-green-600">Self-Insured</div>
                  <div className="text-sm space-y-1 mb-3">
                    <div><span className="font-semibold">Mean:</span> {formatCurrency(mcResults.self_insured.mean)}</div>
                    <div className="text-green-600">Saves: {formatCurrency(mcResults.baseline.mean - mcResults.self_insured.mean)}</div>
                  </div>

                  <div className="text-xs font-semibold mb-2 text-blue-600">Reference-Based</div>
                  <div className="text-sm space-y-1 mb-3">
                    <div><span className="font-semibold">Mean:</span> {formatCurrency(mcResults.reference_based.mean)}</div>
                    <div className="text-blue-600">Saves: {formatCurrency(mcResults.baseline.mean - mcResults.reference_based.mean)}</div>
                  </div>

                  <div className="text-xs font-semibold mb-2 text-purple-600">MAP Drugs</div>
                  <div className="text-sm space-y-1 mb-3">
                    <div><span className="font-semibold">Mean:</span> {formatCurrency(mcResults.map_drug.mean)}</div>
                    <div className="text-purple-600">Saves: {formatCurrency(mcResults.baseline.mean - mcResults.map_drug.mean)}</div>
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
          <Card id="compliance" className="border-meeting2-royal/20 scroll-mt-24">
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
          <Card id="marketing" className="border-meeting2-royal/20 scroll-mt-24">
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

        {/* One-Slide Storyboard */}
        <Card id="storyboard" className="mt-6 border-meeting2-royal/20 scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-meeting2-royal">One-Slide Storyboard</CardTitle>
            <CardDescription>The Compliance Hub: One Source, Every Client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual Layout */}
            <div className="relative p-8 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20 rounded-lg border-2 border-teal-200 dark:border-teal-800">
              {/* Center Hub */}
              <div className="flex justify-center mb-8">
                <div className="bg-teal-500 text-white rounded-2xl p-6 shadow-xl max-w-md text-center">
                  <div className="text-2xl font-bold mb-3">Compliance Hub</div>
                  <div className="text-sm space-y-1">
                    <div>Master Library · Regulatory Updates</div>
                    <div>State-Specific Rules · Annual Sync</div>
                  </div>
                </div>
              </div>

              {/* Spokes (Clients) */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((client) => (
                  <div key={client} className="relative">
                    {/* Arrow indicator */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-center">
                      <div className="text-xs text-teal-600 dark:text-teal-400 font-medium bg-white dark:bg-background px-2 py-1 rounded border border-teal-300">
                        ↓ One-way pull
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-muted rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800 shadow-md">
                      <div className="font-semibold text-sm mb-3 text-center">Client Compliance App</div>
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 text-xs p-1 rounded text-center">System</div>
                          <div className="flex-1 bg-amber-100 dark:bg-amber-900/30 text-xs p-1 rounded text-center">Payroll</div>
                        </div>
                        <div className="bg-red-100 dark:bg-red-900/30 text-xs p-1 rounded text-center">HR</div>
                        <div className="text-xs text-center text-muted-foreground mt-2">
                          Last Synced: 2024-12-15
                        </div>
                        <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <span>🛡️</span>
                          <span>Audit-Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTB Altitude Legend */}
            <div className="bg-muted/50 rounded-lg p-4 border">
              <div className="font-semibold text-sm mb-3">CTB Altitude Legend</div>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">60k ft – Vision</div>
                  <div className="text-muted-foreground">One-source compliance for every client</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">40k ft – System</div>
                  <div className="text-muted-foreground">Hub → Spoke architecture</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">30k ft – Workflow</div>
                  <div className="text-muted-foreground">Auto-populate → HR completes → Audit trail</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">20k ft – Data Flow</div>
                  <div className="text-muted-foreground">Supabase → Supabase replication</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">10k ft – Execution</div>
                  <div className="text-muted-foreground">HR dashboard + annual update</div>
                </div>
              </div>
            </div>

            {/* Sales Talking Points */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="font-semibold text-sm mb-3 text-blue-700 dark:text-blue-400">Three Short Sales Talking Points</div>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400">1.</span>
                  <span>Every client starts compliant and stays compliant—no manual updates required.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400">2.</span>
                  <span>Our master hub pushes the right rules, forms, and deadlines to each client automatically.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400">3.</span>
                  <span>Color-coded dashboards show exactly what's done, pending, or overdue—so audits never surprise you.</span>
                </div>
              </div>
            </div>

            {/* Footer Tagline Options */}
            <div className="text-center pt-4 border-t">
              <div className="text-sm font-semibold mb-2 text-muted-foreground">Tagline Options (≤ 6 words):</div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">Compliance handled—automatically, every year.</div>
                <div className="text-muted-foreground">One source. Zero guesswork. Always current.</div>
                <div className="text-muted-foreground">Your compliance—simplified, synced, secure.</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Results Preview - Review & Adjust Panel */}
        {mcResults && (
          <Card id="results" className="mt-6 border-meeting2-royal/30 shadow-lg scroll-mt-24">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-meeting2-royal">Simulation Results Preview</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRawOutput(!showRawOutput)}
                  className="text-xs"
                >
                  {showRawOutput ? "Hide Raw Output" : "Show Raw Output"}
                </Button>
              </div>
              <CardDescription>Review and adjust results before presenting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Editable Summary Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Scenario</th>
                      <th className="p-2 text-right">Mean Cost ($)</th>
                      <th className="p-2 text-right">5% Low</th>
                      <th className="p-2 text-right">95% High</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-2 font-medium">Baseline</td>
                      <td className="p-2 text-right">
                        <Input
                          type="number"
                          className="w-32 h-8 text-right text-sm"
                          value={Number(mcResults.baseline.mean || 0).toFixed(2)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMcResults({
                              ...mcResults,
                              baseline: { ...mcResults.baseline, mean: val }
                            });
                          }}
                        />
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        {formatCurrency(mcResults.baseline.p5)}
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        {formatCurrency(mcResults.baseline.p95)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 font-medium">Self-Insured</td>
                      <td className="p-2 text-right">
                        <Input
                          type="number"
                          className="w-32 h-8 text-right text-sm"
                          value={Number(mcResults.self_insured.mean || 0).toFixed(2)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMcResults({
                              ...mcResults,
                              self_insured: { ...mcResults.self_insured, mean: val }
                            });
                          }}
                        />
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        {formatCurrency(mcResults.self_insured.p5)}
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        {formatCurrency(mcResults.self_insured.p95)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 font-medium">Reference-Based</td>
                      <td className="p-2 text-right">
                        <Input
                          type="number"
                          className="w-32 h-8 text-right text-sm"
                          value={Number(mcResults.reference_based.mean || 0).toFixed(2)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMcResults({
                              ...mcResults,
                              reference_based: { ...mcResults.reference_based, mean: val }
                            });
                          }}
                        />
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        {formatCurrency(mcResults.reference_based.p5)}
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        {formatCurrency(mcResults.reference_based.p95)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 font-medium">MAP Drugs</td>
                      <td className="p-2 text-right">
                        <Input
                          type="number"
                          className="w-32 h-8 text-right text-sm"
                          value={Number(mcResults.map_drug.mean || 0).toFixed(2)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMcResults({
                              ...mcResults,
                              map_drug: { ...mcResults.map_drug, mean: val }
                            });
                          }}
                        />
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        {formatCurrency(mcResults.map_drug.p5)}
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        {formatCurrency(mcResults.map_drug.p95)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Narrative Paragraph */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <Label className="text-sm font-semibold mb-2 block">Generated Narrative</Label>
                <p className="text-sm text-foreground whitespace-pre-line">
                  {mcResults.narrative}
                </p>
              </div>

              {/* Bad Year Analysis */}
              {mcResults.bad_year_stats && mcResults.bad_year_stats.count > 0 && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg space-y-3">
                  <div className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2">
                    🔥 Bad Year Impact Analysis
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Bad Years in Simulation</div>
                      <div className="text-xl font-bold text-orange-600">
                        {mcResults.bad_year_stats.count} of {iterations}
                      </div>
                      <div className="text-xs text-orange-600/80">
                        ({((mcResults.bad_year_stats.count / iterations) * 100).toFixed(1)}% of iterations)
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground">Average Spike</div>
                      <div className="text-xl font-bold text-orange-600">
                        {formatPercent(mcResults.bad_year_stats.avg_spike_pct)}
                      </div>
                      <div className="text-xs text-orange-600/80">
                        {formatPercent(badYearIncreaseMin)}–{formatPercent(badYearIncreaseMax)} range
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground">Total Extra Cost (All Bad Years)</div>
                      <div className="text-xl font-bold text-orange-600">
                        {formatCurrency(mcResults.bad_year_stats.total_extra_cost)}
                      </div>
                      <div className="text-xs text-orange-600/80">
                        Across {mcResults.bad_year_stats.count} bad year events
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground">Avg Cost Per Bad Year</div>
                      <div className="text-xl font-bold text-orange-600">
                        {formatCurrency(mcResults.bad_year_stats.avg_extra_per_bad_year)}
                      </div>
                      <div className="text-xs text-orange-600/80">
                        1 in {mcResults.bad_year_stats.frequency} year frequency
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
                    <div className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
                      3-Year Outlook
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Probability of experiencing at least 1 bad year in next 3 years: 
                      <span className="font-bold text-orange-600 ml-1">
                        {(100 * (1 - Math.pow((1 - 1/mcResults.bad_year_stats.frequency), 3))).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Historical Savings Summary */}
              {mcResults.total_historical_savings_if_in_place > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">
                    Historical "What-If" Savings
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                    {formatCurrency(mcResults.total_historical_savings_if_in_place)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    If programs had been in place over past {mcResults.historical.length} year(s)
                  </p>
                </div>
              )}

              {/* Raw JSON Toggle */}
              {showRawOutput && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Raw Output (Debug)</Label>
                  <pre className="bg-muted border rounded p-3 text-xs overflow-auto max-h-64 font-mono">
                    {JSON.stringify(mcResults, null, 2)}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setMcResults(null)}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleSaveMonteCarlo}
                  variant="outline"
                  className="border-meeting2-royal text-meeting2-royal hover:bg-meeting2-royal hover:text-white"
                  disabled={!companyId}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save to Database
                </Button>
                <Button
                  onClick={handleEnterPresentation}
                  className="bg-meeting4-gold hover:bg-meeting4-gold/90 text-white"
                >
                  <Presentation className="w-4 h-4 mr-2" />
                  Enter Presentation Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
