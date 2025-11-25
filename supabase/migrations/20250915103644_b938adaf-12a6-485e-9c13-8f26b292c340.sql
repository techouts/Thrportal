-- Insert sample CRM clients
INSERT INTO crm_clients (name, industry, location, status, billing_model, contract_type, health_score, domain, gst_vat) VALUES
  ('TechCorp Solutions', 'Technology', 'San Francisco', 'Active', 'Time & Material', 'MSA', 85, 'techcorp.com', 'GST123456789'),
  ('Global Finance Ltd', 'Finance', 'New York', 'Active', 'Fixed Price', 'SOW', 92, 'globalfinance.com', 'GST987654321'),
  ('HealthPlus Inc', 'Healthcare', 'Boston', 'Prospect', 'Retainer', 'Contract', 78, 'healthplus.com', 'GST456789123'),
  ('ManufacturingPro', 'Manufacturing', 'Detroit', 'Active', 'Time & Material', 'MSA', 88, 'mfgpro.com', 'GST789123456'),
  ('RetailMax Corp', 'Retail', 'Chicago', 'Inactive', 'Fixed Price', 'SOW', 45, 'retailmax.com', 'GST321654987'),
  ('ConsultingEdge', 'Consulting', 'Seattle', 'Active', 'Retainer', 'MSA', 90, 'consultingedge.com', 'GST654987321');

-- Insert sample CRM accounts
INSERT INTO crm_accounts (client_id, name, type, sla_override) VALUES
  ((SELECT id FROM crm_clients WHERE name = 'TechCorp Solutions'), 'TechCorp Main Account', 'Primary', 'Premium SLA'),
  ((SELECT id FROM crm_clients WHERE name = 'Global Finance Ltd'), 'Finance Operations', 'Primary', NULL),
  ((SELECT id FROM crm_clients WHERE name = 'HealthPlus Inc'), 'Healthcare Division', 'Secondary', 'Standard SLA'),
  ((SELECT id FROM crm_clients WHERE name = 'ManufacturingPro'), 'Production Unit', 'Primary', NULL),
  ((SELECT id FROM crm_clients WHERE name = 'ConsultingEdge'), 'Strategy Division', 'Primary', 'Premium SLA');

-- Insert sample CRM SPOCs
INSERT INTO crm_spocs (client_id, account_id, name, role, email, phone, linkedin_url, is_primary) VALUES
  ((SELECT id FROM crm_clients WHERE name = 'TechCorp Solutions'), (SELECT id FROM crm_accounts WHERE name = 'TechCorp Main Account'), 'John Smith', 'CTO', 'john.smith@techcorp.com', '+1-555-0101', 'https://linkedin.com/in/johnsmith', true),
  ((SELECT id FROM crm_clients WHERE name = 'Global Finance Ltd'), (SELECT id FROM crm_accounts WHERE name = 'Finance Operations'), 'Sarah Johnson', 'VP Engineering', 'sarah.j@globalfinance.com', '+1-555-0102', 'https://linkedin.com/in/sarahjohnson', true),
  ((SELECT id FROM crm_clients WHERE name = 'HealthPlus Inc'), (SELECT id FROM crm_accounts WHERE name = 'Healthcare Division'), 'Mike Chen', 'Director of IT', 'mike.chen@healthplus.com', '+1-555-0103', 'https://linkedin.com/in/mikechen', true),
  ((SELECT id FROM crm_clients WHERE name = 'ManufacturingPro'), (SELECT id FROM crm_accounts WHERE name = 'Production Unit'), 'Lisa Rodriguez', 'Head of Operations', 'lisa.r@mfgpro.com', '+1-555-0104', 'https://linkedin.com/in/lisarodriguez', true),
  ((SELECT id FROM crm_clients WHERE name = 'ConsultingEdge'), (SELECT id FROM crm_accounts WHERE name = 'Strategy Division'), 'David Wang', 'Managing Director', 'david.wang@consultingedge.com', '+1-555-0105', 'https://linkedin.com/in/davidwang', true);

