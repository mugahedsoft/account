import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema, type InsertExpense } from "@shared/schema";
import { useExpenses, useCreateExpense, useDeleteExpense } from "@/hooks/use-financials";
import { Layout } from "@/components/Layout";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Calendar, CreditCard, Banknote } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const { data: expenses, isLoading } = useExpenses();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  const { toast } = useToast();

  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      amount: "",
      paymentMethod: "cash",
    },
  });

  const onSubmit = (data: InsertExpense) => {
    createExpense.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: "تم إضافة المصروف", className: "bg-green-500 text-white border-none" });
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      deleteExpense.mutate(id, {
        onSuccess: () => toast({ title: "تم الحذف بنجاح" }),
      });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">إدارة المصروفات</h1>
            <p className="text-muted-foreground mt-1">تسجيل ومتابعة جميع النفقات</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20 px-5 h-11 sm:px-6 sm:h-12 rounded-xl text-base sm:text-lg gap-2 w-full sm:w-auto">
                <Plus className="w-5 h-5" />
                صرف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-display text-center pb-2 border-b">
                  تسجيل مصروف جديد
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>بيان الصرف</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: فاتورة كهرباء، شراء أدوات..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المبلغ</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>التاريخ</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>طريقة الدفع</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col sm:flex-row gap-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0 bg-secondary/50 p-3 rounded-lg flex-1 cursor-pointer hover:bg-secondary transition border border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="cash" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer flex items-center gap-2">
                                <Banknote className="w-4 h-4 text-green-600" />
                                نقد
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-x-reverse space-y-0 bg-secondary/50 p-3 rounded-lg flex-1 cursor-pointer hover:bg-secondary transition border border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="bankak" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                                بنكك
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-white" disabled={createExpense.isPending}>
                    {createExpense.isPending ? "جاري الحفظ..." : "حفظ المصروف"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <p className="text-muted-foreground">جاري التحميل...</p>
          ) : expenses?.length === 0 ? (
            <p className="col-span-3 text-center py-10 text-muted-foreground">لا توجد مصروفات مسجلة</p>
          ) : (
            expenses?.map((expense) => (
              <div key={expense.id} className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition group relative">
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg ${expense.paymentMethod === 'bankak' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {expense.paymentMethod === 'bankak' ? <CreditCard className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                  </div>
                  <span className="text-xl font-bold font-display">{Number(expense.amount).toLocaleString()} ج.س</span>
                </div>
                <h4 className="font-bold text-lg mb-1">{expense.description}</h4>
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-4 pt-4 border-t border-dashed">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {expense.date}</span>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
