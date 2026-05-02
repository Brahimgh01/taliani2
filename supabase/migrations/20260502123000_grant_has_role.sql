-- Grant EXECUTE to allow RLS policies to call public.has_role
-- This restores function execute privileges revoked by an earlier migration
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- If you want anonymous (visitor) sessions to evaluate policies that call
-- public.has_role (rare), also grant to anon. Only enable if needed.
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO anon;
