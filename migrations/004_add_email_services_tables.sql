-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  subject_line VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  plain_text_content TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create email subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  status ENUM('subscribed', 'unsubscribed', 'bounced', 'invalid') DEFAULT 'subscribed',
  preferences JSONB DEFAULT '{"email_frequency": "weekly", "newsletter": true, "promotional": true, "product_updates": true}'::jsonb,
  subscription_source VARCHAR(100),
  last_engagement_at TIMESTAMP,
  bounce_count INTEGER DEFAULT 0,
  complaint_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_id UUID REFERENCES email_templates(id) ON DELETE RESTRICT,
  status ENUM('draft', 'scheduled', 'in_progress', 'completed', 'paused', 'cancelled') DEFAULT 'draft',
  campaign_type ENUM('newsletter', 'promotional', 'transactional', 'announcement', 're_engagement') NOT NULL,
  subject_line VARCHAR(255),
  preview_text VARCHAR(255),
  from_name VARCHAR(100),
  from_email VARCHAR(255),
  reply_to VARCHAR(255),
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  complained_count INTEGER DEFAULT 0,
  estimated_open_rate DECIMAL(5, 2),
  estimated_click_rate DECIMAL(5, 2),
  variables JSONB DEFAULT '{}'::jsonb,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create campaign subscriber junction table
CREATE TABLE IF NOT EXISTS email_campaign_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES email_subscribers(id) ON DELETE CASCADE,
  status ENUM('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed') DEFAULT 'pending',
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  opened_count INTEGER DEFAULT 0,
  clicked_at TIMESTAMP,
  clicked_count INTEGER DEFAULT 0,
  links_clicked JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_id, subscriber_id)
);

-- Create email logs table (for detailed tracking)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
  campaign_subscriber_id UUID REFERENCES email_campaign_subscribers(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES email_subscribers(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  message_id VARCHAR(255) UNIQUE,
  status ENUM('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed') DEFAULT 'queued',
  event_type ENUM('send', 'delivery', 'open', 'click', 'bounce', 'complaint', 'unsubscribe') NOT NULL,
  event_data JSONB,
  error_message TEXT,
  sendgrid_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create email sequences table (automated workflows)
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_type ENUM('welcome', 'onboarding', 're_engagement', 'abandoned_cart', 'post_purchase', 'custom') NOT NULL,
  trigger_event VARCHAR(100),
  status ENUM('active', 'paused', 'archived') DEFAULT 'active',
  entry_criteria JSONB,
  exit_criteria JSONB,
  max_recipients_per_day INTEGER,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence steps table
CREATE TABLE IF NOT EXISTS email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE RESTRICT,
  step_number INTEGER NOT NULL,
  delay_value INTEGER DEFAULT 0,
  delay_unit ENUM('minutes', 'hours', 'days') DEFAULT 'days',
  subject_override VARCHAR(255),
  conditions JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sequence_id, step_number)
);

-- Create sequence subscriber tracking
CREATE TABLE IF NOT EXISTS email_sequence_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES email_subscribers(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  status ENUM('entered', 'active', 'completed', 'exited', 'failed') DEFAULT 'entered',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  last_step_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sequence_id, subscriber_id)
);

-- Create email analytics table
CREATE TABLE IF NOT EXISTS email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES email_sequences(id) ON DELETE CASCADE,
  date_tracked DATE NOT NULL,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_complained INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  open_rate DECIMAL(5, 2),
  click_rate DECIMAL(5, 2),
  bounce_rate DECIMAL(5, 2),
  conversion_rate DECIMAL(5, 2),
  revenue DECIMAL(12, 2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create email preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_frequency ENUM('daily', 'weekly', 'monthly', 'never') DEFAULT 'weekly',
  newsletters BOOLEAN DEFAULT TRUE,
  promotional_emails BOOLEAN DEFAULT TRUE,
  product_updates BOOLEAN DEFAULT TRUE,
  transactional_emails BOOLEAN DEFAULT TRUE,
  custom_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_templates_slug ON email_templates(slug);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_created_at ON email_subscribers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_template_id ON email_campaigns(template_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON email_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_email_campaign_subscribers_campaign_id ON email_campaign_subscribers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_subscribers_subscriber_id ON email_campaign_subscribers(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_subscribers_status ON email_campaign_subscribers(status);

CREATE INDEX IF NOT EXISTS idx_email_logs_subscriber_id ON email_logs(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign_id ON email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_event_type ON email_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_message_id ON email_logs(message_id);

CREATE INDEX IF NOT EXISTS idx_email_sequences_status ON email_sequences(status);
CREATE INDEX IF NOT EXISTS idx_email_sequences_type ON email_sequences(sequence_type);

CREATE INDEX IF NOT EXISTS idx_email_sequence_steps_sequence_id ON email_sequence_steps(sequence_id);
CREATE INDEX IF NOT EXISTS idx_email_sequence_steps_template_id ON email_sequence_steps(template_id);

CREATE INDEX IF NOT EXISTS idx_email_sequence_subscribers_sequence_id ON email_sequence_subscribers(sequence_id);
CREATE INDEX IF NOT EXISTS idx_email_sequence_subscribers_subscriber_id ON email_sequence_subscribers(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_sequence_subscribers_status ON email_sequence_subscribers(status);

CREATE INDEX IF NOT EXISTS idx_email_analytics_campaign_id ON email_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_analytics_date_tracked ON email_analytics(date_tracked DESC);

CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON email_templates
FOR EACH ROW
EXECUTE FUNCTION update_email_templates_updated_at();

CREATE OR REPLACE FUNCTION update_email_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_subscribers_updated_at
BEFORE UPDATE ON email_subscribers
FOR EACH ROW
EXECUTE FUNCTION update_email_subscribers_updated_at();

CREATE OR REPLACE FUNCTION update_email_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_campaigns_updated_at
BEFORE UPDATE ON email_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_email_campaigns_updated_at();

CREATE OR REPLACE FUNCTION update_email_campaign_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_campaign_subscribers_updated_at
BEFORE UPDATE ON email_campaign_subscribers
FOR EACH ROW
EXECUTE FUNCTION update_email_campaign_subscribers_updated_at();

CREATE OR REPLACE FUNCTION update_email_sequences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_sequences_updated_at
BEFORE UPDATE ON email_sequences
FOR EACH ROW
EXECUTE FUNCTION update_email_sequences_updated_at();

CREATE OR REPLACE FUNCTION update_email_sequence_steps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_sequence_steps_updated_at
BEFORE UPDATE ON email_sequence_steps
FOR EACH ROW
EXECUTE FUNCTION update_email_sequence_steps_updated_at();

CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_preferences_updated_at
BEFORE UPDATE ON email_preferences
FOR EACH ROW
EXECUTE FUNCTION update_email_preferences_updated_at();
