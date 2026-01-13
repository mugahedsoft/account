import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { useReports } from "@/hooks/use-financials";
import { Wallet, TrendingDown, TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Home() {
  // Always fetch today's stats for the dashboard
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: stats, isLoading } = useReports(today, today);

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-2">ملخص النشاط المالي ليوم {format(new Date(), "yyyy-MM-dd")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/sales">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 w-full sm:w-auto">
                <ArrowUpRight className="w-4 h-4" />
                إضافة مبيعات
              </button>
            </Link>
            <Link href="/expenses">
              <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition flex items-center justify-center gap-2 w-full sm:w-auto">
                <ArrowDownLeft className="w-4 h-4" />
                تسجيل مصروف
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="إجمالي المبيعات"
            value={isLoading ? "..." : `${stats?.totalSales.toLocaleString() ?? 0} ج.س`}
            icon={<Wallet className="w-6 h-6" />}
            className="border-primary/20"
            subtext="مبيعات اليوم فقط"
          />
          <StatCard
            title="إجمالي المصروفات"
            value={isLoading ? "..." : `${stats?.totalExpenses.toLocaleString() ?? 0} ج.س`}
            icon={<TrendingDown className="w-6 h-6" />}
            subtext="مصروفات اليوم"
          />
          <StatCard
            title="صافي بنكك"
            value={isLoading ? "..." : `${stats?.netBankak.toLocaleString() ?? 0} ج.س`}
            icon={<CreditCard className="w-6 h-6" />} // Placeholder icon import fix
            subtext="الرصيد في البنك"
          />
          <StatCard
            title="صافي النقد"
            value={isLoading ? "..." : `${stats?.netCash.toLocaleString() ?? 0} ج.س`}
            icon={<DollarSign className="w-6 h-6" />}
            subtext="الرصيد النقدي"
          />
        </div>

        {/* Recent Activity Placeholder - Could be actual list later */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-display">توزيع المبيعات</h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">اليوم</span>
            </div>

            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">جاري التحميل...</div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> بنكك</span>
                    <span className="font-bold">{stats?.salesBreakdown.bankak.toLocaleString()} ج.س</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${stats?.totalSales ? (stats.salesBreakdown.bankak / stats.totalSales) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> نقد</span>
                    <span className="font-bold">{stats?.salesBreakdown.cash.toLocaleString()} ج.س</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${stats?.totalSales ? (stats.salesBreakdown.cash / stats.totalSales) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-4 sm:p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h3 className="text-xl font-bold font-display mb-2 relative z-10">نظرة سريعة</h3>
            <p className="text-primary-foreground/80 text-sm mb-8 relative z-10">صافي الأرباح المقدرة لهذا اليوم</p>

            <div className="text-3xl sm:text-4xl font-bold font-display mb-2 relative z-10">
              {isLoading ? "..." : ((stats?.totalSales || 0) - (stats?.totalExpenses || 0)).toLocaleString()} ج.س
            </div>
            <p className="text-primary-foreground/80 text-sm relative z-10">
              (المبيعات - المصروفات)
            </p>

            <div className="mt-8 pt-6 border-t border-white/20 flex gap-4 relative z-10">
              <Link href="/reports">
                <button className="text-sm bg-white/20 hover:bg-white/30 transition px-4 py-2 rounded-lg backdrop-blur-sm">
                  عرض التقرير المفصل
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CreditCard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
