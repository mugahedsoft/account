import { useState } from "react";
import { useReports } from "@/hooks/use-financials";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import { format, subDays } from "date-fns";
import { Wallet, TrendingDown, DollarSign } from "lucide-react";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: report, isLoading } = useReports(startDate, endDate);

  const pieData = [
    { name: "بنكك", value: report?.salesBreakdown?.bankak || 0 },
    { name: "نقد", value: report?.salesBreakdown?.cash || 0 },
  ];

  const COLORS = ["#3b82f6", "#22c55e"]; // Blue, Green

  // Mock trend data for chart visualization (since API returns aggregate)
  // In a real app, you'd fetch daily breakdown
  const chartData = [
    { name: "مبيعات", amount: report?.totalSales || 0 },
    { name: "مصروفات", amount: report?.totalExpenses || 0 },
    { name: "مشتريات", amount: report?.totalPurchases || 0 },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">التقارير المالية</h1>
            <p className="text-muted-foreground mt-1">تحليل الأداء المالي للفترة المحددة</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end w-full md:w-auto">
            <div>
              <label className="text-sm font-medium mb-1 block">من</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">إلى</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
            <Button className="bg-primary text-white hover:bg-primary/90 w-full sm:w-auto">تحديث</Button>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="صافي الأرباح"
            value={isLoading ? "..." : ((report?.totalSales || 0) - (report?.totalExpenses || 0) - (report?.totalPurchases || 0)).toLocaleString() + " ج.س"}
            icon={<DollarSign className="w-6 h-6" />}
            className="border-green-500/20 bg-green-50/50 dark:bg-green-900/10"
            subtext="(مبيعات - مصروفات - مشتريات)"
          />
          <StatCard
            title="إجمالي المبيعات"
            value={isLoading ? "..." : report?.totalSales.toLocaleString() ?? 0}
            icon={<Wallet className="w-6 h-6" />}
          />
          <StatCard
            title="إجمالي المصروفات"
            value={isLoading ? "..." : report?.totalExpenses.toLocaleString() ?? 0}
            icon={<TrendingDown className="w-6 h-6" />}
          />
          <StatCard
            title="إجمالي المشتريات"
            value={isLoading ? "..." : report?.totalPurchases.toLocaleString() ?? 0}
            icon={<DollarSign className="w-6 h-6" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm h-[320px] sm:h-[400px]">
            <h3 className="text-lg font-bold font-display mb-6">ملخص الفترة</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="amount" fill="var(--primary)" radius={[8, 8, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm h-[320px] sm:h-[400px]">
            <h3 className="text-lg font-bold font-display mb-6">توزيع طرق الدفع (المبيعات)</h3>
            <div className="flex items-center justify-center h-[85%]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
