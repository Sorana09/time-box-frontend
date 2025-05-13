export interface SubjectEntity {
    id: number;
    name: string;
    description?: string;
    userId: number;
    numberOfSessions: number;
    timeAllotted: number;
}