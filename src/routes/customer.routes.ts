import { Router } from "express";
import { prisma } from "../lib/prisma";
import { customerSchema } from "../validators/schemas";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { yaratilganSana: "desc" },
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: "Mijozlarni olishda xatolik" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!customer) {
            return res.status(404).json({ error: "Mijoz topilmadi" });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: "Mijozni olishda xatolik" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { error, value } = customerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const customer = await prisma.customer.create({ data: value });
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: "Mijoz yaratishda xatolik" });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const { error, value } = customerSchema.validate(req.body, { allowUnknown: true });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const customer = await prisma.customer.update({
            where: { id: parseInt(req.params.id) },
            data: value,
        });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: "Mijozni yangilashda xatolik" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await prisma.customer.update({
            where: { id: parseInt(req.params.id) },
            data: { faol: false },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Mijozni o'chirishda xatolik" });
    }
});

export default router;
