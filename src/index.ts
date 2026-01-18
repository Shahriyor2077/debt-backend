import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import debtRoutes from "./routes/debt.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import statsRoutes from "./routes/stats.routes.js";

const app = express();

// Production'da barcha origin'larni qabul qil
const corsOptions = {
    origin: true, // Barcha origin'larni qabul qil
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
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
