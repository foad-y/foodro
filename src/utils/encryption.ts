// ====== CONFIG ======
const SECRET_KEY = 'secret-key';
// const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
if (!SECRET_KEY) throw new Error("Missing NEXT_PUBLIC_ENCRYPTION_KEY");

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

// تبدیل کلید به 32 بایت برای AES-256
const getKey = async () => {
    const keyData = TEXT_ENCODER.encode(SECRET_KEY.padEnd(32, "0").slice(0, 32));

    return crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
};

export const encryptData = async (text: string): Promise<string> => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey();

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        TEXT_ENCODER.encode(text)
    );

    return `${btoa(String.fromCharCode(...iv))}:${btoa(String.fromCharCode(...new Uint8Array(encrypted)))}`;
};

export const decryptData = async (combined: string): Promise<string | null> => {
    if(!combined.includes(':')) return ''
    try {
        const [ivB64, dataB64] = combined.split(":");

        const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
        const encryptedData = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));

        const key = await getKey();

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            encryptedData
        );

        return TEXT_DECODER.decode(decrypted);
    } catch (err) {
        console.error("Decrypt failed:", err);
        return null;
    }
};
