"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  delay?: number;
  isPercentage?: boolean;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  delay = 0,
  isPercentage = true,
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card className={`${bgColor} border-none shadow-md hover:shadow-lg transition-all duration-300 h-full`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-muted-foreground truncate">{title}</h3>
            <p className="text-2xl font-bold text-foreground">
              {value}{isPercentage ? "%" : ""}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">{subtitle}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
