import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is dbarton@svg.agency
    if (user.email !== 'dbarton@svg.agency') {
      console.error('User not authorized:', user.email);
      return new Response(
        JSON.stringify({ error: 'Only dbarton@svg.agency can export data' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching data for export...');

    // Fetch all meeting records
    const { data: meetingRecords, error: meetingError } = await supabaseClient
      .from('meeting_records')
      .select('*')
      .order('company_id', { ascending: true })
      .order('meeting_number', { ascending: true });

    if (meetingError) {
      console.error('Error fetching meeting records:', meetingError);
      throw meetingError;
    }

    // Fetch all company profiles
    const { data: companyProfiles, error: profileError } = await supabaseClient
      .from('company_profiles')
      .select('*')
      .order('company_id', { ascending: true });

    if (profileError) {
      console.error('Error fetching company profiles:', profileError);
      throw profileError;
    }

    console.log(`Found ${meetingRecords?.length || 0} meeting records and ${companyProfiles?.length || 0} company profiles`);

    // Get Neon API configuration from secrets
    const neonApiKey = Deno.env.get('NEON_API_KEY');
    const neonEndpoint = Deno.env.get('NEON_ENDPOINT');

    if (!neonApiKey || !neonEndpoint) {
      console.error('Missing Neon configuration');
      return new Response(
        JSON.stringify({ 
          error: 'Neon configuration not found. Please set NEON_API_KEY and NEON_ENDPOINT secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for export
    const exportData = {
      exported_at: new Date().toISOString(),
      exported_by: user.email,
      company_profiles: companyProfiles,
      meeting_records: meetingRecords,
      total_companies: companyProfiles?.length || 0,
      total_records: meetingRecords?.length || 0,
    };

    console.log('Sending data to Neon...');

    // Send to Neon (placeholder - actual implementation depends on Neon's API)
    // This is a template that should be customized based on Neon's API structure
    const neonResponse = await fetch(neonEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${neonApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportData),
    });

    if (!neonResponse.ok) {
      const errorText = await neonResponse.text();
      console.error('Neon API error:', errorText);
      throw new Error(`Neon API error: ${neonResponse.status} - ${errorText}`);
    }

    const neonResult = await neonResponse.json();
    console.log('Export successful:', neonResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data exported to Neon successfully',
        summary: {
          companies_exported: companyProfiles?.length || 0,
          records_exported: meetingRecords?.length || 0,
          exported_at: exportData.exported_at,
        },
        neon_response: neonResult,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during export';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
