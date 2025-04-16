'use server'


import {UserEntity} from "@/types/UserEntity";
import {fetchApi} from "@/actions/fetchApi";
import {getSessionDetails} from "@/actions/sessionAction";

export async function getUserDetails(): Promise<UserEntity | null> {
    try {
        const session = await getSessionDetails();
        return await fetchApi("/users/" + session?.userId, "GET", {
            tags: ['USER']
        });

    } catch (e) {
        return null;
    }
}

export async function fetchUsers (): Promise<UserEntity[]> {
    const req = await fetch('http://localhost:8085/users',{
        next: { tags: ['users'] }
    });
    return await req.json();
};

export async function fetchUserById(id: number): Promise<UserEntity> {
    const req = await fetch(`http://localhost:8085/users/${id}`, {
        next: { tags: ['users'] }
    });
    return await req.json();
}

