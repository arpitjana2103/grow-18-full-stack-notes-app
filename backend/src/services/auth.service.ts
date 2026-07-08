import type { Request, Response } from "express";

export const destroySessionAndLogout = function (req: Request, res: Response): Promise<void> {
    return new Promise(function (resolve, reject) {
        req.logout(function (err) {
            if (err) reject(err);

            req.session.destroy(function (err) {
                if (err) reject(err);
                res.clearCookie("g18-session");
                resolve();
            });
        });
    });
};
