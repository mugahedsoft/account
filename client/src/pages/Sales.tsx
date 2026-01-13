import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDailySalesSchema, type InsertDailySales } from "@shared/schema";
import { useDailySales, useCreateDailySales } from "@/hooks/use-financials";
import { Layout } from "@/components/Layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Calendar as CalendarIcon, Wallet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function SalesPage() {
  const [open, setOpen] = useState(false);
  const { data: sales, isLoading } = useDailySales();
  const createSale = useCreateDailySales();
  const { toast } = useToast();

  const form = useForm<InsertDailySales>({
    resolver: zodResolver(insertDailySalesSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      totalAmount: "0",
      bankakAmount: "0",
      cashAmount: "0",
    },
  });

  const onSubmit = (data: InsertDailySales) => {
    // Basic validation to ensure total matches sum of parts
    const total = Number(data.totalAmount);
    const sum = Number(data.bankakAmount) + Number(data.cashAmount);

    if (Math.abs(total - sum) > 1) { // Allow slight floating point diff
      form.setError("totalAmount", {
        message: "إجمالي المبلغ يجب أن يساوي مجموع بنكك والنقد"
      });
      return;
    }

    createSale.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({
          title: "تم الحفظ بنجاح",
          description: "تمت إضافة المبيعات اليومية للسجل.",
          className: "bg-green-500 text-white border-none",
        });
      },
      onError: (error) => {
        toast({
          title: "خطأ في الحفظ",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">سجل المبيعات اليومية</h1>
            <p className="text-muted-foreground mt-1">تتبع الإيرادات اليومية وتوزيعها</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-5 h-11 sm:px-6 sm:h-12 rounded-xl text-base sm:text-lg gap-2 w-full sm:w-auto">
                <Plus className="w-5 h-5" />
                تسجيل مبيعات جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-display text-center pb-2 border-b">
                  تسجيل مبيعات يومية
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التاريخ</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input type="date" className="pr-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankakAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-600">مبلغ بنكك</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cashAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-600">مبلغ النقد</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">الإجمالي الكلي</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="text-lg font-bold bg-secondary/50"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg rounded-xl"
                    disabled={createSale.isPending}
                  >
                    {createSale.isPending ? "جاري الحفظ..." : "حفظ المبيعات"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sales List */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="font-bold">السجلات السابقة</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالتاريخ..." className="pr-9 h-9 bg-white" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-secondary/50 text-muted-foreground text-sm font-medium">
                <tr>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">إجمالي المبيعات</th>
                  <th className="p-4 text-blue-600">بنكك</th>
                  <th className="p-4 text-green-600">نقد</th>
                  <th className="p-4">تاريخ الإدخال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">جاري تحميل البيانات...</td>
                  </tr>
                ) : sales?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Wallet className="w-12 h-12 opacity-20" />
                        <p>لا توجد سجلات مبيعات حتى الآن</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sales?.map((sale) => (
                    <tr key={sale.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-4 font-medium">{sale.date}</td>
                      <td className="p-4 font-bold">{Number(sale.totalAmount).toLocaleString()} ج.س</td>
                      <td className="p-4 text-blue-600">{Number(sale.bankakAmount).toLocaleString()}</td>
                      <td className="p-4 text-green-600">{Number(sale.cashAmount).toLocaleString()}</td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {sale.createdAt ? format(new Date(sale.createdAt), "yyyy-MM-dd HH:mm") : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
