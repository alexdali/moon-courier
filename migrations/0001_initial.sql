PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS scenarios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  seed INTEGER NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','normal','hard','crisis')),
  status TEXT NOT NULL DEFAULT 'validated' CHECK (status IN ('draft','validated','active','archived')),
  source TEXT NOT NULL CHECK (source IN ('fixture','manual','ai')),
  rules_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scenario_versions (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK (version > 0),
  content_json TEXT NOT NULL,
  validation_json TEXT NOT NULL,
  prompt TEXT,
  model TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (scenario_id, version)
);

CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ready','active','completed','failed','paused')),
  current_minute REAL NOT NULL DEFAULT 0,
  current_day INTEGER NOT NULL DEFAULT 1,
  credits REAL NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 100,
  target_credits REAL NOT NULL,
  seed INTEGER NOT NULL,
  started_at TEXT,
  ended_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS zones (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  risk_multiplier REAL NOT NULL CHECK (risk_multiplier >= 0),
  speed_multiplier REAL NOT NULL CHECK (speed_multiplier > 0),
  energy_multiplier REAL NOT NULL CHECK (energy_multiplier > 0),
  color TEXT NOT NULL,
  polygon_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS map_nodes (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('base','colony','relay','charger','waypoint')),
  x REAL NOT NULL,
  y REAL NOT NULL,
  zone_id TEXT REFERENCES zones(id),
  has_charger INTEGER NOT NULL DEFAULT 0 CHECK (has_charger IN (0,1)),
  UNIQUE (scenario_id, code)
);

CREATE TABLE IF NOT EXISTS map_edges (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  from_node_id TEXT NOT NULL REFERENCES map_nodes(id),
  to_node_id TEXT NOT NULL REFERENCES map_nodes(id),
  distance_km REAL NOT NULL CHECK (distance_km > 0),
  terrain TEXT NOT NULL CHECK (terrain IN ('plain','ridge','crater','dust','shadow')),
  speed_factor REAL NOT NULL CHECK (speed_factor > 0),
  energy_factor REAL NOT NULL CHECK (energy_factor > 0),
  base_risk REAL NOT NULL CHECK (base_risk >= 0 AND base_risk < 1),
  bidirectional INTEGER NOT NULL DEFAULT 1 CHECK (bidirectional IN (0,1)),
  CHECK (from_node_id <> to_node_id)
);

CREATE TABLE IF NOT EXISTS rovers (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available','assigned','en_route','charging','damaged','disabled')),
  node_id TEXT NOT NULL REFERENCES map_nodes(id),
  battery_percent REAL NOT NULL CHECK (battery_percent >= 0 AND battery_percent <= 100),
  battery_capacity_kwh REAL NOT NULL CHECK (battery_capacity_kwh > 0),
  capacity_kg REAL NOT NULL CHECK (capacity_kg > 0),
  base_speed_kph REAL NOT NULL CHECK (base_speed_kph > 0),
  base_energy_kwh_per_km REAL NOT NULL CHECK (base_energy_kwh_per_km > 0),
  risk_resistance REAL NOT NULL CHECK (risk_resistance >= 0 AND risk_resistance <= 1),
  repair_cost_credits REAL NOT NULL CHECK (repair_cost_credits >= 0),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE (mission_id, code)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  origin_node_id TEXT NOT NULL REFERENCES map_nodes(id),
  destination_node_id TEXT NOT NULL REFERENCES map_nodes(id),
  weight_kg REAL NOT NULL CHECK (weight_kg > 0),
  reward_credits REAL NOT NULL CHECK (reward_credits >= 0),
  failure_penalty_credits REAL NOT NULL CHECK (failure_penalty_credits >= 0),
  urgency TEXT NOT NULL CHECK (urgency IN ('low','normal','high','critical')),
  deadline_minute REAL,
  status TEXT NOT NULL CHECK (status IN ('pending','assigned','in_transit','delivered','failed','expired','blocked')),
  impossible_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (mission_id, code)
);

CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES orders(id),
  rover_id TEXT NOT NULL REFERENCES rovers(id),
  status TEXT NOT NULL CHECK (status IN ('planned','in_transit','succeeded','failed','cancelled')),
  route_json TEXT NOT NULL,
  planned_distance_km REAL NOT NULL,
  planned_duration_minutes REAL NOT NULL,
  planned_energy_kwh REAL NOT NULL,
  planned_incident_risk REAL NOT NULL,
  expected_net_credits REAL NOT NULL,
  actual_net_credits REAL,
  seed INTEGER NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  failure_code TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS delivery_segments (
  id TEXT PRIMARY KEY,
  delivery_id TEXT NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  edge_id TEXT NOT NULL REFERENCES map_edges(id),
  distance_km REAL NOT NULL,
  duration_minutes REAL NOT NULL,
  energy_kwh REAL NOT NULL,
  incident_risk REAL NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('clear','delay','battery_loss','failure')),
  event_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE (delivery_id, sequence)
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  delivery_id TEXT REFERENCES deliveries(id) ON DELETE SET NULL,
  sequence INTEGER NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info','success','warning','critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  occurred_at TEXT NOT NULL,
  simulation_offset_ms INTEGER NOT NULL DEFAULT 0,
  UNIQUE (mission_id, sequence)
);

CREATE TABLE IF NOT EXISTS economy_entries (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  delivery_id TEXT REFERENCES deliveries(id) ON DELETE SET NULL,
  event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('initial','reward','energy','charging','penalty','repair','bonus')),
  amount_credits REAL NOT NULL,
  balance_after REAL NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mission_snapshots (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  reason TEXT NOT NULL,
  state_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (mission_id, sequence)
);

CREATE TABLE IF NOT EXISTS simulation_runs (
  id TEXT PRIMARY KEY,
  mission_id TEXT REFERENCES missions(id) ON DELETE SET NULL,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id),
  kind TEXT NOT NULL CHECK (kind IN ('balance-check','counterfactual','benchmark')),
  policy_json TEXT NOT NULL,
  seed INTEGER NOT NULL,
  iterations INTEGER NOT NULL CHECK (iterations > 0),
  status TEXT NOT NULL CHECK (status IN ('queued','running','completed','failed')),
  input_json TEXT NOT NULL,
  summary_json TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  error TEXT
);

CREATE TABLE IF NOT EXISTS simulation_samples (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
  sample_index INTEGER NOT NULL,
  seed INTEGER NOT NULL,
  final_credits REAL NOT NULL,
  delivered_orders INTEGER NOT NULL,
  failed_deliveries INTEGER NOT NULL,
  expired_orders INTEGER NOT NULL,
  success INTEGER NOT NULL CHECK (success IN (0,1)),
  UNIQUE (run_id, sample_index)
);

CREATE TABLE IF NOT EXISTS ai_runs (
  id TEXT PRIMARY KEY,
  mission_id TEXT REFERENCES missions(id) ON DELETE SET NULL,
  scenario_id TEXT REFERENCES scenarios(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  model_role TEXT NOT NULL CHECK (model_role IN ('primary','fallback')),
  prompt_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started','succeeded','failed','rejected')),
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  request_json TEXT NOT NULL,
  response_json TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS ai_tool_calls (
  id TEXT PRIMARY KEY,
  ai_run_id TEXT NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
  tool_call_id TEXT NOT NULL,
  name TEXT NOT NULL,
  arguments_json TEXT NOT NULL,
  result_json TEXT,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('started','succeeded','failed')),
  error_message TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (ai_run_id, tool_call_id)
);
