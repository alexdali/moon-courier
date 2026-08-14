CREATE VIEW IF NOT EXISTS analytics_delivery_facts AS
SELECT
  d.id AS delivery_id,
  d.mission_id,
  o.code AS order_code,
  o.title AS order_title,
  o.category,
  o.weight_kg,
  o.urgency,
  r.code AS rover_code,
  d.status,
  d.failure_code,
  d.planned_distance_km,
  d.planned_duration_minutes,
  d.planned_energy_kwh,
  d.planned_incident_risk,
  d.expected_net_credits,
  d.actual_net_credits,
  d.started_at,
  d.completed_at
FROM deliveries d
JOIN orders o ON o.id = d.order_id
JOIN rovers r ON r.id = d.rover_id;

CREATE VIEW IF NOT EXISTS analytics_rover_performance AS
SELECT
  r.id AS rover_id,
  r.mission_id,
  r.code AS rover_code,
  r.name AS rover_name,
  COUNT(d.id) AS delivery_count,
  SUM(CASE WHEN d.status = 'succeeded' THEN 1 ELSE 0 END) AS success_count,
  SUM(CASE WHEN d.status = 'failed' THEN 1 ELSE 0 END) AS failure_count,
  COALESCE(SUM(d.actual_net_credits), 0) AS net_credits,
  r.battery_percent,
  r.status
FROM rovers r
LEFT JOIN deliveries d ON d.rover_id = r.id
GROUP BY r.id;

CREATE VIEW IF NOT EXISTS analytics_failure_breakdown AS
SELECT
  mission_id,
  COALESCE(failure_code, 'NONE') AS reason,
  COUNT(*) AS count
FROM deliveries
WHERE status = 'failed'
GROUP BY mission_id, COALESCE(failure_code, 'NONE');
