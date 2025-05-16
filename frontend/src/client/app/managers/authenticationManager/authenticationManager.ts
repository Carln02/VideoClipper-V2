export class AuthenticationManager {
    private user: { email: string; name?: string } | null = null;

    public constructor() {
        window.addEventListener("load", async () => await this.setup());
    }

    /**
     * Checks if the user is currently logged in (session valid).
     */
    public async isLoggedIn(): Promise<boolean> {
        try {
            const res = await fetch("/api/auth/me", {credentials: "include"});
            if (!res.ok) return false;

            const data = await res.json();
            this.user = data.user;
            return data.loggedIn === true;
        } catch {
            return false;
        }
    }

    /**
     * Returns the current user's info (email, name, etc).
     */
    public getUserInfo(): { email: string; name?: string } | null {
        return this.user;
    }

    /**
     * Logs the user out (backend + UI).
     */
    public async logout(): Promise<void> {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            this.user = null;
            window.location.reload(); //TODO
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }

    private get isGoogleDefined(): boolean {
        return !!window.google;
    }

    private async setup() {
        const isLoggedIn = await this.isLoggedIn();

        if (isLoggedIn) {
            console.log("User already logged in:", this.user);
            document.getElementById("google-login")?.remove();
            return;
        }

        if (!this.isGoogleDefined) {
            console.error("Google script not loaded");
            return;
        }

        this.initialize();
        this.render();
    }

    private initialize(): void {
        window.google?.accounts.id.initialize({
            client_id: "494682680465-p2mlm6q6aefp7lu45qe8f5lcl9kj5j8t.apps.googleusercontent.com",
            callback: async (response) => {
                const result = await fetch("/api/auth/google", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify({idToken: response.credential}),
                });

                if (result.ok) {
                    console.log("Logged in successfully");
                    document.getElementById("google-login")?.remove();
                    await this.isLoggedIn();
                } else {
                    alert("Login failed.");
                }
            }
        });
    }

    private render(): void {
        window.google?.accounts.id.renderButton(
            document.getElementById("google-login"),
            {theme: "outline", size: "large"}
        );
    }
}
