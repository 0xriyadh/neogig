ALTER TABLE job_seekers
ADD COLUMN open_to_urgent_jobs BOOLEAN DEFAULT FALSE,
ADD COLUMN last_minute_availability BOOLEAN DEFAULT FALSE; 