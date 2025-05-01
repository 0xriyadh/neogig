import { AuthService } from "../services/auth.service";
import {
    LoginInput,
    SignupInput,
    ApplicantSignupInput,
    CompanySignupInput,
} from "../models/auth.models";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async signup(input: SignupInput) {
        // Type guard to ensure correct profile data is passed
        if (input.role === "applicant") {
            return this.authService.signup(input as ApplicantSignupInput);
        } else {
            return this.authService.signup(input as CompanySignupInput);
        }
    }

    async login(input: LoginInput) {
        return this.authService.login(input);
    }
}
