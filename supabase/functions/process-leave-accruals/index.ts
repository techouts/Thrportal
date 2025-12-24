import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Employee {
  id: string;
  date_of_joining: string | null;
  employment_status: string | null;
}

interface LeavePolicy {
  code: string;
  accrual_rate: number;
  carry_forward_limit: number;
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

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed
    const isJanuary = currentMonth === 1;
    const accrualDate = new Date(currentYear, currentMonth - 1, 1); // 1st of current month

    console.log(`Processing accruals for ${accrualDate.toISOString().split('T')[0]}, isJanuary: ${isJanuary}`);

    // Get active leave policies that have accrual
    const { data: policies, error: policiesError } = await supabase
      .from('leave_policies')
      .select('code, accrual_rate, carry_forward_limit')
      .eq('is_active', true)
      .gt('accrual_rate', 0);

    if (policiesError) {
      console.error('Error fetching policies:', policiesError);
      return new Response(
        JSON.stringify({ error: policiesError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${policies?.length || 0} policies with accrual`);

    // Get all active employees with their joining dates
    const { data: employees, error: employeesError } = await supabase
      .from('profiles')
      .select('id, date_of_joining, employment_status')
      .eq('employment_status', 'Active');

    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
      return new Response(
        JSON.stringify({ error: employeesError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${employees?.length || 0} active employees`);

    const results = {
      processed: 0,
      carryForwards: 0,
      accruals: 0,
      errors: [] as string[],
    };

    for (const employee of (employees || []) as Employee[]) {
      const joiningDate = employee.date_of_joining 
        ? new Date(employee.date_of_joining) 
        : null;

      if (!joiningDate) {
        console.log(`Skipping employee ${employee.id}: no joining date`);
        continue;
      }

      for (const policy of (policies || []) as LeavePolicy[]) {
        try {
          // Handle carry forward on January 1st
          if (isJanuary) {
            await processCarryForward(
              supabase, 
              employee.id, 
              policy.code, 
              currentYear, 
              policy.carry_forward_limit
            );
            results.carryForwards++;
          }

          // Calculate and insert monthly accrual
          const accrualAmount = calculateAccrual(
            joiningDate,
            accrualDate,
            policy.accrual_rate,
            currentYear
          );

          if (accrualAmount > 0) {
            await insertAccrualTransaction(
              supabase,
              employee.id,
              policy.code,
              accrualAmount,
              accrualDate,
              currentYear
            );
            results.accruals++;
          }

          results.processed++;
        } catch (err) {
          const errorMsg = `Error processing ${employee.id}/${policy.code}: ${err}`;
          console.error(errorMsg);
          results.errors.push(errorMsg);
        }
      }
    }

    console.log('Processing complete:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
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

/**
 * Calculate accrual amount with pro-rata for the first month
 */
function calculateAccrual(
  joiningDate: Date,
  accrualDate: Date, // 1st of the month we're accruing for
  monthlyRate: number,
  currentYear: number
): number {
  const joiningYear = joiningDate.getFullYear();
  const joiningMonth = joiningDate.getMonth() + 1;
  const joiningDay = joiningDate.getDate();
  
  const accrualYear = accrualDate.getFullYear();
  const accrualMonth = accrualDate.getMonth() + 1;

  // If joined after the accrual month, no accrual
  if (joiningYear > accrualYear || 
      (joiningYear === accrualYear && joiningMonth > accrualMonth)) {
    return 0;
  }

  // If joined in the same month as accrual, calculate pro-rata
  if (joiningYear === accrualYear && joiningMonth === accrualMonth) {
    // Calculate days remaining in the month from joining date
    const daysInMonth = new Date(accrualYear, accrualMonth, 0).getDate();
    const daysWorked = daysInMonth - joiningDay + 1; // Include joining day
    const proRata = (daysWorked / daysInMonth) * monthlyRate;
    
    // Round to 2 decimal places
    return Math.round(proRata * 100) / 100;
  }

  // For months after joining, full accrual
  return monthlyRate;
}

/**
 * Process carry forward from previous year
 */
async function processCarryForward(
  supabase: ReturnType<typeof createClient>,
  employeeId: string,
  leaveType: string,
  currentYear: number,
  maxCarryForward: number
) {
  const previousYear = currentYear - 1;

  // Get the last balance from previous year
  const { data: lastTransaction, error } = await supabase
    .from('leave_transactions')
    .select('balance')
    .eq('employee_id', employeeId)
    .eq('leave_type', leaveType)
    .eq('year', previousYear)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching previous year balance:', error);
    return;
  }

  const previousBalance = lastTransaction?.balance || 0;
  
  if (previousBalance <= 0) {
    console.log(`No carry forward for ${employeeId}/${leaveType}: previous balance ${previousBalance}`);
    return;
  }

  // Cap at maximum carry forward limit
  const carryForwardAmount = Math.min(Number(previousBalance), maxCarryForward);

  if (carryForwardAmount <= 0) {
    return;
  }

  // Check if carry forward already exists for this year
  const { data: existingCF, error: cfError } = await supabase
    .from('leave_transactions')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('leave_type', leaveType)
    .eq('year', currentYear)
    .eq('transaction_type', 'CARRY_FORWARD')
    .limit(1);

  if (cfError) {
    console.error('Error checking existing carry forward:', cfError);
    return;
  }

  if (existingCF && existingCF.length > 0) {
    console.log(`Carry forward already exists for ${employeeId}/${leaveType} in ${currentYear}`);
    return;
  }

  // Insert carry forward transaction
  const { error: insertError } = await supabase
    .from('leave_transactions')
    .insert({
      employee_id: employeeId,
      leave_type: leaveType,
      transaction_type: 'CARRY_FORWARD',
      change: carryForwardAmount,
      balance: carryForwardAmount,
      description: `Carry forward from ${previousYear} (max ${maxCarryForward} days)`,
      transaction_date: `${currentYear}-01-01`,
      year: currentYear,
    });

  if (insertError) {
    console.error('Error inserting carry forward:', insertError);
    throw insertError;
  }

  console.log(`Carried forward ${carryForwardAmount} days for ${employeeId}/${leaveType}`);
}

/**
 * Insert monthly accrual transaction
 */
async function insertAccrualTransaction(
  supabase: ReturnType<typeof createClient>,
  employeeId: string,
  leaveType: string,
  amount: number,
  accrualDate: Date,
  year: number
) {
  const dateStr = accrualDate.toISOString().split('T')[0];

  // Check if accrual already exists for this month
  const monthStart = dateStr;
  const monthEnd = new Date(year, accrualDate.getMonth() + 1, 0).toISOString().split('T')[0];

  const { data: existingAccrual, error: checkError } = await supabase
    .from('leave_transactions')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('leave_type', leaveType)
    .eq('transaction_type', 'ACCRUAL')
    .gte('transaction_date', monthStart)
    .lte('transaction_date', monthEnd)
    .limit(1);

  if (checkError) {
    console.error('Error checking existing accrual:', checkError);
    return;
  }

  if (existingAccrual && existingAccrual.length > 0) {
    console.log(`Accrual already exists for ${employeeId}/${leaveType} in ${monthStart}`);
    return;
  }

  // Get current balance
  const { data: lastTransaction, error: balanceError } = await supabase
    .from('leave_transactions')
    .select('balance')
    .eq('employee_id', employeeId)
    .eq('leave_type', leaveType)
    .eq('year', year)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1);

  if (balanceError && balanceError.code !== 'PGRST116') {
    console.error('Error fetching current balance:', balanceError);
    return;
  }

  const currentBalance = lastTransaction?.[0]?.balance || 0;
  const newBalance = Number(currentBalance) + amount;

  // Insert accrual transaction
  const { error: insertError } = await supabase
    .from('leave_transactions')
    .insert({
      employee_id: employeeId,
      leave_type: leaveType,
      transaction_type: 'ACCRUAL',
      change: amount,
      balance: newBalance,
      description: `Monthly accrual`,
      transaction_date: dateStr,
      year: year,
    });

  if (insertError) {
    console.error('Error inserting accrual:', insertError);
    throw insertError;
  }

  console.log(`Accrued ${amount} days for ${employeeId}/${leaveType}, new balance: ${newBalance}`);
}
