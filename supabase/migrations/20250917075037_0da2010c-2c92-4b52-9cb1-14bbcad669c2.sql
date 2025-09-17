-- Create RLS policies for contracts (Finance and Admin access)
CREATE POLICY "Finance and Admin can manage MSAs" ON public.msas
FOR ALL USING (get_current_user_role() = ANY (ARRAY['ADMIN'::text, 'FINANCE_MANAGER'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Staff can view MSAs" ON public.msas
FOR SELECT USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'FINANCE_MANAGER'::text]));

CREATE POLICY "Finance and Admin can manage SOWs" ON public.sows
FOR ALL USING (get_current_user_role() = ANY (ARRAY['ADMIN'::text, 'FINANCE_MANAGER'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Staff can view SOWs" ON public.sows
FOR SELECT USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'FINANCE_MANAGER'::text]));

CREATE POLICY "Finance and Admin can manage POs" ON public.purchase_orders
FOR ALL USING (get_current_user_role() = ANY (ARRAY['ADMIN'::text, 'FINANCE_MANAGER'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Staff can view POs" ON public.purchase_orders
FOR SELECT USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'FINANCE_MANAGER'::text]));

-- Policies for junction tables
CREATE POLICY "Finance and Staff can manage SOW-PO allocations" ON public.sow_po_allocations
FOR ALL USING (get_current_user_role() = ANY (ARRAY['ADMIN'::text, 'FINANCE_MANAGER'::text, 'STAFFING_MANAGER'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Staff can view SOW-PO allocations" ON public.sow_po_allocations
FOR SELECT USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'FINANCE_MANAGER'::text]));

CREATE POLICY "Staff can manage Project-SOW links" ON public.project_sow_links
FOR ALL USING (get_current_user_role() = ANY (ARRAY['ADMIN'::text, 'FINANCE_MANAGER'::text, 'STAFFING_MANAGER'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Staff can view Project-SOW links" ON public.project_sow_links
FOR SELECT USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'FINANCE_MANAGER'::text]));

-- Policies for assignments
CREATE POLICY "Staff can manage contract assignments" ON public.contract_assignments
FOR ALL USING (get_current_user_role() = ANY (ARRAY['ADMIN'::text, 'FINANCE_MANAGER'::text, 'STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text]));

CREATE POLICY "Staff can view contract assignments" ON public.contract_assignments
FOR SELECT USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'FINANCE_MANAGER'::text]));

-- Policies for invoices
CREATE POLICY "Finance can manage invoices" ON public.invoices
FOR ALL USING (get_current_user_role() = ANY (ARRAY['ADMIN'::text, 'FINANCE_MANAGER'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Staff can view invoices" ON public.invoices
FOR SELECT USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'FINANCE_MANAGER'::text]));

CREATE POLICY "Finance can manage invoice lines" ON public.invoice_lines
FOR ALL USING (get_current_user_role() = ANY (ARRAY['ADMIN'::text, 'FINANCE_MANAGER'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Staff can view invoice lines" ON public.invoice_lines
FOR SELECT USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'FINANCE_MANAGER'::text]));

-- Policies for approval logs
CREATE POLICY "Staff can create approval logs" ON public.approval_logs
FOR INSERT WITH CHECK (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'FINANCE_MANAGER'::text]));

CREATE POLICY "Management can approve logs" ON public.approval_logs
FOR UPDATE USING (get_current_user_role() = ANY (ARRAY['ADMIN'::text, 'FINANCE_MANAGER'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Staff can view approval logs" ON public.approval_logs
FOR SELECT USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'FINANCE_MANAGER'::text]));

-- Create triggers for updated_at
CREATE TRIGGER update_msas_updated_at
BEFORE UPDATE ON public.msas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sows_updated_at
BEFORE UPDATE ON public.sows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contract_assignments_updated_at
BEFORE UPDATE ON public.contract_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_msas_client_id ON public.msas(client_id);
CREATE INDEX idx_msas_valid_dates ON public.msas(valid_from, valid_to);
CREATE INDEX idx_sows_msa_id ON public.sows(msa_id);
CREATE INDEX idx_sows_valid_dates ON public.sows(valid_from, valid_to);
CREATE INDEX idx_purchase_orders_client_id ON public.purchase_orders(client_id);
CREATE INDEX idx_purchase_orders_valid_dates ON public.purchase_orders(valid_from, valid_to);
CREATE INDEX idx_contract_assignments_project_id ON public.contract_assignments(project_id);
CREATE INDEX idx_contract_assignments_employee_id ON public.contract_assignments(employee_id);
CREATE INDEX idx_contract_assignments_sow_id ON public.contract_assignments(sow_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX idx_invoices_period ON public.invoices(period_start, period_end);