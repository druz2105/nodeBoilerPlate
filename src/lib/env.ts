// @ts-ignore
import {cleanEnv, email, num, str} from "envalid";

export default cleanEnv(process.env, {
    STAGE: str(),
    DB_URL_LOCAL: str(),
    PORT: num(),
    TOKEN_KEY: str()
});
