import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "fr" | "ar";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.shop": "Shop",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.cart": "Bag",
  "hero.eyebrow": "Spring / Summer Édition",
  "hero.title.1": "Carry",
  "hero.title.2": "the elegance.",
  "hero.subtitle": "Premium garments, conceived in Tunisia, dressed for the world.",
  "hero.cta": "Discover the collection",
  "featured.eyebrow": "Featured",
  "featured.title": "The signature pieces.",
  "story.eyebrow": "The house",
  "story.title": "An atelier of restraint.",
  "story.body": "Taliani is a contemporary clothing house built around a singular conviction — that elegance is what remains when nothing else is needed. Every piece is sketched, cut, and assembled with the discipline of an atelier and the sensibility of a magazine.",
  "story.cta": "Read the story",
  "promo.title": "20% off your first order",
  "promo.code": "Use code TALIANI20 at checkout",
  "footer.tagline": "Carry the elegance.",
  "footer.menu": "Menu",
  "footer.contact": "Contact",
  "footer.lang": "Language",
  "footer.rights": "All rights reserved.",
  "shop.title": "The collection",
  "shop.filter.all": "All",
  "shop.filter.tops": "Tops",
  "shop.filter.outerwear": "Outerwear",
  "shop.filter.bottoms": "Bottoms",
  "shop.empty": "No pieces match your selection.",
  "product.size": "Size",
  "product.add": "Add to bag",
  "product.added": "Added to bag",
  "product.description": "Description",
  "product.details": "Details",
  "cart.title": "Your bag",
  "cart.empty": "Your bag is empty.",
  "cart.continue": "Continue shopping",
  "cart.subtotal": "Subtotal",
  "cart.checkout": "Order via WhatsApp",
  "cart.remove": "Remove",
  "cart.qty": "Qty",
  "contact.title": "Send us a message",
  "contact.subtitle": "Custom requests, collaborations, or anything else — we read every word.",
  "contact.name": "Name",
  "contact.email": "Email",
  "contact.phone": "Phone (optional)",
  "contact.message": "Message",
  "contact.send": "Send",
  "contact.sent": "Message sent. We'll be in touch.",
  "about.title": "The atelier.",
  "about.lead": "Taliani is born from a love of restraint — a conviction that clothing, at its highest, should disappear into the person who wears it.",
};

const fr: Dict = {
  "nav.shop": "Boutique",
  "nav.about": "Maison",
  "nav.contact": "Contact",
  "nav.cart": "Panier",
  "hero.eyebrow": "Édition Printemps / Été",
  "hero.title.1": "Portez",
  "hero.title.2": "l'élégance.",
  "hero.subtitle": "Des pièces premium, pensées en Tunisie, habillées pour le monde.",
  "hero.cta": "Découvrir la collection",
  "featured.eyebrow": "Sélection",
  "featured.title": "Les pièces signature.",
  "story.eyebrow": "La maison",
  "story.title": "Un atelier de retenue.",
  "story.body": "Taliani est une maison de prêt-à-porter contemporaine bâtie autour d'une seule conviction — l'élégance est ce qui reste quand plus rien n'est nécessaire. Chaque pièce est dessinée, coupée et assemblée avec la discipline d'un atelier et la sensibilité d'un magazine.",
  "story.cta": "Lire l'histoire",
  "promo.title": "20% sur votre première commande",
  "promo.code": "Code TALIANI20 à la validation",
  "footer.tagline": "Portez l'élégance.",
  "footer.menu": "Menu",
  "footer.contact": "Contact",
  "footer.lang": "Langue",
  "footer.rights": "Tous droits réservés.",
  "shop.title": "La collection",
  "shop.filter.all": "Tout",
  "shop.filter.tops": "Hauts",
  "shop.filter.outerwear": "Vestes",
  "shop.filter.bottoms": "Bas",
  "shop.empty": "Aucune pièce ne correspond.",
  "product.size": "Taille",
  "product.add": "Ajouter au panier",
  "product.added": "Ajouté au panier",
  "product.description": "Description",
  "product.details": "Détails",
  "cart.title": "Votre panier",
  "cart.empty": "Votre panier est vide.",
  "cart.continue": "Continuer mes achats",
  "cart.subtotal": "Sous-total",
  "cart.checkout": "Commander par WhatsApp",
  "cart.remove": "Retirer",
  "cart.qty": "Qté",
  "contact.title": "Écrivez-nous",
  "contact.subtitle": "Demandes sur-mesure, collaborations, ou autre — nous lisons chaque mot.",
  "contact.name": "Nom",
  "contact.email": "Email",
  "contact.phone": "Téléphone (optionnel)",
  "contact.message": "Message",
  "contact.send": "Envoyer",
  "contact.sent": "Message envoyé. Nous reviendrons vers vous.",
  "about.title": "L'atelier.",
  "about.lead": "Taliani naît d'un amour de la retenue — la conviction qu'un vêtement, à son sommet, doit disparaître dans la personne qui le porte.",
};

