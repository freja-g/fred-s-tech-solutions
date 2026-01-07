import { motion } from "framer-motion";

const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large glowing orb */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-accent/10 blur-3xl"
        style={{ top: "10%", right: "5%" }}
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Smaller accent orb */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-accent/5 blur-2xl"
        style={{ bottom: "20%", left: "10%" }}
        animate={{
          y: [0, 20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Geometric shapes */}
      <motion.div
        className="absolute w-4 h-4 border-2 border-accent/30 rotate-45"
        style={{ top: "30%", right: "20%" }}
        animate={{
          rotate: [45, 135, 45],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-3 h-3 bg-accent/40 rounded-full"
        style={{ top: "50%", right: "30%" }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-6 h-6 border border-primary-foreground/20 rounded-full"
        style={{ top: "60%", right: "15%" }}
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Circuit-like lines */}
      <svg
        className="absolute top-0 right-0 w-1/2 h-full opacity-10"
        viewBox="0 0 400 600"
        fill="none"
      >
        <motion.path
          d="M 350 0 L 350 150 L 250 150 L 250 300 L 150 300"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        <motion.path
          d="M 400 200 L 300 200 L 300 350 L 200 350 L 200 500"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.circle
          cx="250"
          cy="150"
          r="4"
          fill="hsl(var(--accent))"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
        <motion.circle
          cx="300"
          cy="200"
          r="4"
          fill="hsl(var(--accent))"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        />
      </svg>
    </div>
  );
};

export default FloatingShapes;