-- Insert sample CRM projects
INSERT INTO crm_projects (client_id, account_id, name, start_date, end_date, ft_target, contract_target, skills, priority, status, primary_spoc_id) VALUES
  ((SELECT id FROM crm_clients WHERE name = 'TechCorp Solutions'), (SELECT id FROM crm_accounts WHERE name = 'TechCorp Main Account'), 'Cloud Migration Project', '2024-01-15', '2024-12-31', 5, 3, ARRAY['AWS', 'DevOps', 'Python'], 'High', 'In-flight', (SELECT id FROM crm_spocs WHERE name = 'John Smith')),
  ((SELECT id FROM crm_clients WHERE name = 'Global Finance Ltd'), (SELECT id FROM crm_accounts WHERE name = 'Finance Operations'), 'Trading Platform Upgrade', '2024-02-01', '2024-10-30', 8, 2, ARRAY['Java', 'React', 'SQL'], 'Critical', 'In-flight', (SELECT id FROM crm_spocs WHERE name = 'Sarah Johnson')),
  ((SELECT id FROM crm_clients WHERE name = 'HealthPlus Inc'), (SELECT id FROM crm_accounts WHERE name = 'Healthcare Division'), 'Patient Portal Development', '2024-03-01', '2024-11-15', 4, 1, ARRAY['React', 'Node.js', 'FHIR'], 'Medium', 'Planned', (SELECT id FROM crm_spocs WHERE name = 'Mike Chen')),
  ((SELECT id FROM crm_clients WHERE name = 'ManufacturingPro'), (SELECT id FROM crm_accounts WHERE name = 'Production Unit'), 'IoT Implementation', '2024-01-20', '2024-09-30', 6, 4, ARRAY['IoT', 'C++', 'Azure'], 'High', 'In-flight', (SELECT id FROM crm_spocs WHERE name = 'Lisa Rodriguez')),
  ((SELECT id FROM crm_clients WHERE name = 'ConsultingEdge'), (SELECT id FROM crm_accounts WHERE name = 'Strategy Division'), 'Analytics Dashboard', '2024-04-01', '2024-12-15', 3, 2, ARRAY['Tableau', 'SQL', 'Python'], 'Medium', 'Planned', (SELECT id FROM crm_spocs WHERE name = 'David Wang'));

-- Insert sample CRM opportunities
INSERT INTO crm_opportunities (client_id, account_id, project_id, jd_count, ft_count, contract_count, status, notes) VALUES
  ((SELECT id FROM crm_clients WHERE name = 'TechCorp Solutions'), (SELECT id FROM crm_accounts WHERE name = 'TechCorp Main Account'), (SELECT id FROM crm_projects WHERE name = 'Cloud Migration Project'), 3, 2, 1, 'In Progress', 'Good progress on initial requirements'),
  ((SELECT id FROM crm_clients WHERE name = 'Global Finance Ltd'), (SELECT id FROM crm_accounts WHERE name = 'Finance Operations'), (SELECT id FROM crm_projects WHERE name = 'Trading Platform Upgrade'), 5, 4, 1, 'Open', 'Waiting for final approval from board'),
  ((SELECT id FROM crm_clients WHERE name = 'HealthPlus Inc'), (SELECT id FROM crm_accounts WHERE name = 'Healthcare Division'), (SELECT id FROM crm_projects WHERE name = 'Patient Portal Development'), 2, 1, 1, 'Open', 'Initial discussions ongoing'),
  ((SELECT id FROM crm_clients WHERE name = 'ManufacturingPro'), (SELECT id FROM crm_accounts WHERE name = 'Production Unit'), (SELECT id FROM crm_projects WHERE name = 'IoT Implementation'), 4, 3, 1, 'In Progress', 'Project kicked off successfully'),
  ((SELECT id FROM crm_clients WHERE name = 'ConsultingEdge'), (SELECT id FROM crm_accounts WHERE name = 'Strategy Division'), (SELECT id FROM crm_projects WHERE name = 'Analytics Dashboard'), 2, 1, 1, 'Open', 'Proposal submitted');