const ar: Dict = {
  "nav.shop": "المتجر",
  "nav.about": "علينا",
  "nav.contact": "تواصل",
  "nav.cart": "السلة",
  "hero.eyebrow": "إصدار الربيع / الصيف",
  "hero.title.1": "إلبس",
  "hero.title.2": "الأناقة.",
  "hero.subtitle": "حوايج بريميام، متصممة في تونس، للعالم.",
  "hero.cta": "إكتشف الكوليكسيون",
  "featured.eyebrow": "مختارات",
  "featured.title": "القطع السيغناتور.",
  "story.eyebrow": "الدار",
  "story.title": "أتوليي بسيط ومضبوط.",
  "story.body": "طلياني هي دار حوايج معاصرة مبنية على إيمان واحد — الأناقة هي اللي تبقى كي ما يبقاش شيء آخر يلزم. كل قطعة معمولة بيد، مقصوصة ومخيطة بانضباط الأتوليي وحس المجلة.",
  "story.cta": "إقرا القصة",
  "promo.title": "تخفيض 20% على أول كوموند",
  "promo.code": "إستعمل كود TALIANI20",
  "footer.tagline": "إلبس الأناقة.",
  "footer.menu": "القائمة",
  "footer.contact": "تواصل",
  "footer.lang": "اللغة",
  "footer.rights": "جميع الحقوق محفوظة.",
  "shop.title": "الكوليكسيون",
  "shop.filter.all": "الكل",
  "shop.filter.tops": "أعلى",
  "shop.filter.outerwear": "جاكيت",
  "shop.filter.bottoms": "بنطلون",
  "shop.empty": "ما فماش قطع تتماشى مع اختيارك.",
  "product.size": "القياس",
  "product.add": "زيد للسلة",
  "product.added": "تزاد للسلة",
  "product.description": "الوصف",
  "product.details": "التفاصيل",
  "cart.title": "السلة متاعك",
  "cart.empty": "السلة فارغة.",
  "cart.continue": "كمل الشراء",
  "cart.subtotal": "المجموع",
  "cart.checkout": "إطلب على WhatsApp",
  "cart.remove": "نحي",
  "cart.qty": "كم",
  "contact.title": "أبعثلنا رسالة",
  "contact.subtitle": "طلبات خاصة، تعاون، أو أي حاجة أخرى — نقراو كل كلمة.",
  "contact.name": "الإسم",
  "contact.email": "Email",
  "contact.phone": "تيليفون (اختياري)",
  "contact.message": "الرسالة",
  "contact.send": "أبعث",
  "contact.sent": "تبعثت الرسالة. باش نرجعولك.",
  "about.title": "الأتوليي.",
  "about.lead": "طلياني تولدت من حب البساطة — الإيمان إلي اللبسة في أوج جمالها لازمها تذوب في الإنسان إلي يلبسها.",
};

const dictionaries: Record<Lang, Dict> = { en, fr, ar };

interface I18nContext {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<I18nContext | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("taliani.lang") : null) as Lang | null;
    if (saved && ["en", "fr", "ar"].includes(saved)) setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("taliani.lang", l);
  };

  const t = (key: string) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return <Ctx.Provider value={{ lang, setLang, t, dir }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function localizedField<T extends Record<string, any>>(row: T, base: string, lang: Lang): string {
  return row[`${base}_${lang}`] || row[`${base}_en`] || "";
}
