-- 20260506115000_add_revisado_status.sql
-- Add 'revisado' to pdc_revision_status enum

ALTER TYPE pdc_revision_status ADD VALUE 'revisado';
