CREATE TABLE IF NOT EXISTS payment_webhook_logs (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  checkout_request_id TEXT,
  merchant_request_id TEXT,
  callback_result_code INTEGER,
  callback_result_desc TEXT,
  ip_address TEXT,
  verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  processing_status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (processing_status IN ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED')),
  raw_payload_json TEXT NOT NULL,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_checkout_request_id
  ON payment_webhook_logs(checkout_request_id);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_provider_created_at
  ON payment_webhook_logs(provider, created_at);
