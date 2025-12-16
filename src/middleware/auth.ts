import { Request, Response, NextFunction } from "express";

interface Session {
    userId: number;
    telefon: string;
    ism: string;
    createdAt: number;
}

const sessions = new Map<string, Session>();
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 soat

export function generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function createSession(user: { id: number; telefon: string; ism: string }): string {
    const sessionId = generateSessionId();
    sessions.set(sessionId, {
        userId: user.id,
        telefon: user.telefon,
        ism: user.ism,
        createdAt: Date.now(),
    });
    return sessionId;
}

export function validateSession(sessionId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
        sessions.delete(sessionId);
        return false;
    }
    return true;
}

export function getSession(sessionId: string): Session | undefined {
    return sessions.get(sessionId);
}

export function deleteSession(sessionId: string): void {
    sessions.delete(sessionId);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const sessionId = req.headers.authorization?.replace("Bearer ", "");

    if (!sessionId || !validateSession(sessionId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}

// Eski sessionlarni tozalash
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of sessions.entries()) {
        if (now - session.createdAt > SESSION_TIMEOUT) {
            sessions.delete(sessionId);
        }
    }
}, 60 * 60 * 1000);
