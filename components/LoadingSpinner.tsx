"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-50">
      <div className="flex flex-col items-center gap-8">
        <div className="w-20 h-20 rounded-full spinner-circle" />

        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full progress-fill rounded-full" />
        </div>

        <motion.p
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-medium text-muted-foreground"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}
