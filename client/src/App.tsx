import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import SalesPage from "@/pages/Sales";
import ExpensesPage from "@/pages/Expenses";
import PurchasesPage from "@/pages/Purchases";
import ReportsPage from "@/pages/Reports";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sales" component={SalesPage} />
      <Route path="/expenses" component={ExpensesPage} />
      <Route path="/purchases" component={PurchasesPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
