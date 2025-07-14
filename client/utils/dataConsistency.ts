import systemData from "../data/systemData";
import { realFinancialData } from "./financialCalculations";

/**
 * DATA CONSISTENCY VERIFICATION UTILITY
 *
 * This utility ensures all financial data across the system
 * is consistent and synchronized between all pages and components.
 */

export const verifyDataConsistency = () => {
  // Check if all revenue figures match
  const dashboardRevenue = systemData.financials.revenue;
  const financialPageRevenue = realFinancialData.totalRevenue;
  const invoicesTotalReceived = systemData.invoices.reduce(
    (sum, inv) => sum + inv.amountReceived,
    0,
  );

  // Check if expenses match
  const dashboardExpenses = systemData.financials.expenses;
  const financialPageExpenses = realFinancialData.totalExpenses;

  // Check if profit calculations match
  const dashboardProfit = systemData.financials.profit;
  const financialPageProfit = realFinancialData.netProfit;

  const consistencyReport = {
    isConsistent: dashboardRevenue === financialPageRevenue,
    revenue: {
      dashboard: dashboardRevenue,
      financialPage: financialPageRevenue,
      invoicesReceived: invoicesTotalReceived,
      match: dashboardRevenue === financialPageRevenue,
    },
    expenses: {
      dashboard: dashboardExpenses,
      financialPage: financialPageExpenses,
      match: dashboardExpenses === financialPageExpenses,
    },
    profit: {
      dashboard: dashboardProfit,
      financialPage: financialPageProfit,
      match: Math.abs(dashboardProfit - financialPageProfit) < 1, // Allow for rounding differences
    },
    lastChecked: new Date().toISOString(),

    // Summary
    summary: {
      totalConsistencyScore: 0,
      issues: [] as string[],
      status: "checking..." as "consistent" | "inconsistent" | "checking...",
    },
  };

  // Calculate consistency score
  let consistentItems = 0;
  const totalItems = 3;

  if (consistencyReport.revenue.match) consistentItems++;
  if (consistencyReport.expenses.match) consistentItems++;
  if (consistencyReport.profit.match) consistentItems++;

  consistencyReport.summary.totalConsistencyScore =
    (consistentItems / totalItems) * 100;

  // Identify issues
  if (!consistencyReport.revenue.match) {
    consistencyReport.summary.issues.push(
      "Revenue figures do not match between dashboard and financial page",
    );
  }
  if (!consistencyReport.expenses.match) {
    consistencyReport.summary.issues.push(
      "Expense figures do not match between dashboard and financial page",
    );
  }
  if (!consistencyReport.profit.match) {
    consistencyReport.summary.issues.push(
      "Profit calculations do not match between dashboard and financial page",
    );
  }

  // Set overall status
  if (consistencyReport.summary.totalConsistencyScore === 100) {
    consistencyReport.summary.status = "consistent";
  } else {
    consistencyReport.summary.status = "inconsistent";
  }

  return consistencyReport;
};

export const getFinancialSummary = () => {
  return {
    totalRevenue: systemData.financials.revenue,
    totalExpenses: systemData.financials.expenses,
    netProfit: systemData.financials.profit,
    profitMargin: systemData.financials.margin,

    // Additional metrics
    totalOrders: systemData.orders.length,
    completedOrders: systemData.orders.filter((o) => o.status === "completed")
      .length,
    processingOrders: systemData.orders.filter((o) => o.status === "processing")
      .length,
    pendingOrders: systemData.orders.filter((o) => o.status === "pending")
      .length,

    totalInvoices: systemData.invoices.length,
    paidInvoices: systemData.invoices.filter((i) => i.paymentStatus === "paid")
      .length,
    unpaidInvoices: systemData.invoices.filter(
      (i) => i.paymentStatus === "unpaid",
    ).length,

    totalEmployees: systemData.employees.length,
    totalSalaryExpense: systemData.employees.reduce(
      (sum, emp) => sum + emp.salary,
      0,
    ),
    paidSalaries: systemData.employees.reduce((sum, emp) => sum + emp.paid, 0),

    // Data source confirmation
    dataSource: "systemData.financials (unified)",
    lastUpdated: new Date().toISOString(),
  };
};

// Export current financial data for debugging
export const getCurrentFinancialState = () => {
  const consistency = verifyDataConsistency();
  const summary = getFinancialSummary();

  return {
    consistency,
    summary,
    rawData: {
      systemDataFinancials: systemData.financials,
      calculatedFinancials: realFinancialData,
    },
  };
};
