import { Link, useLocation } from "wouter";
import { LayoutDashboard, Wallet, CreditCard, ShoppingBag, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/sales", label: "المبيعات اليومية", icon: Wallet },
  { href: "/expenses", label: "المصروفات", icon: CreditCard },
  { href: "/purchases", label: "المشتريات", icon: ShoppingBag },
  { href: "/reports", label: "التقارير", icon: PieChart },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-l border-border bg-card h-screen sticky top-0 flex flex-col shadow-sm z-30 hidden lg:flex">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-2xl font-bold font-display text-primary flex items-center gap-2">
          <span className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Wallet className="w-6 h-6" />
          </span>
          المدير المالي
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mr-1">نظام إدارة الحسابات</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/10">
          <p className="text-sm font-semibold text-primary">حالة النظام</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            متصل بالخادم
          </div>
        </div>
      </div>
    </aside>
  );
}

// Mobile Navigation
export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-1 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] z-50 lg:hidden flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;

        return (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "flex flex-col items-center gap-1 px-2 py-2 rounded-lg cursor-pointer transition-colors min-w-0",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
              <Icon className={cn("w-5 h-5", isActive && "fill-current")} />
              <span className="text-[10px] font-medium max-w-[4.5rem] truncate">
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
