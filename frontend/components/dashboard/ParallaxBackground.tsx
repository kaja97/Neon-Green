"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export default function ParallaxBackground() {
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(1000);

  useEffect(() => {
    // We need window height to calculate the scroll fade accurately
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fade out crop image between 0 and 60% of the window height scroll
  const cropOpacity = useTransform(scrollY, [0, windowHeight * 0.6], [1, 0]);
  
  // Fade in neon seeds image between 30% and 80% of window height scroll
  const seedsOpacity = useTransform(scrollY, [windowHeight * 0.3, windowHeight * 0.8], [0, 1]);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#0a0f12]">
      {/* Crop Illustrator Background */}
      <motion.div
        style={{ opacity: cropOpacity }}
        className="absolute inset-0 w-full h-full"
      >
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{ backgroundImage: `url('/images/crop-bg.png')` }}
        />
        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f12]/40 via-transparent to-[#0a0f12]" />
      </motion.div>

      {/* Neon Seeds Background */}
      <motion.div
        style={{ opacity: seedsOpacity }}
        className="absolute inset-0 w-full h-full"
      >
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{ backgroundImage: `url('/images/neon-seeds-bg.png')` }}
        />
        {/* Subtle overlay to blend into the theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f12] via-transparent to-[#0a0f12]/80" />
      </motion.div>
    </div>
  );
}
