import bcrypt from "bcrypt";

export const bcryptHash = async function (value: string, saltRounds: number = 10): Promise<string> {
    return await bcrypt.hash(value, saltRounds);
};

export const bcryptCompare = async function (value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue);
};
