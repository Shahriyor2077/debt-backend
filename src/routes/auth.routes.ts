import { Router } from "express";
import { prisma } from "../lib/prisma";
import { loginSchema } from "../validators/schemas";
import { createSession, deleteSession, validateSession, getSession, requireAuth } from "../middleware/auth";

const router = Router();

router.post("/login", async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { telefon } = value;

        let user = await prisma.user.findUnique({ where: { telefon } });

        if (!user) {
            user = await prisma.user.create({
                data: { telefon, ism: telefon, rol: "foydalanuvchi" },
            });
        }

        if (!user.faol) {
            return res.status(403).json({ error: "Sizning hisobingiz faol emas" });
        }

        const sessionId = createSession(user);

        res.json({
            success: true,
            sessionId,
            user: { id: user.id, telefon: user.telefon, ism: user.ism, rol: user.rol },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Tizimga kirishda xatolik" });
    }
});

router.post("/logout", (req, res) => {
    const sessionId = req.headers.authorization?.replace("Bearer ", "");
    if (sessionId) deleteSession(sessionId);
    res.json({ success: true });
});

router.get("/check", (req, res) => {
    const sessionId = req.headers.authorization?.replace("Bearer ", "");
    if (sessionId && validateSession(sessionId)) {
        const session = getSession(sessionId);
        return res.json({
            authenticated: true,
            user: session ? { telefon: session.telefon, ism: session.ism } : null,
        });
    }
    res.json({ authenticated: false });
});

router.get("/me", requireAuth, async (req, res) => {
    try {
        const sessionId = req.headers.authorization?.replace("Bearer ", "");
        const session = getSession(sessionId!);

        if (!session) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        if (!user) {
            return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
        }

        res.json({ id: user.id, telefon: user.telefon, ism: user.ism, rol: user.rol });
    } catch (error) {
        res.status(500).json({ error: "Xatolik" });
    }
});

export default router;
