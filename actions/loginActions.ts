"use server";

import {cookies} from "next/headers";
import {SessionEntity} from "@/types/SessionEntity";
import {fetchApi} from "@/actions/fetchApi";
import {UserEntity} from "@/types/UserEntity";



export async function login(email: string, password: string) {
    const session: SessionEntity = await fetchApi("/sessions", "POST", {
        tags: ['USER']
    }, {
        email, password
    });
    (await cookies()).set("SESSION", session.sessionKey);
    console.log("SESSION Cookie:", (await cookies()).get("SESSION")?.value);

    return session;
}

export async function register(email: string, password: string, firstName: string, lastName: string) {
    const session: UserEntity = await fetchApi("/users", "POST", {
        tags: ['USER'],
    }, {
        email, password, firstName, lastName
    });
    return session;
}



