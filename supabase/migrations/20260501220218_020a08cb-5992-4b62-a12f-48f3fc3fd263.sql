
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Security definer role checker
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_fr TEXT,
  name_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  description_ar TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  category TEXT,
  sizes TEXT[] NOT NULL DEFAULT ARRAY['S','M','L','XL']::TEXT[],
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  stock INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Promotions
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  percent_off INTEGER NOT NULL CHECK (percent_off > 0 AND percent_off <= 100),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER promos_updated BEFORE UPDATE ON public.promotions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Contact requests
CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social links
CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER social_updated BEFORE UPDATE ON public.social_links
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Site settings (single row)
CREATE TABLE public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  brand_name TEXT NOT NULL DEFAULT 'TALIANI',
  tagline_en TEXT DEFAULT 'Carry the elegance.',
  tagline_fr TEXT DEFAULT 'Portez l''élégance.',
  tagline_ar TEXT DEFAULT 'إلبس الأناقة.',
  footer_en TEXT DEFAULT '© Taliani. All rights reserved.',
  footer_fr TEXT DEFAULT '© Taliani. Tous droits réservés.',
  footer_ar TEXT DEFAULT '© طلياني. جميع الحقوق محفوظة.',
  contact_email TEXT,
  contact_phone TEXT,
  whatsapp_number TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER settings_updated BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.site_settings (id) VALUES (1);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles policies
CREATE POLICY "Admins read roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users see their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Products: public read of visible items, admin full CRUD
CREATE POLICY "Public read visible products" ON public.products FOR SELECT USING (visible = true);
CREATE POLICY "Admins read all products" ON public.products FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Promotions: public read of active, admin full CRUD
CREATE POLICY "Public read active promos" ON public.promotions FOR SELECT USING (active = true AND (ends_at IS NULL OR ends_at > now()));
CREATE POLICY "Admins read all promos" ON public.promotions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert promos" ON public.promotions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update promos" ON public.promotions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete promos" ON public.promotions FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Contact requests: anyone can submit, only admins read/manage
CREATE POLICY "Anyone can submit a request" ON public.contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read requests" ON public.contact_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update requests" ON public.contact_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete requests" ON public.contact_requests FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Social links: public read of visible, admin manage
CREATE POLICY "Public read visible socials" ON public.social_links FOR SELECT USING (visible = true);
CREATE POLICY "Admins read all socials" ON public.social_links FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert socials" ON public.social_links FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update socials" ON public.social_links FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete socials" ON public.social_links FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Site settings: public read, admin update
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('taliani', 'taliani', true);

CREATE POLICY "Public read taliani assets" ON storage.objects FOR SELECT USING (bucket_id = 'taliani');
CREATE POLICY "Admins upload taliani" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'taliani' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update taliani" ON storage.objects FOR UPDATE USING (bucket_id = 'taliani' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete taliani" ON storage.objects FOR DELETE USING (bucket_id = 'taliani' AND public.has_role(auth.uid(), 'admin'));

-- Seed initial socials (admin can edit later)
INSERT INTO public.social_links (platform, url, sort_order) VALUES
  ('instagram', 'https://instagram.com/taliani', 1),
  ('tiktok', 'https://tiktok.com/@taliani', 2),
  ('facebook', 'https://facebook.com/taliani', 3);
