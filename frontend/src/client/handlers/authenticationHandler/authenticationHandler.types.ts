import {ObjectId} from "mongodb";

export type User = {
    _id: ObjectId,
    name: string,
    email: string
};

declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize(config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                    }): void;

                    renderButton(
                        parent: HTMLElement,
                        options: { theme: string; size: string }
                    ): void;

                    prompt(): void;
                };
            };
        };
    }
}

