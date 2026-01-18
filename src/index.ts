import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import debtRoutes from "./routes/debt.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import statsRoutes from "./routes/stats.routes.js";

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"]
    : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stats", statsRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Server xatosi" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server ishga tushdi: http://localhost:${PORT}`);
});
