import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import { MagneticButton } from '../components/MagneticButton';

export function NotFoundPage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
        {/* Ambient floating elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-border-subtle/20"
              style={{
                width: 60 + i * 40,
                height: 60 + i * 40,
                left: `${15 + i * 12}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.1, 0.25, 0.1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="section-container text-center relative z-10">
          {/* Glitch-style 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <p
              className="text-[10rem] md:text-[15rem] font-bold leading-none select-none"
              style={{
                WebkitTextStroke: '2px rgba(56, 189, 248, 0.3)',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 80px rgba(56, 189, 248, 0.1)',
              }}
            >
              404
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mt-4 mb-4">
              Page Not Found
            </h1>
            <p className="text-text-secondary max-w-md mx-auto mb-10">
              The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton href="/" variant="primary">
              <Home size={14} /> Back to Home
            </MagneticButton>
            <MagneticButton href="/projects" variant="secondary">
              <ArrowLeft size={14} /> View Projects
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
