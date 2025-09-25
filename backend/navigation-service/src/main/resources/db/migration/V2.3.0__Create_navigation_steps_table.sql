-- Create navigation steps table for tracking individual navigation actions
CREATE TABLE navigation_steps (
    id BIGSERIAL PRIMARY KEY,
    navigation_session_id BIGINT NOT NULL,
    step_number INTEGER NOT NULL,
    step_type VARCHAR(30) NOT NULL,
    step_description TEXT,
    target_element_id BIGINT,
    step_data JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    execution_time_ms INTEGER,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_navigation_steps_navigation_session_id FOREIGN KEY (navigation_session_id) REFERENCES navigation_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_navigation_steps_target_element_id FOREIGN KEY (target_element_id) REFERENCES page_elements(id) ON DELETE SET NULL,
    CONSTRAINT navigation_steps_type_check CHECK (step_type IN ('navigate', 'click', 'type', 'select', 'wait', 'scroll', 'hover', 'screenshot', 'extract', 'verify', 'custom')),
    CONSTRAINT navigation_steps_status_check CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'timeout')),
    CONSTRAINT navigation_steps_step_number_positive CHECK (step_number > 0),
    CONSTRAINT navigation_steps_retry_count_non_negative CHECK (retry_count >= 0),
    CONSTRAINT navigation_steps_execution_time_positive CHECK (execution_time_ms IS NULL OR execution_time_ms >= 0),
    CONSTRAINT navigation_steps_unique_step_per_session UNIQUE (navigation_session_id, step_number)
);

-- Create navigation workflows table for storing reusable navigation patterns
CREATE TABLE navigation_workflows (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    application_pattern VARCHAR(500),
    workflow_steps JSONB NOT NULL,
    tags VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT navigation_workflows_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT navigation_workflows_success_rate_range CHECK (success_rate >= 0.0 AND success_rate <= 100.0),
    CONSTRAINT navigation_workflows_usage_count_non_negative CHECK (usage_count >= 0)
);

-- Create workflow executions table for tracking workflow usage
CREATE TABLE workflow_executions (
    id BIGSERIAL PRIMARY KEY,
    navigation_workflow_id BIGINT NOT NULL,
    navigation_session_id BIGINT NOT NULL,
    execution_status VARCHAR(20) NOT NULL DEFAULT 'running',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_steps INTEGER,
    completed_steps INTEGER NOT NULL DEFAULT 0,
    failed_steps INTEGER NOT NULL DEFAULT 0,
    execution_data JSONB DEFAULT '{}',
    error_message TEXT,
    
    CONSTRAINT fk_workflow_executions_navigation_workflow_id FOREIGN KEY (navigation_workflow_id) REFERENCES navigation_workflows(id) ON DELETE CASCADE,
    CONSTRAINT fk_workflow_executions_navigation_session_id FOREIGN KEY (navigation_session_id) REFERENCES navigation_sessions(id) ON DELETE CASCADE,
    CONSTRAINT workflow_executions_status_check CHECK (execution_status IN ('running', 'completed', 'failed', 'cancelled', 'timeout')),
    CONSTRAINT workflow_executions_steps_non_negative CHECK (completed_steps >= 0 AND failed_steps >= 0),
    CONSTRAINT workflow_executions_total_steps_positive CHECK (total_steps IS NULL OR total_steps > 0)
);

-- Create indexes for performance
CREATE INDEX idx_navigation_steps_navigation_session_id ON navigation_steps(navigation_session_id);
CREATE INDEX idx_navigation_steps_step_number ON navigation_steps(step_number);
CREATE INDEX idx_navigation_steps_step_type ON navigation_steps(step_type);
CREATE INDEX idx_navigation_steps_status ON navigation_steps(status);
CREATE INDEX idx_navigation_steps_target_element_id ON navigation_steps(target_element_id);
CREATE INDEX idx_navigation_steps_created_at ON navigation_steps(created_at);
CREATE INDEX idx_navigation_steps_session_step ON navigation_steps(navigation_session_id, step_number);

CREATE INDEX idx_navigation_workflows_name ON navigation_workflows(name);
CREATE INDEX idx_navigation_workflows_active ON navigation_workflows(is_active);
CREATE INDEX idx_navigation_workflows_application_pattern ON navigation_workflows(application_pattern);
CREATE INDEX idx_navigation_workflows_success_rate ON navigation_workflows(success_rate);
CREATE INDEX idx_navigation_workflows_usage_count ON navigation_workflows(usage_count);

CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(navigation_workflow_id);
CREATE INDEX idx_workflow_executions_session_id ON workflow_executions(navigation_session_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(execution_status);
CREATE INDEX idx_workflow_executions_started_at ON workflow_executions(started_at);

-- Create triggers for updated_at
CREATE TRIGGER update_navigation_workflows_updated_at 
    BEFORE UPDATE ON navigation_workflows 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE navigation_steps IS 'Individual steps in a navigation sequence';
COMMENT ON COLUMN navigation_steps.step_number IS 'Sequential order of the step within the session';
COMMENT ON COLUMN navigation_steps.step_data IS 'Step-specific data and parameters';
COMMENT ON COLUMN navigation_steps.retry_count IS 'Number of times this step has been retried';

COMMENT ON TABLE navigation_workflows IS 'Reusable navigation patterns and workflows';
COMMENT ON COLUMN navigation_workflows.workflow_steps IS 'JSON array of workflow step definitions';
COMMENT ON COLUMN navigation_workflows.application_pattern IS 'URL pattern or application identifier this workflow applies to';

COMMENT ON TABLE workflow_executions IS 'Tracking of workflow execution instances';
COMMENT ON COLUMN workflow_executions.execution_data IS 'Runtime data and variables for the workflow execution';
