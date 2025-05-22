import {Request, Response} from "express";
import {OAuth2Client} from "google-auth-library";
import crypto from "crypto";
import {UserRepository} from "../user/user.repository";

export class AuthenticationController {
    private readonly clientId: string = process.env.GOOGLE_CLIENT_ID!;
    private readonly client: OAuth2Client = new OAuth2Client(this.clientId);

    public constructor(
        private sessions: Map<string, any>,
        private userRepository: UserRepository
    ) {}

    public getCurrentUser = (req: Request, res: Response) => {
        const sessionId = req.cookies.session;
        const user = this.sessions.get(sessionId);
        if (user) res.json({loggedIn: true, user});
        else res.status(401).json({loggedIn: false});
    };

    public loginWithGoogle = async (req: Request, res: Response) => {
        const idToken = req.body.idToken;

        try {
            const ticket = await this.client.verifyIdToken({idToken, audience: this.clientId});
            const payload = ticket.getPayload();
            const email = payload?.email;
            const name = payload?.name;

            if (!email || !name) return res.status(400).json({error: "Invalid Google payload"});
            let user = await this.userRepository.findByEmail(email);
            if (!user) user = await this.userRepository.createUser(email, name);

            const sessionId = crypto.randomUUID();
            this.sessions.set(sessionId, {_id: user._id, email: user.email, name: user.name});

            res.cookie("session", sessionId, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 30,
                sameSite: "lax",
            });
            res.sendStatus(200);
        } catch (err) {
            console.error("Invalid Google ID token", err);
            res.sendStatus(401);
        }
    };

    public logout = (req: Request, res: Response) => {
        const sessionId = req.cookies.session;
        this.sessions.delete(sessionId);
        res.clearCookie("session");
        res.sendStatus(200);
    };
}