import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
    try {
        const [jamiMijozlar, faolMijozlar] = await Promise.all([
            prisma.customer.count(),
            prisma.customer.count({ where: { faol: true } }),
        ]);

        const debts = await prisma.debt.findMany({
            where: { arxivlangan: false },
        });

        const now = new Date();
        let jamiQarzlar = 0;
        let tolanganQarzlar = 0;
        let tolanmaganQarzlar = 0;
        let qismanTolanganQarzlar = 0;
        let kechikkanQarzlar = 0;
        let jamiQarzSumma = 0;
        let tolanganSumma = 0;

        for (const debt of debts) {
            jamiQarzlar++;
            jamiQarzSumma += Number(debt.umumiySumma);
            tolanganSumma += Number(debt.tolanganSumma);

            if (debt.holati === "to'langan") {
                tolanganQarzlar++;
            } else if (debt.holati === "qisman") {
                qismanTolanganQarzlar++;
            } else {
                tolanmaganQarzlar++;
            }

            if (debt.qaytarishMuddati < now && debt.holati !== "to'langan") {
                kechikkanQarzlar++;
            }
        }

        res.json({
            jamiMijozlar,
            faolMijozlar,
            jamiQarzlar,
            tolanganQarzlar,
            tolanmaganQarzlar,
            qismanTolanganQarzlar,
            kechikkanQarzlar,
            jamiQarzSumma,
            tolanganSumma,
            qolganSumma: jamiQarzSumma - tolanganSumma,
        });
    } catch (error) {
        res.status(500).json({ error: "Statistikani olishda xatolik" });
    }
});

export default router;
