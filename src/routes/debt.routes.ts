import { Router } from "express";
import { prisma } from "../lib/prisma";
import { debtSchema } from "../validators/schemas";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
    try {
        const debts = await prisma.debt.findMany({
            where: { arxivlangan: false },
            include: { mijoz: true, tolovlar: true },
            orderBy: { yaratilganSana: "desc" },
        });
        res.json(debts);
    } catch (error) {
        res.status(500).json({ error: "Qarzlarni olishda xatolik" });
    }
});

router.get("/overdue", async (req, res) => {
    try {
        const debts = await prisma.debt.findMany({
            where: {
                arxivlangan: false,
                qaytarishMuddati: { lt: new Date() },
                holati: { not: "to'langan" },
            },
            include: { mijoz: true, tolovlar: true },
            orderBy: { qaytarishMuddati: "asc" },
        });
        res.json(debts);
    } catch (error) {
        res.status(500).json({ error: "Kechikkan qarzlarni olishda xatolik" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const debt = await prisma.debt.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { mijoz: true, tolovlar: true },
        });
        if (!debt) {
            return res.status(404).json({ error: "Qarz topilmadi" });
        }
        res.json(debt);
    } catch (error) {
        res.status(500).json({ error: "Qarzni olishda xatolik" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { error, value } = debtSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const debt = await prisma.debt.create({
            data: {
                mijozId: value.mijozId,
                tovarNomi: value.tovarNomi,
                umumiySumma: value.umumiySumma,
                berilganSana: new Date(value.berilganSana),
                qaytarishMuddati: new Date(value.qaytarishMuddati),
            },
        });
        res.status(201).json(debt);
    } catch (error) {
        res.status(500).json({ error: "Qarz yaratishda xatolik" });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const data: any = {};
        if (req.body.tovarNomi) data.tovarNomi = req.body.tovarNomi;
        if (req.body.umumiySumma) data.umumiySumma = req.body.umumiySumma;
        if (req.body.berilganSana) data.berilganSana = new Date(req.body.berilganSana);
        if (req.body.qaytarishMuddati) data.qaytarishMuddati = new Date(req.body.qaytarishMuddati);

        const debt = await prisma.debt.update({
            where: { id: parseInt(req.params.id) },
            data,
        });
        res.json(debt);
    } catch (error) {
        res.status(500).json({ error: "Qarzni yangilashda xatolik" });
    }
});

router.patch("/:id/archive", async (req, res) => {
    try {
        const debt = await prisma.debt.update({
            where: { id: parseInt(req.params.id) },
            data: { arxivlangan: true },
        });
        res.json(debt);
    } catch (error) {
        res.status(500).json({ error: "Qarzni arxivlashda xatolik" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await prisma.debt.delete({ where: { id: parseInt(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Qarzni o'chirishda xatolik" });
    }
});

export default router;
