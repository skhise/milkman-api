"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
const getEnv = (key, fallback) => {
    const value = process.env[key];
    if (!value && fallback === undefined) {
        throw new Error(`Missing required env var ${key}`);
    }
    return value ?? fallback ?? '';
};
exports.getEnv = getEnv;
//# sourceMappingURL=getEnv.js.map