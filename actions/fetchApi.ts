"use server";

import {cookies} from "next/headers";
import {revalidateTag} from "next/cache";

export async function fetchApi<T>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    next: NextFetchRequestConfig = {},
    data: object | undefined = undefined
): Promise<T> {
    const cooks = await cookies();

    const res = await fetch("http://localhost:8085" + path, {
        method,
        next,
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "X-SESSION": cooks.get("SESSION")?.value || ''
        }
    });

    const responseBody = await res.text();
    console.log(path, " ", res.status, " ", responseBody);
    if (200 != res.status) {
        return Promise.reject(new Error(responseBody));
    }
    if (method != "GET") {
        if (next.tags) next.tags.forEach(revalidateTag);
    }
    return JSON.parse(responseBody);
}

