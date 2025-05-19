"use client"

import { useEffect, useState, useRef } from "react"
import {
    fetchSubjects,
    createSubject,
    deleteSubject,
    fetchSessions,
    startSessionTimer,
    endSessionTimer,
    fetchNumberOfSessionsForAnSubject,
    getUserDetails,
} from "@/actions/fetchMethods"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { Play, Pause, Trash2 } from "lucide-react"

import type { SubjectEntity } from "@/types/SubjectEntity"
import type { SubjectSessionEntity } from "@/types/SubjectSessionEntity"

const COLORS = ["#00C4FF", "#1E1B4B", "#FFA500", "#00FF88", "#FF3366"]

export default function Dashboard() {
    const [subjects, setSubjects] = useState<SubjectEntity[]>([])
    const [sessions, setSessions] = useState<SubjectSessionEntity[]>([])
    const [sessionCounts, setSessionCounts] = useState<Record<number, number>>({})
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        let interval: NodeJS.Timeout

        const init = async () => {
            const [subjectList, rawSessions] = await Promise.all([fetchSubjects(), fetchSessions()])

            const now = Date.now()
            const sessionsWithElapsed = rawSessions.map((session) => {
                if (session.running && session.startTime && !session.endTime) {
                    const elapsed = Math.floor((now - new Date(session.startTime).getTime()) / 1000)
                    return {
                        ...session,
                        timeAllotted: elapsed,
                    }
                }
                return session
            })

            const counts: Record<number, number> = {}
            await Promise.all(
                subjectList.map(async (subject) => {
                    try {
                        const count = await fetchNumberOfSessionsForAnSubject(subject.id)
                        counts[subject.id] = typeof count === "number" ? count : 0
                    } catch {
                        counts[subject.id] = 0
                    }
                }),
            )

            setSubjects(subjectList)
            setSessions(sessionsWithElapsed)
            setSessionCounts(counts)

            interval = setInterval(() => {
                setSessions((prevSessions) =>
                    prevSessions.map((session) => {
                        if (session.running && session.startTime && !session.endTime) {
                            const elapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000)
                            return {
                                ...session,
                                timeAllotted: elapsed,
                            }
                        }
                        return session
                    }),
                )
            }, 1000)
        }

        init()

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [])

    const handleAddSubject = async () => {
        if (!name.trim()) return
        const user = await getUserDetails()
        if (!user) return

        const newSubject = await createSubject(user.id, name.trim(), description.trim())
        if (newSubject) {
            setSubjects((prev) => [...prev, newSubject])
            setSessionCounts((prev) => ({ ...prev, [newSubject.id]: 0 }))
        }

        setName("")
        setDescription("")
    }

    const handleToggleTimer = async (subjectId: number) => {
        const runningSession = sessions.find((s) => s.subjectId === subjectId && s.running)

        if (runningSession) {
            // END TIMER
            await endSessionTimer(runningSession.id)

            setSessions((prev) =>
                prev.map((s) =>
                    s.id === runningSession.id
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
        } else {
            // START TIMER - do not call `createSession` here!
            await startSessionTimer(subjectId) // This will create + start a session on backend

            // Then re-fetch all sessions properly from backend
            const updatedSessions = await fetchSessions()

            const now = Date.now()
            const sessionsWithElapsed = updatedSessions.map((session) => {
                if (session.running && session.startTime && !session.endTime) {
                    const elapsed = Math.floor((now - new Date(session.startTime).getTime()) / 1000)
                    return {
                        ...session,
                        timeAllotted: session.timeAllotted + elapsed,
                    }
                }
                return session
            })

            setSessions(sessionsWithElapsed)

            // Also refresh subject count
            const count = await fetchNumberOfSessionsForAnSubject(subjectId)
            setSessionCounts((prev) => ({
                ...prev,
                [subjectId]: typeof count === "number" ? count : 0,
            }))
        }
    }

    const handleDelete = async (id: number) => {
        await deleteSubject(id)
        setSubjects((prev) => prev.filter((s) => s.id !== id))
        setSessions((prev) => prev.filter((s) => s.subjectId !== id))
        setSessionCounts((prev) => {
            const copy = { ...prev }
            delete copy[id]
            return copy
        })
    }

    const formatDuration = (seconds = 0) => {
        const h = String(Math.floor(seconds / 3600)).padStart(2, "0")
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
        const s = String(seconds % 60).padStart(2, "0")
        return `${h}:${m}:${s}`
    }

    const subjectTimeMap: Record<number, number> = {}
    sessions.forEach((session) => {
        subjectTimeMap[session.subjectId] = (subjectTimeMap[session.subjectId] || 0) + (session.timeAllotted || 0)
    })

    const totalDuration = Object.values(subjectTimeMap).reduce((sum, time) => sum + time, 0)
    const getPercentage = (time: number) => (totalDuration === 0 ? 0 : (time / totalDuration) * 100)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            <div className="col-span-2">
                <h2 className="text-xl font-bold">Your Subjects</h2>
                <div className="flex items-center gap-2 mt-2">
                    <Input placeholder="New subject name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Button onClick={handleAddSubject}>Add</Button>
                </div>

                <div className="mt-4 space-y-4">
                    {subjects.map((subject, i) => {
                        const subjectTime = subjectTimeMap[subject.id] || 0
                        const isRunning = sessions.some((s) => s.subjectId === subject.id && s.running)
                        const sessionCount = sessionCounts[subject.id] || 0

                        return (
                            <Card key={subject.id} className="flex items-center justify-between px-4 py-2">
                                <div>
                                    <h3 className="text-lg font-semibold lowercase">{subject.name}</h3>
                                    <p className="text-sm text-muted-foreground">⏱ {formatDuration(subjectTime)} total</p>
                                    <a href={`/subject-session/${subject.id}`} className="text-xs text-muted-foreground hover:underline">
                                        {sessionCount} session{sessionCount !== 1 ? "s" : ""}
                                    </a>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" onClick={() => handleToggleTimer(subject.id)}>
                                        {isRunning ? <Pause className="text-red-600" /> : <Play className="text-green-600" />}
                                    </Button>

                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(subject.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>

            <div>
                <Card>
                    <CardContent className="p-4">
                        <h2 className="text-lg font-bold">Time Overview</h2>
                        <div className="relative w-48 h-48 mx-auto my-4">
                            <svg viewBox="0 0 200 200" className="w-full h-full rotate-[-90deg]">
                                {(() => {
                                    const radius = 80
                                    const center = 100
                                    let startAngle = 0

                                    return subjects.map((subject, i) => {
                                        const time = subjectTimeMap[subject.id] || 0
                                        const percent = getPercentage(time)
                                        if (percent <= 0) return null

                                        const angle = (percent / 100) * 360
                                        const endAngle = startAngle + angle
                                        const largeArc = angle > 180 ? 1 : 0

                                        const startX = center + radius * Math.cos((Math.PI * startAngle) / 180)
                                        const startY = center + radius * Math.sin((Math.PI * startAngle) / 180)
                                        const endX = center + radius * Math.cos((Math.PI * endAngle) / 180)
                                        const endY = center + radius * Math.sin((Math.PI * endAngle) / 180)

                                        const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`
                                        startAngle = endAngle

                                        return (
                                            <path
                                                key={subject.id}
                                                d={pathData}
                                                fill="none"
                                                stroke={COLORS[i % COLORS.length]}
                                                strokeWidth="20"
                                                strokeLinecap="round"
                                            />
                                        )
                                    })
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-xl font-bold">{formatDuration(totalDuration)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm mt-2 space-y-1">
                            {subjects.map((subject, i) => (
                                <div key={subject.id} className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {subject.name}
                  </span>
                                    <span className="font-mono text-muted-foreground">
                    {formatDuration(subjectTimeMap[subject.id] || 0)}
                  </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
