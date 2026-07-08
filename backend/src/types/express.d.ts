import type { UserModel } from "../_prisma_client/models.js";

declare global {
    namespace Express {
        interface User extends UserModel {}
    }
}
