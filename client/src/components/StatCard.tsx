import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  subtext?: string;
}

export function StatCard({ title, value, icon, trend, trendUp, className, subtext }: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-br-full -z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div className="p-3 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-xs font-medium relative z-10">
          <span className={cn(
            "px-2 py-0.5 rounded-full",
            trendUp ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {trend}
          </span>
          <span className="mr-2 text-muted-foreground">مقارنة بالأمس</span>
        </div>
      )}
    </div>
  );
}
