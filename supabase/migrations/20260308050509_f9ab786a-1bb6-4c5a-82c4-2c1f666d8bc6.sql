
-- Admin can read consent records
CREATE POLICY "Admins can read all consent"
ON public.consent_records FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can read consent audit log
CREATE POLICY "Admins can read consent audit"
ON public.consent_audit_log FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
