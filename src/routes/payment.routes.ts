import { Router } from "express";
import { prisma } from "../lib/prisma";
import { paymentSchema } from "../validators/schemas";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                qarz: {
                    include: { mijoz: true },
                },
            },
            orderBy: { tolovSanasi: "desc" },
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: "To'lovlarni olishda xatolik" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { error, value } = paymentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const debt = await prisma.debt.findUnique({ where: { id: value.qarzId } });
        if (!debt) {
            return res.status(404).json({ error: "Qarz topilmadi" });
        }

        const payment = await prisma.payment.create({
            data: {
                qarzId: value.qarzId,
                summa: value.summa,
                izoh: value.izoh || null,
            },
        });

        // Qarz holatini yangilash
        const newTolangan = Number(debt.tolanganSumma) + Number(value.summa);
        const umumiy = Number(debt.umumiySumma);

        let holati: string;
        if (newTolangan >= umumiy) {
            holati = "to'langan";
        } else if (newTolangan > 0) {
            holati = "qisman";
        } else {
            holati = "to'lanmagan";
        }

        await prisma.debt.update({
            where: { id: value.qarzId },
            data: { tolanganSumma: newTolangan, holati },
        });

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ error: "To'lov yaratishda xatolik" });
    }
});

export default router;
