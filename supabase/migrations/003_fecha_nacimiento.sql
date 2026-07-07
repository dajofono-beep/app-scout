-- Migración 003: fecha de nacimiento de cada miembro
-- (saludos de cumpleaños, cambios de rama por edad)
-- Ejecutar en Supabase > SQL Editor

alter table miembros
  add column if not exists fecha_nacimiento date;
