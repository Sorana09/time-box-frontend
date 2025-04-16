'use server'
import {cookies} from "next/headers";
import {SessionEntity} from "@/types/SessionEntity";
import {fetchApi} from "@/actions/fetchApi";

export async function getSessionDetails(): Promise<SessionEntity | null> {
    return await fetchApi("/sessions/" + (await cookies()).get("SESSION")?.value, "GET", {
        tags: ["USER"]
    });
}

export async function deleteSession(): Promise<boolean> {
        return await fetchApi("/sessions/" +  (await cookies()).get("SESSION")?.value, "DELETE", {
            tags: ["USER"]
        });

}