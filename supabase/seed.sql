-- Seed data for the `major` lookup table. Must include 'Undeclared' and 'Other'.
-- TODO: add the full list of UB majors.
insert into public.major (name) values
  ('Undeclared'),
  ('Computer Science'),
  ('Computer Engineering'),
  ('Electrical Engineering'),
  ('Mechanical Engineering'),
  ('Civil Engineering'),
  ('Other')
on conflict (name) do nothing;
