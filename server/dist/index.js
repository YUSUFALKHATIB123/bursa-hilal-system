import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo.js";
import ordersRouter from "./routes/orders.js";
import invoicesRouter from "./routes/invoices.js";
import customersRouter from "./routes/customers.js";
import inventoryRouter from "./routes/inventory.js";
import employeesRouter from "./routes/employees.js";
import notificationsRouter from "./routes/notifications.js";
import financialsRouter from "./routes/financials.js";
import suppliersRouter from "./routes/suppliers.js";
export function createServer() {
    const app = express();
    // تقديم ملفات public
    app.use(express.static(path.join(process.cwd(), "client/public")));
    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Example API routes
    app.get("/api/ping", (_req, res) => {
        res.json({ message: "Hello from Express server v2!" });
    });
    app.get("/api/demo", handleDemo);
    // API routes for all data types
    app.use("/api/orders", ordersRouter);
    app.use("/api/invoices", invoicesRouter);
    app.use("/api/customers", customersRouter);
    app.use("/api/inventory", inventoryRouter);
    app.use("/api/employees", employeesRouter);
    app.use("/api/notifications", notificationsRouter);
    app.use("/api/financials", financialsRouter);
    app.use("/api/suppliers", suppliersRouter);
    return app;
}
