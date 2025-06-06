import { Request, Response, NextFunction } from "express";

export function authenticate(sessions: Map<string, any>) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const sessionId = req.cookies.session;
        if (sessionId && sessions.has(sessionId)) req.user = sessions.get(sessionId);
        next();
    };
}

export function checkOrigin(allowedOrigins: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const origin = req.headers.origin;

        if (origin && allowedOrigins.includes(origin)) {
            res.header("Access-Control-Allow-Origin", origin);
            res.header("Access-Control-Allow-Credentials", "true");
        }

        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

        if (req.method === "OPTIONS") return res.sendStatus(200);
        next();
    };
}