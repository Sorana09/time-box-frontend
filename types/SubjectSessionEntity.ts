export type SubjectSessionEntity = {

    id: number;
    startTime?: string; // ISO format
    endTime?: string;   // ISO format
    timeAllotted: number; // ISO 8601 duration format, e.g., 'PT5M'
    running : boolean
    subjectId: number;
}