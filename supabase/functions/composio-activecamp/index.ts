import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const COMPOSIO_API_KEY = Deno.env.get('COMPOSIO_API_KEY');
    
    if (!COMPOSIO_API_KEY) {
      throw new Error('COMPOSIO_API_KEY not configured');
    }

    const { action, payload } = await req.json();
    console.log('Composio action requested:', action, 'with payload:', payload);

    let endpoint = '';
    let method = 'POST';
    let body: any = payload;

    // Map actions to Composio ActiveCampaign endpoints
    switch (action) {
      case 'searchCompanies':
        endpoint = 'https://backend.composio.dev/api/v1/actions/activecampaign_search_companies/execute';
        body = {
          connectedAccountId: payload.connectedAccountId || 'default',
          input: {
            query: payload.query,
            limit: payload.limit || 20,
          }
        };
        break;
      
      case 'getCompanyDetails':
        endpoint = 'https://backend.composio.dev/api/v1/actions/activecampaign_get_company/execute';
        body = {
          connectedAccountId: payload.connectedAccountId || 'default',
          input: {
            companyId: payload.companyId,
          }
        };
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log('Calling Composio endpoint:', endpoint);

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': COMPOSIO_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Composio API error:', response.status, errorText);
      throw new Error(`Composio API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Composio response received successfully');

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in composio-activecamp function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
