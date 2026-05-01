import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useI18n, localizedField } from "@/lib/i18n";
import { formatTND } from "@/lib/cart";
import { useState } from "react";

export function ProductCard({ product, index = 0 }: { product: any; index?: number }) {
  const { lang } = useI18n();
  const [hover, setHover] = useState(false);
  const name = localizedField(product, "name", lang);
  const img1 = product.images?.[0] || "";
  const img2 = product.images?.[1] || img1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="group block"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={img1}
            alt={name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hover ? "opacity-0" : "opacity-100"}`}
          />
          <img
            src={img2}
            alt=""
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hover ? "opacity-100" : "opacity-0"}`}
          />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="text-base md:text-lg tracking-tight">{name}</h3>
          <span className="text-sm tabular-nums opacity-80">{formatTND(Number(product.price))}</span>
        </div>
        {product.category && (
          <div className="mt-1 text-eyebrow opacity-50">{product.category}</div>
        )}
      </Link>
    </motion.div>
  );
}
