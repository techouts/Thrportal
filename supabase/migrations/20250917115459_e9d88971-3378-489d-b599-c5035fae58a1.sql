-- Create enums for interview scheduling
CREATE TYPE interview_mode AS ENUM ('virtual', 'onsite');
CREATE TYPE slot_status AS ENUM ('available', 'booked', 'used', 'expired', 'cancelled');
CREATE TYPE slot_action AS ENUM ('created', 'assigned', 'used', 'no_show', 'rescheduled', 'expired', 'cancelled', 'edited');
CREATE TYPE no_show_type AS ENUM ('candidate', 'panel', 'both');

-- Interview slots table
CREATE TABLE interview_slots (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    project_id UUID NOT NULL,
    jd_id UUID NULL,
    panel_text TEXT NULL,
    date DATE NOT NULL,
    from_time TIME NOT NULL,
    to_time TIME NOT NULL,
    mode interview_mode NOT NULL DEFAULT 'virtual',
    notes TEXT NULL,
    status slot_status NOT NULL DEFAULT 'available',
    invite_id TEXT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_time_range CHECK (from_time < to_time)
);

-- Slot assignments table
CREATE TABLE slot_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slot_id UUID NOT NULL UNIQUE,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NULL,
    candidate_phone TEXT NULL,
    recruiter_id UUID NOT NULL,
    panel_text TEXT NULL,
    notes TEXT NULL,
    booked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY (slot_id) REFERENCES interview_slots(id) ON DELETE CASCADE
);

-- Slot change log table for audit trail
CREATE TABLE slot_change_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slot_id UUID NOT NULL,
    action slot_action NOT NULL,
    reason_code TEXT NULL,
    reason_text TEXT NULL,
    no_show_type no_show_type NULL,
    actor_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    details JSONB NULL DEFAULT '{}',
    FOREIGN KEY (slot_id) REFERENCES interview_slots(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_interview_slots_client_project ON interview_slots(client_id, project_id);
CREATE INDEX idx_interview_slots_date_status ON interview_slots(date, status);
CREATE INDEX idx_interview_slots_status ON interview_slots(status);
CREATE INDEX idx_slot_change_log_slot_id ON slot_change_log(slot_id);
CREATE INDEX idx_slot_change_log_timestamp ON slot_change_log(timestamp);

-- Enable RLS
ALTER TABLE interview_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_change_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interview_slots
CREATE POLICY "Staffing managers can manage all slots"
ON interview_slots
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER', 'ADMIN']));

CREATE POLICY "Recruiters can view and manage slots for their clients"
ON interview_slots
FOR ALL
USING (
    get_current_user_role() = ANY (ARRAY['RECRUITER', 'HIRING_MANAGER', 'HR_MANAGER']) 
    AND (
        -- Can access if they are assigned to this client via CRM assignments
        EXISTS (
            SELECT 1 FROM crm_recruiter_assignments cra 
            WHERE cra.recruiter_id = auth.uid() 
            AND cra.client_id = interview_slots.client_id
        )
        OR
        -- Can access if they created the slot
        created_by = auth.uid()
    )
);

-- RLS Policies for slot_assignments
CREATE POLICY "Staffing managers can manage all assignments"
ON slot_assignments
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER', 'ADMIN']));

CREATE POLICY "Recruiters can manage assignments for their slots"
ON slot_assignments
FOR ALL
USING (
    get_current_user_role() = ANY (ARRAY['RECRUITER', 'HIRING_MANAGER', 'HR_MANAGER'])
    AND (
        recruiter_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM interview_slots s
            WHERE s.id = slot_assignments.slot_id
            AND (
                s.created_by = auth.uid()
                OR
                EXISTS (
                    SELECT 1 FROM crm_recruiter_assignments cra 
                    WHERE cra.recruiter_id = auth.uid() 
                    AND cra.client_id = s.client_id
                )
            )
        )
    )
);

-- RLS Policies for slot_change_log
CREATE POLICY "Staff can view change log"
ON slot_change_log
FOR SELECT
USING (
    get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'HR_MANAGER', 'ADMIN'])
);

CREATE POLICY "Staff can create change log entries"
ON slot_change_log
FOR INSERT
WITH CHECK (
    get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'HR_MANAGER', 'ADMIN'])
    AND actor_id = auth.uid()
);

-- Function to auto-expire slots
CREATE OR REPLACE FUNCTION auto_expire_slots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE interview_slots 
    SET status = 'expired',
        updated_at = now(),
        updated_by = NULL
    WHERE status = 'available' 
    AND date + to_time < now();
    
    -- Log the expiry
    INSERT INTO slot_change_log (slot_id, action, actor_id, details)
    SELECT id, 'expired', '00000000-0000-0000-0000-000000000000'::uuid, '{"auto_expired": true}'::jsonb
    FROM interview_slots 
    WHERE status = 'expired' 
    AND updated_at >= now() - INTERVAL '1 minute';
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_interview_slots_updated_at
BEFORE UPDATE ON interview_slots
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();