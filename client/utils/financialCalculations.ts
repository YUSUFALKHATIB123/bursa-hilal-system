import systemData from "../data/systemData";

/**
 * UNIFIED FINANCIAL DATA CALCULATIONS
 *
 * This ensures ALL pages (Dashboard, Financial Dashboard, etc.)
 * use the SAME financial data from systemData.financials
 * to prevent inconsistencies between different sections.
 *
 * All revenue, expenses, and profit figures are synchronized.
 */
export const calculateFinancials = () => {
  // Use the unified financial data from systemData to ensure consistency
  const totalRevenue = systemData.financials.revenue;

  // Use the unified expense data from systemData to ensure consistency
  const totalExpenses = systemData.financials.expenses;

  // Calculate component breakdowns for detailed view
  const employeeSalaries = systemData.employees.reduce(
    (sum, emp) => sum + emp.paid,
    0,
  );

  // Estimate raw materials cost based on inventory movements (30% of inventory value)
  const rawMaterialsCost = systemData.inventory.reduce(
    (sum, item) => sum + item.quantity * item.price * 0.3,
    0,
  );

  // Use the unified profit data from systemData to ensure consistency
  const netProfit = systemData.financials.profit;
  const profitMargin = systemData.financials.margin;

  // Use the unified monthly data from systemData to ensure consistency
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthlyData = monthNames.map((month, index) => ({
    month,
    revenue: systemData.financials.monthlyRevenue[index] || 0,
    expenses: systemData.financials.monthlyExpenses[index] || 0,
    profit:
      (systemData.financials.monthlyRevenue[index] || 0) -
      (systemData.financials.monthlyExpenses[index] || 0),
  }));

  // Calculate expense breakdown with proportional amounts based on totalExpenses
  const baseBreakdown = [
    { category: "Labor", percentage: 37, color: "bg-green-500" },
    { category: "Raw Materials", percentage: 28, color: "bg-blue-500" },
    { category: "Utilities", percentage: 15, color: "bg-yellow-500" },
    {
      category: "Equipment & Maintenance",
      percentage: 12,
      color: "bg-purple-500",
    },
    { category: "Miscellaneous", percentage: 8, color: "bg-red-500" },
  ];

  const expenseBreakdown = baseBreakdown.map((item) => ({
    category: item.category,
    amount: Math.floor((totalExpenses * item.percentage) / 100),
    color: item.color,
    percentage: item.percentage,
  }));

  // Calculate outstanding payments from invoices
  const outstandingPayments = systemData.invoices.reduce((sum, invoice) => {
    return sum + invoice.amountRemaining;
  }, 0);

  // Calculate received payments to ensure consistency
  const receivedPayments = systemData.invoices.reduce((sum, invoice) => {
    return sum + invoice.amountReceived;
  }, 0);

  // Calculate overdue invoices
  const overdueInvoices = systemData.invoices.filter(
    (invoice) => invoice.isOverdue,
  );
  const overdueAmount = overdueInvoices.reduce(
    (sum, invoice) => sum + invoice.amountRemaining,
    0,
  );

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    monthlyData,
    expenseBreakdown,
    outstandingPayments,
    overdueAmount,
    overdueCount: overdueInvoices.length,

    // Additional metrics
    totalInvoices: systemData.invoices.length,
    paidInvoices: systemData.invoices.filter(
      (inv) => inv.paymentStatus === "paid",
    ).length,
    unpaidInvoices: systemData.invoices.filter(
      (inv) => inv.paymentStatus === "unpaid",
    ).length,
    partiallyPaidInvoices: systemData.invoices.filter(
      (inv) => inv.paymentStatus === "partial",
    ).length,

    // Customer financial data
    topCustomersByRevenue: systemData.customers
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map((customer) => ({
        name: customer.name,
        revenue: customer.totalRevenue,
        orders: customer.totalOrders,
      })),
  };
};

// Export the calculated data
export const realFinancialData = calculateFinancials();
