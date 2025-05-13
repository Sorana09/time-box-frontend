'use server'


import {UserEntity} from "@/types/UserEntity";
import {fetchApi} from "@/actions/fetchApi";
import {getSessionDetails} from "@/actions/sessionAction";
import {SubjectEntity} from "@/types/SubjectEntity";
import {SubjectSessionEntity} from "@/types/SubjectSessionEntity";

// USERS
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

// SUBJECTS
export async function fetchSubjects(): Promise<SubjectEntity[]> {
    const req = await fetch('http://localhost:8085/subjects', {
        next: { tags: ['subjects'] }
    });
    return await req.json();
};

export async function createSubject(userId: number, name: string, description: string): Promise<SubjectEntity> {
    const subject: SubjectEntity = await fetchApi("/subjects", "POST", {
        tags: ['subjects'],
    }, {
        userId, name, description
    });
    return subject;
}

export async function deleteSubject(id: number): Promise<void> {
    await fetch(`http://localhost:8085/subjects/${id}`, {
        method: 'DELETE',
        next: {tags: ['subjects']}
    });
}


export async function fetchSessions(): Promise<SubjectSessionEntity[]> {
    const req = await fetch('http://localhost:8085/subject-session', {
        next: { tags: ['subjects'] }
    });
    return await req.json();
};

export async function createSession(subjectId : number): Promise<SubjectSessionEntity> {
    const subject: SubjectSessionEntity = await fetchApi("/subject-session", "POST", {
        tags: ['subjects'],
    }, {
        subjectId
    });
    return subject;
}

export async function startSessionTimer(id: number): Promise<void> {
    await fetch(`http://localhost:8085/subject-session/${id}/start`, {
        method: 'PUT',
        next: { tags: ['subject-session'] }
    });
}


export async function endSessionTimer(id: number): Promise<void> {
    await fetch(`http://localhost:8085/subject-session/${id}/end`, {
        method: 'PUT',
        next: { tags: ['subject-session'] }
    });
}


export async function deleteSessions(id: number): Promise<void> {
    await fetch(`http://localhost:8085/subject-session/${id}`, {
        method: 'DELETE',
        next: {tags: ['subject-session']}
    });
}

export async function fetchSessionDuration(id: number): Promise<number> {
    const req = await fetch(`http://localhost:8085/subject-session/duration/${id}`, {
        next: { tags: ['subject-session'] }
    });
    return await req.json();
};

export async function fetchNumberOfSessionsForAnSubject(id:number): Promise<number>{
    const req = await fetch(`http://localhost:8085/subjects/number-of-sessions/${id}`, {
        next: { tags: ['subject-session'] }
    });
    return await req.json();
}

export async function fetchTimeAllottedForAnSubject(id:number): Promise<number>{
    const req = await fetch(`http://localhost:8085/subjects/total-time-allotted/${id}`, {
        next: { tags: ['subject-session'] }
    });
    return await req.json();
}