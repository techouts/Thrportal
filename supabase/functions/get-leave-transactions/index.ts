import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  employeeId: string;
  leaveType: string;
  year?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { employeeId, leaveType, year }: RequestBody = await req.json();

    if (!employeeId || !leaveType) {
      return new Response(
        JSON.stringify({ error: 'employeeId and leaveType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetYear = year || new Date().getFullYear();

    console.log(`Fetching transactions for employee: ${employeeId}, type: ${leaveType}, year: ${targetYear}`);

    // Fetch transactions for the specified employee, leave type, and year
    const { data: transactions, error } = await supabase
      .from('leave_transactions')
      .select('id, transaction_date, change, balance, description, transaction_type')
      .eq('employee_id', employeeId)
      .eq('leave_type', leaveType)
      .eq('year', targetYear)
      .order('transaction_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching transactions:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform to frontend format (newest first for display)
    const formattedTransactions = (transactions || []).reverse().map(tx => ({
      id: tx.id,
      date: tx.transaction_date,
      change: Number(tx.change),
      balance: Number(tx.balance),
      description: tx.description || tx.transaction_type,
    }));

    console.log(`Found ${formattedTransactions.length} transactions`);

    return new Response(
      JSON.stringify({ transactions: formattedTransactions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
