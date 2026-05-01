import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import p1 from "@/assets/preloader-01.jpg";
import p2 from "@/assets/preloader-02.jpg";
import p3 from "@/assets/preloader-03.jpg";
import p4 from "@/assets/preloader-04.jpg";
import p5 from "@/assets/preloader-05.jpg";
import p6 from "@/assets/preloader-06.jpg";

const IMAGES = [p1, p2, p3, p4, p5, p6];

export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const total = 2800;
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / total) * 100);
      setProgress(p);
      setIdx(Math.min(IMAGES.length - 1, Math.floor((p / 100) * IMAGES.length)));
      if (p < 100) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => setDone(true), 350);
        setTimeout(onDone, 1100);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] bg-ink text-paper flex flex-col"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={idx}
                src={IMAGES[idx]}
                alt=""
                className="w-[34vw] max-w-[420px] h-[44vh] object-cover grayscale"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            </AnimatePresence>
          </div>

          <div className="absolute top-6 left-6 text-eyebrow opacity-70">Taliani — Édition</div>
          <div className="absolute top-6 right-6 text-eyebrow opacity-70">MMXXVI</div>

          <div className="absolute bottom-8 left-0 right-0 px-6 flex items-end justify-between">
            <div className="text-eyebrow opacity-70">Loading the collection</div>
            <div className="font-mono text-5xl md:text-7xl tracking-tighter tabular-nums">
              {String(Math.floor(progress)).padStart(3, "0")}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-[2px] bg-paper" style={{ width: `${progress}%`, transition: "width 80ms linear" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
