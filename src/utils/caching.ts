import { decryptData } from "./encryption";
import { verifyHash } from "./hash";

export const getUserCached = async (phone: string, password: string) => {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if(!key) return

        const verfied = await verifyHash(phone, key)
        if(verfied){
            const store:any = localStorage.getItem(key)
            const decoded:string = await decryptData(store);
            try {
                const jsonDecoded = JSON.parse(decoded);
                const verifyUser = await verifyHash(password, jsonDecoded.password);
                if(!verifyUser) throw 'error';
                return {
                    success: true,
                    user: jsonDecoded,
                    token: jsonDecoded.token
                }
            } catch (error) {
                return false
            }
        }
    }
}

export const removeUserCached = async (phone: string) => {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if(!key) return

        const verfied = await verifyHash(phone, key)
        if(verfied) localStorage.removeItem(key)
    }
}