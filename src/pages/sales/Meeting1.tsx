import { useState } from "react";
import { ArrowLeft, TrendingUp, CheckCircle2, Target, Calendar, Building2, Users, DollarSign, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Meeting1 = () => {
  const [companyName, setCompanyName] = useState("ABC Corporation");
  const [address, setAddress] = useState("123 Main Street");
  const [state, setState] = useState("TX");
  const [zip, setZip] = useState("75001");
  const [effectiveDate, setEffectiveDate] = useState("2024-01-01");
  const [renewalDate, setRenewalDate] = useState("2025-01-01");
  const [totalEmployees, setTotalEmployees] = useState("150");
  const [totalEnrolled, setTotalEnrolled] = useState("120");
  const [fundingType, setFundingType] = useState("Self Insured");
  const [avgMonthlyPremium, setAvgMonthlyPremium] = useState("85000");
  const [broker, setBroker] = useState("Smith Benefits Group");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    toast.success("Verification data saved", {
      description: "Data synced to Firebase: meeting_1_verification"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-meeting1-emerald/5 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link to="/sales/hub">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-meeting1-emerald">Meeting 1 — Discovery & Renewal Verification</h1>
              <p className="text-muted-foreground mt-1">Review sample deliverables, then verify your group's core information.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="space-y-8 animate-fade-in">
          
          {/* Example Previews Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Example Deliverables</h2>
            <p className="text-muted-foreground mb-6">Explore sample outputs from our process:</p>
            
            <Accordion type="single" collapsible className="w-full">
              {/* Monte Carlo Example */}
              <AccordionItem value="item-1" className="border rounded-lg mb-3 px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-meeting2-royal/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-meeting2-royal" />
                    </div>
                    <span className="font-semibold">Monte Carlo Simulation Example</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="bg-gradient-to-r from-meeting2-royal/5 to-background p-6 rounded-lg">
                    <h3 className="font-semibold text-meeting2-royal mb-3">Cost Projection Comparison</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-card p-4 rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground mb-1">Baseline Scenario</p>
                        <p className="text-2xl font-bold text-destructive">$1,245,000</p>
                        <p className="text-xs text-muted-foreground mt-1">Annual projected cost</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border border-meeting1-emerald">
                        <p className="text-sm text-muted-foreground mb-1">Optimized Scenario</p>
                        <p className="text-2xl font-bold text-meeting1-emerald">$1,087,500</p>
                        <p className="text-xs text-muted-foreground mt-1">Annual projected cost</p>
                      </div>
                    </div>
                    <div className="bg-meeting1-emerald/10 p-3 rounded border-l-4 border-meeting1-emerald">
                      <p className="text-sm font-semibold text-meeting1-emerald">Potential Savings: $157,500 (12.6%)</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Compliance Check Example */}
              <AccordionItem value="item-2" className="border rounded-lg mb-3 px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-meeting4-gold/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-meeting4-gold" />
                    </div>
                    <span className="font-semibold">Compliance Check Example</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="bg-gradient-to-r from-meeting4-gold/5 to-background p-6 rounded-lg">
                    <h3 className="font-semibold text-meeting4-gold mb-4">Compliance Status Overview</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-card rounded border-l-4 border-meeting1-emerald">
                        <CheckCircle2 className="h-5 w-5 text-meeting1-emerald" />
                        <div>
                          <p className="font-medium">ACA Section 1557 Compliance</p>
                          <p className="text-sm text-muted-foreground">Compliant - All requirements met</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-card rounded border-l-4 border-meeting4-gold">
                        <CheckCircle2 className="h-5 w-5 text-meeting4-gold" />
                        <div>
                          <p className="font-medium">Mental Health Parity</p>
                          <p className="text-sm text-muted-foreground">Pending - Documentation in review</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-card rounded border-l-4 border-destructive">
                        <CheckCircle2 className="h-5 w-5 text-destructive" />
                        <div>
                          <p className="font-medium">Transparency in Coverage</p>
                          <p className="text-sm text-muted-foreground">Missing - Files need to be posted</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Sniper Marketing Example */}
              <AccordionItem value="item-3" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-meeting3-crimson/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-meeting3-crimson" />
                    </div>
                    <span className="font-semibold">Sniper Marketing Example</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="bg-gradient-to-r from-meeting3-crimson/5 to-background p-6 rounded-lg">
                    <h3 className="font-semibold text-meeting3-crimson mb-3">Targeted Engagement Strategy</h3>
                    <div className="bg-card p-4 rounded-lg border mb-4">
                      <p className="font-medium mb-2">Primary Audience</p>
                      <p className="text-sm text-muted-foreground">HR Directors at mid-market companies (100-500 employees) experiencing 15%+ annual premium increases</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <p className="font-medium mb-2">Key Message</p>
                      <p className="text-sm text-muted-foreground">"Take control of healthcare costs with predictive analytics and compliance automation — reduce uncertainty and achieve 10-15% savings."</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm font-semibold text-meeting1-emerald uppercase tracking-wide">Renewal Verification — Confirm Details Below</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Renewal Verification Form */}
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-meeting1-emerald" />
              Renewal & Census Verification
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Name
                </Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-2"
                  placeholder="Street address"
                />
              </div>

              <div>
                <Label htmlFor="state" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  State
                </Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-2"
                  placeholder="TX"
                />
              </div>

              <div>
                <Label htmlFor="zip" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  ZIP Code
                </Label>
                <Input
                  id="zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="mt-2"
                  placeholder="75001"
                />
              </div>

              <div>
                <Label htmlFor="broker" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Broker of Record
                </Label>
                <Input
                  id="broker"
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="effective" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Effective Date
                </Label>
                <Input
                  id="effective"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="renewal" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Renewal Date
                </Label>
                <Input
                  id="renewal"
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="employees" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Employees
                </Label>
                <Input
                  id="employees"
                  type="number"
                  value={totalEmployees}
                  onChange={(e) => setTotalEmployees(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="enrolled" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Enrolled
                </Label>
                <Input
                  id="enrolled"
                  type="number"
                  value={totalEnrolled}
                  onChange={(e) => setTotalEnrolled(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="funding" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Funding Type
                </Label>
                <Select value={fundingType} onValueChange={setFundingType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Self Insured">Self Insured</SelectItem>
                    <SelectItem value="Fully Insured">Fully Insured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="premium" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Average Monthly Premium (USD)
                </Label>
                <Input
                  id="premium"
                  type="number"
                  value={avgMonthlyPremium}
                  onChange={(e) => setAvgMonthlyPremium(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Renewal Notes or Pending Items</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any notes about the renewal or pending items..."
                  className="mt-2 min-h-32"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                onClick={handleSave}
                size="lg"
                className="bg-meeting1-emerald hover:bg-meeting1-emerald/90"
              >
                Save Verification Data
              </Button>
              
              <Link to="/sales/meeting2">
                <Button
                  size="lg"
                  className="bg-meeting4-gold hover:bg-meeting4-gold/90 text-foreground"
                >
                  Continue to Meeting 2 → Education & Simulation
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Meeting1;
