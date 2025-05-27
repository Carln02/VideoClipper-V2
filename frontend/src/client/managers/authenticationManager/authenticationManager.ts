import {User} from "./authenticationManager.types";
import {RequestManager} from "../requestManager/requestManager";
import {Delegate} from "turbodombuilder";
import {ObjectId} from "mongodb";

export class AuthenticationManager extends RequestManager {
    private readonly googleClientID: string = "494682680465-p2mlm6q6aefp7lu45qe8f5lcl9kj5j8t.apps.googleusercontent.com";

    private _user: User = null;

    public readonly onLogin: Delegate<(loggedIn: boolean) => void> = new Delegate();

    public constructor() {
        super();
        this.onLogin.add((l) => console.log("LOGGED IN CLLED WITH", l))
        window.addEventListener("load", async () => await this.setup());
    }

    private get url(): string {
        return this.serverUrl + "api/auth/";
    }

    /**
     * The current user's info (email, name, etc.).
     */
    public get user(): User {
        return this._user;
    }

    private set user(value: User) {
        this._user = value;
    }

    public get userId(): ObjectId {
        return this.user._id;
    }

    public async init(): Promise<void> {
        await this.setup();
    }

    private async setup(): Promise<void> {
        const loggedIn = await this.isLoggedIn();

        if (!loggedIn) {
            if (!window.google) console.error("Google API not loaded");
            else window.google.accounts.id.initialize({client_id: this.googleClientID, callback: this.onGoogleLogin});
        }

        this.onLogin.fire(loggedIn);

    }

    private onGoogleLogin = async (response: { credential: string }) => {
        const res = await fetch(this.url + "google", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({idToken: response.credential}),
        });

        if (res.ok && await this.isLoggedIn()) this.onLogin.fire(true);
        else alert("Login failed.");
    }

    /**
     * Logs the user out (backend + UI).
     */
    public async logout(): Promise<void> {
        try {
            await fetch(this.url + "logout", {method: "POST", credentials: "include"});
            this.onLogin.fire(false);
            this.user = null;
            window.location.reload(); //TODO
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }

    /**
     * Checks if the user is currently logged in (session valid).
     */
    public async isLoggedIn(): Promise<boolean> {
        try {
            const res = await fetch("/api/auth/me", {credentials: "include"});
            if (!res.ok) return false;
            const data = await res.json();
            this._user = data.user;
            return data?.loggedIn === true;
        } catch (err) {
            console.warn("Session check failed:", err);
            return false;
        }
    }

    public renderGoogleButton(parentElement: HTMLElement, options: {theme: string, size: string} = {theme: "outline", size: "large"}) {
        window.google?.accounts.id.renderButton(parentElement, options);
    }
}

