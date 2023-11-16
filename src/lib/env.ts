// @ts-ignore
import {cleanEnv, email, num, str} from "envalid";

export default cleanEnv(process.env, {
    STAGE: str(),
    DB_URL_LOCAL: str(),
    PORT: num(),
    TOKEN_KEY: str(),
    SENDGRID_KEY: str(),
    VERIFICATION_LINK: str(),
    SEND_EMAIL: email(),
    VERIFY_ACCOUNT_TEMPLATE: str(),
    RESET_PASSWORD_LINK: str(),
    RESET_PASSWORD_TEMPLATE: str(),
});
