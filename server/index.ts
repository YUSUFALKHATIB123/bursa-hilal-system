import express from "express";
import cors from "cors";
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

  // Middleware with enhanced CORS for mobile devices
  app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084', 'http://192.168.1.111:8080', 'http://192.168.1.111:8081', 'http://192.168.1.111:8082', 'http://192.168.1.111:8083', 'http://192.168.1.111:8084'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      server: "Express server v2"
    });
  });

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
