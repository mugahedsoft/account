import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPurchaseSchema, type InsertPurchase } from "@shared/schema";
import { usePurchases, useCreatePurchase, useDeletePurchase } from "@/hooks/use-financials";
import { Layout } from "@/components/Layout";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function PurchasesPage() {
  const [open, setOpen] = useState(false);
  const { data: purchases, isLoading } = usePurchases();
  const createPurchase = useCreatePurchase();
  const deletePurchase = useDeletePurchase();
  const { toast } = useToast();

  const form = useForm<InsertPurchase>({
    resolver: zodResolver(insertPurchaseSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      itemName: "",
      amount: "",
    },
  });

  const onSubmit = (data: InsertPurchase) => {
    createPurchase.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: "تم إضافة المشتريات", className: "bg-green-500 text-white border-none" });
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("حذف هذا السجل؟")) {
      deletePurchase.mutate(id, {
        onSuccess: () => toast({ title: "تم الحذف" }),
      });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">سجل المشتريات</h1>
            <p className="text-muted-foreground mt-1">إدارة مشتريات البضائع والمخزون</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 px-5 h-11 sm:px-6 sm:h-12 rounded-xl text-base sm:text-lg gap-2 w-full sm:w-auto">
                <Plus className="w-5 h-5" />
                شراء بضاعة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-display text-center pb-2 border-b">
                  إضافة مشتريات
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                  <FormField
                    control={form.control}
                    name="itemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الصنف / البضاعة</FormLabel>
                        <FormControl>
                          <Input placeholder="اسم المنتج..." {...field} />
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
                          <FormLabel>التكلفة</FormLabel>
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

                  <Button type="submit" className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white" disabled={createPurchase.isPending}>
                    {createPurchase.isPending ? "جاري الحفظ..." : "حفظ المشتريات"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[520px]">
              <thead className="bg-secondary/30 text-muted-foreground font-medium">
                <tr>
                  <th className="p-3 sm:p-4">الصنف</th>
                  <th className="p-3 sm:p-4">التكلفة</th>
                  <th className="p-3 sm:p-4">التاريخ</th>
                  <th className="p-3 sm:p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-6 text-center">جاري التحميل...</td></tr>
                ) : purchases?.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">لا توجد مشتريات</td></tr>
                ) : (
                  purchases?.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/10">
                      <td className="p-3 sm:p-4 font-bold">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-purple-500" />
                          {item.itemName}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 font-bold text-purple-700">{Number(item.amount).toLocaleString()} ج.س</td>
                      <td className="p-3 sm:p-4 text-muted-foreground">{item.date}</td>
                      <td className="p-3 sm:p-4">
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
