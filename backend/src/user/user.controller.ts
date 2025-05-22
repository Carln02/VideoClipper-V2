import {UserRepository} from "./user.repository";
import {respondSuccess, respondFailure} from "../utils/response";

export class UserController {
    public constructor(private userRepo: UserRepository) {}

    public getUser = async (req: any, res: any) => {
        const email = req.query.email;
        if (!email) return respondFailure(res, "Email required");

        const user = await this.userRepo.findByEmail(email);
        if (user) return respondSuccess(res, user);
        return respondFailure(res, "User not found");
    };
}