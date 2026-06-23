const encoder = new TextEncoder();
const decoder = new TextDecoder();

const ITERATIONS = 100000; // PBKDF2 secure cost
const KEY_LENGTH = 32;     // 256-bit
const DIGEST = "SHA-256";

/**
 * تولید salt تصادفی امن
 */
const generateSalt = (size = 16) => {
    return crypto.getRandomValues(new Uint8Array(size));
};

/**
 * هش کردن رشته با PBKDF2 (کاملاً یکطرفه)
 */
export const hashString = async (input: string): Promise<string> => {
    const salt = generateSalt();

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(input),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: ITERATIONS,
            hash: DIGEST
        },
        keyMaterial,
        KEY_LENGTH * 8
    );

    const hashArray = new Uint8Array(derivedBits);

    return `${btoa(String.fromCharCode(...salt))}:${btoa(String.fromCharCode(...hashArray))}`;
};


export const verifyHash = async (input: string, storedHash: string): Promise<boolean> => {
    if (!storedHash.includes(':')) return false;
    const [saltB64, hashB64] = storedHash.split(":");

    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const storedHashBytes = Uint8Array.from(atob(hashB64), c => c.charCodeAt(0));

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(input),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: ITERATIONS,
            hash: DIGEST
        },
        keyMaterial,
        KEY_LENGTH * 8
    );

    const newHashBytes = new Uint8Array(derivedBits);

    return timingSafeCompare(newHashBytes, storedHashBytes);
};

const timingSafeCompare = (a: Uint8Array, b: Uint8Array): boolean => {
    if (a.length !== b.length) return false;

    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a[i] ^ b[i];
    }
    return diff === 0;
};
