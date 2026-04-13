INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  phone,
  status
)
VALUES (
  'usr_demo_admin',
  'admin@jamiiflow.app',
  'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea',
  'Jamii',
  'Admin',
  '+254700000000',
  'ACTIVE'
)
ON CONFLICT(email) DO NOTHING;
