import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, ExternalLink, Calendar, Mail, Phone, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Company {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lastUpdated?: string;
  tags?: string[];
}

const CRMIntakeGateway = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importedCompany, setImportedCompany] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a company name to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('composio-activecamp', {
        body: {
          action: 'searchCompanies',
          payload: {
            query: searchQuery,
            limit: 20,
          },
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        // Transform Composio response to our Company interface
        const transformedCompanies = (data.data.companies || []).map((c: any) => ({
          id: c.id || c.company_id,
          name: c.name || c.company_name || 'Unnamed Company',
          contact_name: c.contact_name || c.primary_contact?.name,
          contact_email: c.contact_email || c.primary_contact?.email,
          phone: c.phone,
          address: c.address,
          city: c.city,
          state: c.state,
          zip: c.zip,
          lastUpdated: c.updated_at || c.last_activity,
          tags: c.tags || [],
        }));
        
        setCompanies(transformedCompanies);
        
        toast({
          title: "Search complete",
          description: `Found ${transformedCompanies.length} companies`,
        });
      } else {
        setCompanies([]);
        toast({
          title: "No results",
          description: "No companies found matching your search",
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error.message || "Failed to search ActiveCampaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (company: Company) => {
    setImporting(true);
    try {
      // Get detailed company info from Composio
      const { data: detailData, error: detailError } = await supabase.functions.invoke('composio-activecamp', {
        body: {
          action: 'getCompanyDetails',
          payload: {
            companyId: company.id,
          },
        },
      });

      if (detailError) throw detailError;

      // Prepare data for Supabase
      const companyData = {
        company_id: company.id,
        company_name: company.name,
        contact_name: company.contact_name || detailData?.data?.contact_name,
        contact_email: company.contact_email || detailData?.data?.contact_email,
        // Map additional fields if available
        total_employees: detailData?.data?.total_employees || null,
        renewal_date: detailData?.data?.renewal_date || null,
      };

      // Insert or update in Supabase
      const { error: upsertError } = await supabase
        .from('company_profiles')
        .upsert(companyData, { 
          onConflict: 'company_id',
        });

      if (upsertError) throw upsertError;

      setImportedCompany(company.name);
      setShowConfirmModal(true);

      toast({
        title: "Import successful",
        description: `${company.name} has been imported to the database`,
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message || "Failed to import company data",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-4">
            <div className="bg-hub-teal/10 text-hub-teal px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <Search className="w-4 h-4" />
              CRM Integration
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-hub-teal">
            CRM Intake Gateway
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search ActiveCampaign for companies and import their data into Supabase to begin a new meeting.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8 border-hub-teal/20">
          <CardHeader>
            <CardTitle className="text-hub-teal">Search ActiveCampaign Companies</CardTitle>
            <CardDescription>Enter a company name to search the CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="bg-meeting4-gold hover:bg-meeting4-gold/90 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {companies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Search Results ({companies.length})
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <Card key={company.id} className="border-meeting2-royal/20 hover:border-meeting2-royal/40 transition-all">
                  <CardHeader>
                    <CardTitle className="text-meeting2-royal flex items-start justify-between">
                      <span className="flex-1">{company.name}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company.contact_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{company.contact_name}</span>
                      </div>
                    )}
                    
                    {company.contact_email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{company.contact_email}</span>
                      </div>
                    )}
                    
                    {company.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    
                    {(company.city || company.state) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{[company.city, company.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    
                    {company.lastUpdated && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(company.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    )}

                    <Button 
                      onClick={() => handleImport(company)}
                      disabled={importing}
                      className="w-full mt-4 bg-meeting4-gold hover:bg-meeting4-gold/90 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {importing ? 'Importing...' : 'Import to Supabase'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-meeting1-emerald">Import Successful</DialogTitle>
              <DialogDescription>
                {importedCompany} has been successfully imported to Supabase and is ready for Meeting 1.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={() => navigate('/sales/meeting1')}
                className="flex-1 bg-meeting4-gold hover:bg-meeting4-gold/90 text-white"
              >
                Open Meeting 1
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
              >
                Return to Search
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CRMIntakeGateway;
