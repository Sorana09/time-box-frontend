export interface SubjectEntity {
    id: number;
    name: string;
    description?: string;
    startTime?: string; // ISO format
    endTime?: string;   // ISO format
    numberOfSessions: number;
    timeAllotted: number; // ISO 8601 duration format, e.g., 'PT5M'
    running : boolean
    userId: number;
}