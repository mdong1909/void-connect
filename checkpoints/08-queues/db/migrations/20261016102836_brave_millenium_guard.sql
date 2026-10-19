-- void:allow-destructive
-- Remove only the retired email limiter counters; keep question and auth data.
DROP TABLE `email_summary_quota`;
