import { useState } from "react";
import { ArrowLeft, TrendingUp, CheckCircle2, Target, Calendar, Building2, Users, DollarSign, FileText, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Textarea } from "@/ui/components/textarea";
import { Checkbox } from "@/ui/components/checkbox";
import MeetingNavigation from "@/ui/components/sales/MeetingNavigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/components/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { toast } from "sonner";

const Meeting1 = () => {
  const [companyName, setCompanyName] = useState("ABC Corporation");
  const [address, setAddress] = useState("123 Main Street");
  const [state, setState] = useState("TX");
  const [zip, setZip] = useState("75001");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [workPhone, setWorkPhone] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [renewalMonth, setRenewalMonth] = useState("1");
  const [totalEmployees, setTotalEmployees] = useState("150");
  const [totalEnrolled, setTotalEnrolled] = useState("120");
  const [fundingType, setFundingType] = useState("Self Insured");
  const [avgMonthlyPremium, setAvgMonthlyPremium] = useState("85000");
  const [broker, setBroker] = useState("Smith Benefits Group");
  const [notes, setNotes] = useState("");
  
  // Other Benefits checkboxes
  const [dentalChecked, setDentalChecked] = useState(false);
  const [dentalCarrier, setDentalCarrier] = useState("");
  const [visionChecked, setVisionChecked] = useState(false);
  const [visionCarrier, setVisionCarrier] = useState("");
  const [lifeChecked, setLifeChecked] = useState(false);
  const [lifeCarrier, setLifeCarrier] = useState("");
  const [stdChecked, setStdChecked] = useState(false);
  const [stdCarrier, setStdCarrier] = useState("");
  const [ltdChecked, setLtdChecked] = useState(false);
  const [ltdCarrier, setLtdCarrier] = useState("");
  const [other1Checked, setOther1Checked] = useState(false);
  const [other1Text, setOther1Text] = useState("");
  const [other1Carrier, setOther1Carrier] = useState("");
  const [other2Checked, setOther2Checked] = useState(false);
  const [other2Text, setOther2Text] = useState("");
  const [other2Carrier, setOther2Carrier] = useState("");
  
  // Conditional fields based on funding type
  const [currentCarrier, setCurrentCarrier] = useState("");
  const [currentTPA, setCurrentTPA] = useState("");
  const [currentPBM, setCurrentPBM] = useState("");
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [businessIssuesTech, setBusinessIssuesTech] = useState("");
  
  // Health tier costs
  const [tierEmployee, setTierEmployee] = useState("");
  const [tierEmployeeSpouse, setTierEmployeeSpouse] = useState("");
  const [tierEmployeeChildren, setTierEmployeeChildren] = useState("");
  const [tierFamily, setTierFamily] = useState("");

  // Compliance checklist items
  type ComplianceStatus = "Compliant" | "Pending" | "Missing";
  type ComplianceItem = {
    id: string;
    label: string;
    status: ComplianceStatus;
    notes: string;
    showNotes: boolean;
    files: File[];
  };

  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([
    { id: "1", label: "ACA Reporting (1095-C)", status: "Compliant", notes: "", showNotes: false, files: [] },
    { id: "2", label: "ERISA Wrap Document", status: "Compliant", notes: "", showNotes: false, files: [] },
    { id: "3", label: "SPD Distribution to Employees", status: "Pending", notes: "", showNotes: false, files: [] },
    { id: "4", label: "COBRA Notices Current", status: "Compliant", notes: "", showNotes: false, files: [] },
    { id: "5", label: "Section 125 / Nondiscrimination Testing", status: "Pending", notes: "", showNotes: false, files: [] },
    { id: "6", label: "5500 Filed for Prior Plan Year", status: "Compliant", notes: "", showNotes: false, files: [] },
    { id: "7", label: "State-Specific Mandates (if applicable)", status: "Missing", notes: "", showNotes: false, files: [] },
    { id: "8", label: "Other 1 (Custom Input)", status: "Pending", notes: "", showNotes: false, files: [] },
    { id: "9", label: "Other 2 (Custom Input)", status: "Pending", notes: "", showNotes: false, files: [] },
  ]);

  const updateComplianceStatus = (id: string, status: ComplianceStatus) => {
    setComplianceItems(items =>
      items.map(item => item.id === id ? { ...item, status } : item)
    );
  };

  const updateComplianceNotes = (id: string, notes: string) => {
    setComplianceItems(items =>
      items.map(item => item.id === id ? { ...item, notes } : item)
    );
  };

  const updateComplianceLabel = (id: string, label: string) => {
    setComplianceItems(items =>
      items.map(item => item.id === id ? { ...item, label } : item)
    );
  };

  const updateComplianceFiles = (id: string, files: File[]) => {
    setComplianceItems(items =>
      items.map(item => item.id === id ? { ...item, files } : item)
    );
  };

  const toggleNotesVisibility = (id: string) => {
    setComplianceItems(items =>
      items.map(item => item.id === id ? { ...item, showNotes: !item.showNotes } : item)
    );
  };

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case "Compliant":
        return "text-meeting1-emerald border-meeting1-emerald bg-meeting1-emerald/5";
      case "Pending":
        return "text-meeting4-gold border-meeting4-gold bg-meeting4-gold/5";
      case "Missing":
        return "text-meeting3-crimson border-meeting3-crimson bg-meeting3-crimson/5";
    }
  };

  const handleSave = () => {
    toast.success("Verification data saved", {
      description: "Data synced to Firebase: meeting_1_verification"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-meeting1-emerald/5 to-background">
      <MeetingNavigation />
      
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
      <main className="container mx-auto px-6 py-12 max-w-5xl pl-56">
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

          {/* Company & Contact Information Section */}
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-meeting1-emerald" />
              Company & Contact Information
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

              <div className="md:col-span-2">
                <Label htmlFor="contactName" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contact Name
                </Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-2"
                  placeholder="Primary contact name"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="contactEmail" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-2"
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <Label htmlFor="workPhone" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Work Phone
                </Label>
                <Input
                  id="workPhone"
                  type="tel"
                  value={workPhone}
                  onChange={(e) => setWorkPhone(e.target.value)}
                  className="mt-2"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="mobilePhone" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Mobile Phone
                </Label>
                <Input
                  id="mobilePhone"
                  type="tel"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  className="mt-2"
                  placeholder="(555) 987-6543"
                />
              </div>
            </div>
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
              Health Insurance Renewal Census Verification
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                <Label htmlFor="renewalMonth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Renewal Month
                </Label>
                <Select value={renewalMonth} onValueChange={setRenewalMonth}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - January</SelectItem>
                    <SelectItem value="2">2 - February</SelectItem>
                    <SelectItem value="3">3 - March</SelectItem>
                    <SelectItem value="4">4 - April</SelectItem>
                    <SelectItem value="5">5 - May</SelectItem>
                    <SelectItem value="6">6 - June</SelectItem>
                    <SelectItem value="7">7 - July</SelectItem>
                    <SelectItem value="8">8 - August</SelectItem>
                    <SelectItem value="9">9 - September</SelectItem>
                    <SelectItem value="10">10 - October</SelectItem>
                    <SelectItem value="11">11 - November</SelectItem>
                    <SelectItem value="12">12 - December</SelectItem>
                  </SelectContent>
                </Select>
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

              {/* Conditional fields based on funding type */}
              {fundingType === "Fully Insured" && (
                <div>
                  <Label htmlFor="carrier" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Current Carrier
                  </Label>
                  <Input
                    id="carrier"
                    value={currentCarrier}
                    onChange={(e) => setCurrentCarrier(e.target.value)}
                    placeholder="e.g., Blue Cross Blue Shield"
                    className="mt-2"
                  />
                </div>
              )}

              {fundingType === "Self Insured" && (
                <>
                  <div>
                    <Label htmlFor="tpa" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Current TPA
                    </Label>
                    <Input
                      id="tpa"
                      value={currentTPA}
                      onChange={(e) => setCurrentTPA(e.target.value)}
                      placeholder="Third Party Administrator"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pbm" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Current PBM
                    </Label>
                    <Input
                      id="pbm"
                      value={currentPBM}
                      onChange={(e) => setCurrentPBM(e.target.value)}
                      placeholder="Pharmacy Benefits Manager"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="network" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Current Network
                    </Label>
                    <Input
                      id="network"
                      value={currentNetwork}
                      onChange={(e) => setCurrentNetwork(e.target.value)}
                      placeholder="Provider Network"
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              {/* Health Tier Costs */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-meeting1-emerald" />
                  Health Tier Costs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tierEmployee" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Employee
                    </Label>
                    <Input
                      id="tierEmployee"
                      type="number"
                      value={tierEmployee}
                      onChange={(e) => setTierEmployee(e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tierEmployeeSpouse" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Employee + Spouse
                    </Label>
                    <Input
                      id="tierEmployeeSpouse"
                      type="number"
                      value={tierEmployeeSpouse}
                      onChange={(e) => setTierEmployeeSpouse(e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tierEmployeeChildren" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Employee + Child(ren)
                    </Label>
                    <Input
                      id="tierEmployeeChildren"
                      type="number"
                      value={tierEmployeeChildren}
                      onChange={(e) => setTierEmployeeChildren(e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tierFamily" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Family
                    </Label>
                    <Input
                      id="tierFamily"
                      type="number"
                      value={tierFamily}
                      onChange={(e) => setTierFamily(e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
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
                </div>
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

              {/* Other Benefits Section */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-meeting1-emerald" />
                  Other Benefits
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="dental"
                      checked={dentalChecked}
                      onCheckedChange={(checked) => setDentalChecked(checked as boolean)}
                    />
                    <Label htmlFor="dental" className="cursor-pointer min-w-[100px]">Dental</Label>
                    <Input
                      value={dentalCarrier}
                      onChange={(e) => setDentalCarrier(e.target.value)}
                      placeholder="Carrier name"
                      className="flex-1"
                      disabled={!dentalChecked}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="vision"
                      checked={visionChecked}
                      onCheckedChange={(checked) => setVisionChecked(checked as boolean)}
                    />
                    <Label htmlFor="vision" className="cursor-pointer min-w-[100px]">Vision</Label>
                    <Input
                      value={visionCarrier}
                      onChange={(e) => setVisionCarrier(e.target.value)}
                      placeholder="Carrier name"
                      className="flex-1"
                      disabled={!visionChecked}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="life"
                      checked={lifeChecked}
                      onCheckedChange={(checked) => setLifeChecked(checked as boolean)}
                    />
                    <Label htmlFor="life" className="cursor-pointer min-w-[100px]">Life</Label>
                    <Input
                      value={lifeCarrier}
                      onChange={(e) => setLifeCarrier(e.target.value)}
                      placeholder="Carrier name"
                      className="flex-1"
                      disabled={!lifeChecked}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="std"
                      checked={stdChecked}
                      onCheckedChange={(checked) => setStdChecked(checked as boolean)}
                    />
                    <Label htmlFor="std" className="cursor-pointer min-w-[180px]">Short-Term Disability (STD)</Label>
                    <Input
                      value={stdCarrier}
                      onChange={(e) => setStdCarrier(e.target.value)}
                      placeholder="Carrier name"
                      className="flex-1"
                      disabled={!stdChecked}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="ltd"
                      checked={ltdChecked}
                      onCheckedChange={(checked) => setLtdChecked(checked as boolean)}
                    />
                    <Label htmlFor="ltd" className="cursor-pointer min-w-[180px]">Long-Term Disability (LTD)</Label>
                    <Input
                      value={ltdCarrier}
                      onChange={(e) => setLtdCarrier(e.target.value)}
                      placeholder="Carrier name"
                      className="flex-1"
                      disabled={!ltdChecked}
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="other1"
                      checked={other1Checked}
                      onCheckedChange={(checked) => setOther1Checked(checked as boolean)}
                      className="mt-3"
                    />
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="other1Input" className="cursor-pointer">Other 1</Label>
                        <Input
                          id="other1Input"
                          value={other1Text}
                          onChange={(e) => setOther1Text(e.target.value)}
                          placeholder="Benefit type"
                          className="mt-2"
                          disabled={!other1Checked}
                        />
                      </div>
                      <div>
                        <Label htmlFor="other1Carrier" className="cursor-pointer">Carrier</Label>
                        <Input
                          id="other1Carrier"
                          value={other1Carrier}
                          onChange={(e) => setOther1Carrier(e.target.value)}
                          placeholder="Carrier name"
                          className="mt-2"
                          disabled={!other1Checked}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="other2"
                      checked={other2Checked}
                      onCheckedChange={(checked) => setOther2Checked(checked as boolean)}
                      className="mt-3"
                    />
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="other2Input" className="cursor-pointer">Other 2</Label>
                        <Input
                          id="other2Input"
                          value={other2Text}
                          onChange={(e) => setOther2Text(e.target.value)}
                          placeholder="Benefit type"
                          className="mt-2"
                          disabled={!other2Checked}
                        />
                      </div>
                      <div>
                        <Label htmlFor="other2Carrier" className="cursor-pointer">Carrier</Label>
                        <Input
                          id="other2Carrier"
                          value={other2Carrier}
                          onChange={(e) => setOther2Carrier(e.target.value)}
                          placeholder="Carrier name"
                          className="mt-2"
                          disabled={!other2Checked}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Section Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm font-semibold text-meeting4-gold uppercase tracking-wide">Compliance Requirements</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Compliance Checklist Section */}
            <div className="space-y-6">
              <div className="bg-[hsl(var(--teal)/0.1)] p-4 rounded-lg border border-[hsl(var(--teal)/0.3)]">
                <h3 className="font-bold text-lg text-white mb-2">
                  Compliance Checklist — Confirm Required Items
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review each compliance requirement and update status during your Zoom presentation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complianceItems.map((item) => (
                  <Card key={item.id} className={`p-4 border-2 transition-all ${getStatusColor(item.status)}`}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          {(item.id === "8" || item.id === "9") ? (
                            <Input
                              value={item.label}
                              onChange={(e) => updateComplianceLabel(item.id, e.target.value)}
                              placeholder={`Enter custom compliance item ${item.id === "8" ? "1" : "2"}`}
                              className="font-semibold text-sm h-8"
                            />
                          ) : (
                            <p className="font-semibold text-sm">{item.label}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleNotesVisibility(item.id)}
                          title="Add notes"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant={item.status === "Compliant" ? "default" : "outline"}
                          size="sm"
                          className={`flex-1 text-xs ${
                            item.status === "Compliant"
                              ? "bg-meeting1-emerald hover:bg-meeting1-emerald/90 text-white"
                              : "hover:bg-meeting1-emerald/10"
                          }`}
                          onClick={() => updateComplianceStatus(item.id, "Compliant")}
                        >
                          Compliant
                        </Button>
                        <Button
                          variant={item.status === "Pending" ? "default" : "outline"}
                          size="sm"
                          className={`flex-1 text-xs ${
                            item.status === "Pending"
                              ? "bg-meeting4-gold hover:bg-meeting4-gold/90 text-white"
                              : "hover:bg-meeting4-gold/10"
                          }`}
                          onClick={() => updateComplianceStatus(item.id, "Pending")}
                        >
                          Pending
                        </Button>
                        <Button
                          variant={item.status === "Missing" ? "default" : "outline"}
                          size="sm"
                          className={`flex-1 text-xs ${
                            item.status === "Missing"
                              ? "bg-meeting3-crimson hover:bg-meeting3-crimson/90 text-white"
                              : "hover:bg-meeting3-crimson/10"
                          }`}
                          onClick={() => updateComplianceStatus(item.id, "Missing")}
                        >
                          Missing
                        </Button>
                      </div>

                      {item.showNotes && (
                        <Textarea
                          value={item.notes}
                          onChange={(e) => updateComplianceNotes(item.id, e.target.value)}
                          placeholder="Add notes about this compliance item..."
                          className="text-sm min-h-20"
                        />
                      )}

                      <div className="mt-2">
                        <Label htmlFor={`file-${item.id}`} className="text-xs text-muted-foreground">
                          Upload Documents
                        </Label>
                        <Input
                          id={`file-${item.id}`}
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            updateComplianceFiles(item.id, [...item.files, ...files]);
                          }}
                          className="mt-1 text-xs"
                        />
                        {item.files.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {item.files.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                                <span className="truncate flex-1">{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    const newFiles = item.files.filter((_, i) => i !== idx);
                                    updateComplianceFiles(item.id, newFiles);
                                  }}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    toast.success("Compliance checklist saved", {
                      description: "Data synced to: meeting_1_verification.compliance_info.checklist"
                    });
                  }}
                  className="bg-[hsl(var(--teal))] hover:bg-[hsl(var(--teal)/0.9)] text-white"
                >
                  Save Compliance Checklist
                </Button>
              </div>
            </div>

            {/* Solving Business Issues Section Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm font-semibold text-meeting3-crimson uppercase tracking-wide">Solving Business Issues</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Solving Business Issues Section */}
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-meeting3-crimson/5 p-6 rounded-lg border border-meeting3-crimson/20">
                <h3 className="font-semibold text-meeting3-crimson mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Business Challenges & Solutions
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Identify key business challenges and document proposed solutions.
                </p>
                
                <div>
                  <Label htmlFor="businessTech">Solving Business Issues with Tech</Label>
                  <Textarea
                    id="businessTech"
                    value={businessIssuesTech}
                    onChange={(e) => setBusinessIssuesTech(e.target.value)}
                    placeholder="Describe how technology solutions can address the client's business challenges..."
                    className="mt-2 min-h-32"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center mt-8 pt-6 border-t">
              <Button
                onClick={handleSave}
                size="lg"
                className="bg-meeting1-emerald hover:bg-meeting1-emerald/90"
              >
                Save Verification Data
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Meeting1;
