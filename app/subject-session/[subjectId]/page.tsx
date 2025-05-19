"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Play, Pause, Clock } from "lucide-react"
import {
    fetchSubjects,
    fetchSessions,
    startSessionTimer,
    endSessionTimer,
    fetchSessionDuration,
} from "@/actions/fetchMethods"
import type { SubjectEntity } from "@/types/SubjectEntity"
import type { SubjectSessionEntity } from "@/types/SubjectSessionEntity"

export default function SubjectSessionPage() {
    const router = useRouter()
    const params = useParams()
    const subjectId = Number(params?.subjectId)

    const [subject, setSubject] = useState<SubjectEntity | null>(null)
    const [sessions, setSessions] = useState<SubjectSessionEntity[]>([])
    const [sessionDurations, setSessionDurations] = useState<Record<number, number>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch all subjects to find the current one
                const subjectList = await fetchSubjects()
                const currentSubject = subjectList.find((s) => s.id === subjectId)

                if (currentSubject) {
                    setSubject(currentSubject)

                    // Fetch all sessions and filter for this subject
                    const allSessions = await fetchSessions()
                    const subjectSessions = allSessions.filter((s) => s.subjectId === subjectId)

                    // Update sessions with elapsed time for running sessions
                    const now = Date.now()
                    const sessionsWithElapsed = subjectSessions.map((session) => {
                        if (session.running && session.startTime && !session.endTime) {
                            const elapsed = Math.floor((now - new Date(session.startTime).getTime()) / 1000)
                            return {
                                ...session,
                                timeAllotted: elapsed,
                            }
                        }
                        return session
                    })

                    setSessions(sessionsWithElapsed)

                    // Fetch duration for each session
                    const durations: Record<number, number> = {}
                    await Promise.all(
                        sessionsWithElapsed.map(async (session) => {
                            try {
                                const duration = await fetchSessionDuration(session.id)
                                durations[session.id] = duration
                            } catch (error) {
                                console.error(`Error fetching duration for session ${session.id}:`, error)
                                durations[session.id] = session.timeAllotted || 0
                            }
                        }),
                    )
                    setSessionDurations(durations)
                }
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()

        // Set up interval to update running sessions
        const interval = setInterval(async () => {
            setSessions((prevSessions) => {
                const updatedSessions = prevSessions.map((session) => {
                    if (session.running && session.startTime && !session.endTime) {
                        const elapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000)
                        return {
                            ...session,
                            timeAllotted: elapsed,
                        }
                    }
                    return session
                })

                // Update durations for running sessions
                updatedSessions.forEach(async (session) => {
                    if (session.running) {
                        try {
                            const duration = await fetchSessionDuration(session.id)
                            setSessionDurations((prev) => ({
                                ...prev,
                                [session.id]: duration,
                            }))
                        } catch (error) {
                            console.error(`Error updating duration for session ${session.id}:`, error)
                        }
                    }
                })

                return updatedSessions
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [subjectId])

    const handleToggleTimer = async (session: SubjectSessionEntity) => {
        if (session.running) {
            // End timer
            await endSessionTimer(session.id)

            setSessions((prev) =>
                prev.map((s) =>
                    s.id === session.id
                        ? {
                            ...s,
                            running: false,
                            endTime: new Date().toISOString(),
                            timeAllotted:
                                s.startTime && !s.endTime
                                    ? Math.floor((new Date().getTime() - new Date(s.startTime).getTime()) / 1000)
                                    : s.timeAllotted,
                        }
                        : s,
                ),
            )

            // Update the duration after stopping
            try {
                const duration = await fetchSessionDuration(session.id)
                setSessionDurations((prev) => ({
                    ...prev,
                    [session.id]: duration,
                }))
            } catch (error) {
                console.error(`Error fetching duration for session ${session.id}:`, error)
            }
        } else {
            // Start a new timer for this subject
            await startSessionTimer(subjectId)

            // Refresh sessions from backend
            const updatedSessions = await fetchSessions()
            const subjectSessions = updatedSessions.filter((s) => s.subjectId === subjectId)

            const now = Date.now()
            const sessionsWithElapsed = subjectSessions.map((s) => {
                if (s.running && s.startTime && !s.endTime) {
                    const elapsed = Math.floor((now - new Date(s.startTime).getTime()) / 1000)
                    return {
                        ...s,
                        timeAllotted: elapsed,
                    }
                }
                return s
            })

            setSessions(sessionsWithElapsed)

            // Fetch durations for all sessions including the new one
            const durations: Record<number, number> = { ...sessionDurations }
            await Promise.all(
                sessionsWithElapsed.map(async (session) => {
                    if (!durations[session.id]) {
                        try {
                            const duration = await fetchSessionDuration(session.id)
                            durations[session.id] = duration
                        } catch (error) {
                            console.error(`Error fetching duration for session ${session.id}:`, error)
                            durations[session.id] = session.timeAllotted || 0
                        }
                    }
                }),
            )
            setSessionDurations(durations)
        }
    }

    const formatDuration = (seconds = 0) => {
        const h = String(Math.floor(seconds / 3600)).padStart(2, "0")
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
        const s = String(seconds % 60).padStart(2, "0")
        return `${h}:${m}:${s}`
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not started"
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading subject data...</p>
            </div>
        )
    }

    if (!subject) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Subject not found</p>
            </div>
        )
    }

    const anyRunningSession = sessions.some((s) => s.running)
    const totalDuration = Object.values(sessionDurations).reduce((sum, duration) => sum + duration, 0)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            <div className="col-span-2">
                <div className="flex items-center mb-4">
                    <Button variant="ghost" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-bold">{subject.name}</h2>
                </div>

                <div className="mt-4 space-y-4">
                    {sessions.length > 0 ? (
                        sessions.map((session) => (
                            <Card key={session.id} className="flex items-center justify-between px-4 py-2">
                                <div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="text-lg font-semibold">
                      {formatDuration(sessionDurations[session.id] || session.timeAllotted || 0)}
                    </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Started: {formatDate(session.startTime)}</p>
                                    {session.endTime && (
                                        <p className="text-xs text-muted-foreground">Ended: {formatDate(session.endTime)}</p>
                                    )}
                                </div>
                                <div>
                                    {session.running && (
                                        <Button size="icon" onClick={() => handleToggleTimer(session)}>
                                            <Pause className="text-red-600" />
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="px-4 py-2">
                            <p className="text-center text-muted-foreground">No sessions recorded yet.</p>
                        </Card>
                    )}
                </div>
            </div>

            <div>
                <Card>
                    <CardContent className="p-4">
                        <h2 className="text-lg font-bold">Session Overview</h2>
                        <div className="my-4 text-center">
                            <p className="text-sm text-muted-foreground">Total Sessions</p>
                            <p className="text-xl font-bold">{sessions.length}</p>
                        </div>

                        <div className="my-4 text-center">
                            <p className="text-sm text-muted-foreground">Total Time</p>
                            <p className="text-xl font-bold">{formatDuration(totalDuration)}</p>
                        </div>

                        <Button
                            onClick={() =>
                                handleToggleTimer(
                                    anyRunningSession
                                        ? sessions.find((s) => s.running)!
                                        : ({ id: 0, timeAllotted: 0, running: false, subjectId } as SubjectSessionEntity),
                                )
                            }
                            className="w-full"
                        >
                            {anyRunningSession ? (
                                <>
                                    <Pause className="mr-2 h-4 w-4 text-red-600" />
                                    Stop Session
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4 text-green-600" />
                                    Start New Session
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
