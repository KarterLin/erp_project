ALTER TABLE journal_detail
  ADD CONSTRAINT fk_jd_amort
  FOREIGN KEY (amortization_schedule_id)
  REFERENCES amortization_schedule(id)
  ON DELETE CASCADE;