-- Insert sample CRM interactions
INSERT INTO crm_interactions (client_id, account_id, project_id, spoc_id, interaction_type, date, notes, outcome, next_step, engagement_score, is_synced) VALUES
  ((SELECT id FROM crm_clients WHERE name = 'TechCorp Solutions'), (SELECT id FROM crm_accounts WHERE name = 'TechCorp Main Account'), (SELECT id FROM crm_projects WHERE name = 'Cloud Migration Project'), (SELECT id FROM crm_spocs WHERE name = 'John Smith'), 'meeting', '2024-01-10 14:00:00', 'Discussed project timeline and deliverables', 'Positive feedback', 'Send revised proposal', 8, true),
  ((SELECT id FROM crm_clients WHERE name = 'Global Finance Ltd'), (SELECT id FROM crm_accounts WHERE name = 'Finance Operations'), (SELECT id FROM crm_projects WHERE name = 'Trading Platform Upgrade'), (SELECT id FROM crm_spocs WHERE name = 'Sarah Johnson'), 'call', '2024-01-12 10:30:00', 'Weekly status update call', 'On track', 'Continue development', 9, true),
  ((SELECT id FROM crm_clients WHERE name = 'HealthPlus Inc'), (SELECT id FROM crm_accounts WHERE name = 'Healthcare Division'), (SELECT id FROM crm_projects WHERE name = 'Patient Portal Development'), (SELECT id FROM crm_spocs WHERE name = 'Mike Chen'), 'email', '2024-01-15 09:00:00', 'Sent technical specifications', 'Under review', 'Follow up next week', 7, false),
  ((SELECT id FROM crm_clients WHERE name = 'ManufacturingPro'), (SELECT id FROM crm_accounts WHERE name = 'Production Unit'), (SELECT id FROM crm_projects WHERE name = 'IoT Implementation'), (SELECT id FROM crm_spocs WHERE name = 'Lisa Rodriguez'), 'onsite', '2024-01-18 13:00:00', 'Site visit for requirements gathering', 'Excellent collaboration', 'Prepare detailed plan', 10, true),
  ((SELECT id FROM crm_clients WHERE name = 'ConsultingEdge'), (SELECT id FROM crm_accounts WHERE name = 'Strategy Division'), (SELECT id FROM crm_projects WHERE name = 'Analytics Dashboard'), (SELECT id FROM crm_spocs WHERE name = 'David Wang'), 'linkedin', '2024-01-20 16:00:00', 'Connected and discussed project scope', 'Initial interest', 'Schedule formal meeting', 6, false);

-- Insert sample CRM documents
INSERT INTO crm_documents (client_id, account_id, project_id, name, document_type, sharepoint_url, valid_from, valid_until, renewal_alert_sent) VALUES
  ((SELECT id FROM crm_clients WHERE name = 'TechCorp Solutions'), (SELECT id FROM crm_accounts WHERE name = 'TechCorp Main Account'), (SELECT id FROM crm_projects WHERE name = 'Cloud Migration Project'), 'TechCorp MSA 2024', 'MSA', 'https://sharepoint.com/techcorp/msa2024', '2024-01-01', '2024-12-31', false),
  ((SELECT id FROM crm_clients WHERE name = 'Global Finance Ltd'), (SELECT id FROM crm_accounts WHERE name = 'Finance Operations'), (SELECT id FROM crm_projects WHERE name = 'Trading Platform Upgrade'), 'GlobalFinance SOW Trading', 'SOW', 'https://sharepoint.com/globalfinance/sow-trading', '2024-02-01', '2024-10-30', false),
  ((SELECT id FROM crm_clients WHERE name = 'HealthPlus Inc'), (SELECT id FROM crm_accounts WHERE name = 'Healthcare Division'), (SELECT id FROM crm_projects WHERE name = 'Patient Portal Development'), 'HealthPlus Contract Portal', 'Contract', 'https://sharepoint.com/healthplus/contract-portal', '2024-03-01', '2024-11-15', false),
  ((SELECT id FROM crm_clients WHERE name = 'ManufacturingPro'), (SELECT id FROM crm_accounts WHERE name = 'Production Unit'), (SELECT id FROM crm_projects WHERE name = 'IoT Implementation'), 'MfgPro MSA IoT', 'MSA', 'https://sharepoint.com/mfgpro/msa-iot', '2024-01-20', '2024-09-30', false),
  ((SELECT id FROM crm_clients WHERE name = 'ConsultingEdge'), (SELECT id FROM crm_accounts WHERE name = 'Strategy Division'), (SELECT id FROM crm_projects WHERE name = 'Analytics Dashboard'), 'ConsultingEdge Other Analytics', 'Other', 'https://sharepoint.com/consultingedge/analytics', '2024-04-01', '2024-12-15', false);