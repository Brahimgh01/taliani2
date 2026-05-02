import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/lib/i18n";
import storyImg from "@/assets/brand-story.jpg";
import heroImg from "@/assets/hero-main.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The atelier — Taliani" },
      { name: "description", content: "Born from a love of restraint. Taliani — premium clothing house from Tunis." },
    ],
  }),
  component: About,
});

function About() {
  const { t } = useI18n();
  return (
    <SiteShell>
      <section className="px-6 md:px-10 pt-32 md:pt-44 pb-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div className="text-eyebrow opacity-60 mb-6">— Manifeste</div>
          <h1 className="text-display text-7xl md:text-[12vw] leading-[0.9]">{t("about.title")}</h1>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 px-6 md:px-10 pb-24 md:pb-40">
        <div className="md:col-span-7 md:col-start-2">
          <motion.img initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }} src={heroImg} className="w-full aspect-[4/5] object-cover grayscale" alt="" />
        </div>
        <div className="md:col-span-4 md:col-start-9 flex items-center">
          <p className="text-xl md:text-2xl leading-snug opacity-90">{t("about.lead")}</p>
        </div>
      </section>

      <section className="bg-ink text-paper px-6 md:px-10 py-32 md:py-48">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-eyebrow opacity-60 mb-8">— Philosophie</div>
          <p className="text-display text-4xl md:text-6xl leading-tight">
            "Elegance is what remains when nothing else is needed."
          </p>
          <div className="text-eyebrow opacity-60 mt-12">— Atelier Taliani, Tunis</div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="px-6 md:px-16 py-24 md:py-32 flex flex-col justify-center order-2 md:order-1">
          <div className="text-eyebrow opacity-60 mb-6">— L'atelier</div>
          <h2 className="text-display text-4xl md:text-6xl mb-8">Tunis, Méditerranée.</h2>
          <p className="opacity-80 leading-relaxed max-w-md">
            Each Taliani garment is patterned, cut and assembled in our Tunis atelier. We work in small runs, with chosen fabrics, and an obsessive attention to the smallest detail — the weight of a seam, the fall of a hem, the touch of a finished edge.
          </p>
        </div>
        <div className="order-1 md:order-2">
          <img src={storyImg} alt="" className="w-full h-full aspect-[4/5] md:aspect-auto object-cover grayscale" />
        </div>
      </section>
    </SiteShell>
  );
}
