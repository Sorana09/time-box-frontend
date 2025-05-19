"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { fetchSessions } from "@/actions/fetchMethods"
import { Loader2 } from "lucide-react"
import type { SubjectSessionEntity } from "@/types/SubjectSessionEntity"

export default function StudyStatistics() {
    const [loading, setLoading] = useState(true)
    const [sessions, setSessions] = useState<SubjectSessionEntity[]>([])
    const [dailyData, setDailyData] = useState([])
    const [weeklyData, setWeeklyData] = useState([])
    const [monthlyData, setMonthlyData] = useState([])
    const [totalDuration, setTotalDuration] = useState(0)
    const [activeTab, setActiveTab] = useState("daily")

    // Process sessions and update all data
    const processAndUpdateData = useCallback((sessionData) => {
        // Calculate total study time directly from sessions
        const total = sessionData.reduce((sum, session) => sum + (session.calculatedTime || 0), 0)
        setTotalDuration(total)

        // Process data for charts
        const newDailyData = generateDailyData(sessionData)
        const newWeeklyData = generateWeeklyData(sessionData)
        const newMonthlyData = generateMonthlyData(sessionData)

        setDailyData(newDailyData)
        setWeeklyData(newWeeklyData)
        setMonthlyData(newMonthlyData)
    }, [])

    // Fetch sessions from API
    const fetchSessionData = useCallback(async () => {
        try {
            const rawSessions = await fetchSessions()

            // Process sessions - handle running sessions
            const now = Date.now()
            const processedSessions = rawSessions.map((session) => {
                if (session.running && session.startTime && !session.endTime) {
                    const startTime = new Date(session.startTime).getTime()
                    const elapsed = Math.floor((now - startTime) / 1000)
                    return {
                        ...session,
                        calculatedTime: elapsed,
                    }
                }
                return {
                    ...session,
                    calculatedTime: session.timeAllotted,
                }
            })

            setSessions(processedSessions)
            processAndUpdateData(processedSessions)
            setLoading(false)
        } catch (error) {
            console.error("Error loading sessions:", error)
            setLoading(false)
        }
    }, [processAndUpdateData])

    useEffect(() => {
        // Initial data load
        fetchSessionData()

        // Set up interval to refresh data every 10 seconds
        const refreshInterval = setInterval(() => {
            fetchSessionData()
        }, 10000)

        // Set up interval to update running sessions every second
        const updateInterval = setInterval(() => {
            setSessions((prevSessions) => {
                const now = Date.now()
                const updatedSessions = prevSessions.map((session) => {
                    if (session.running && session.startTime && !session.endTime) {
                        const startTime = new Date(session.startTime).getTime()
                        const elapsed = Math.floor((now - startTime) / 1000)
                        return {
                            ...session,
                            calculatedTime: elapsed,
                        }
                    }
                    return session
                })

                // Update all data with the updated sessions
                processAndUpdateData(updatedSessions)

                return updatedSessions
            })
        }, 1000)

        return () => {
            clearInterval(refreshInterval)
            clearInterval(updateInterval)
        }
    }, [fetchSessionData, processAndUpdateData])

    // Format duration in HH:MM:SS format
    const formatDuration = (seconds = 0) => {
        const h = String(Math.floor(seconds / 3600)).padStart(2, "0")
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
        const s = String(seconds % 60).padStart(2, "0")
        return `${h}:${m}:${s}`
    }

    // Generate daily data (last 7 days) - in minutes
    function generateDailyData(sessionData) {
        const result = []
        const now = new Date()

        // Create array for last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)

            const nextDay = new Date(date)
            nextDay.setDate(date.getDate() + 1)

            // Calculate total minutes for this day
            let totalSeconds = 0

            sessionData.forEach((session) => {
                if (!session.startTime) return

                const startTime = new Date(session.startTime)

                // Check if session falls on this day
                if (startTime >= date && startTime < nextDay) {
                    totalSeconds += session.calculatedTime || 0
                }
            })

            // Format the day label
            const dayLabel = date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "numeric",
                day: "numeric",
            })

            result.push({
                name: dayLabel,
                minutes: Math.round(totalSeconds / 60), // Convert seconds to minutes
            })
        }

        return result
    }

    // Generate weekly data (last 4 weeks) - in minutes
    function generateWeeklyData(sessionData) {
        const result = []
        const now = new Date()

        // Create array for last 4 weeks
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now)
            weekStart.setDate(now.getDate() - i * 7 - 6)
            weekStart.setHours(0, 0, 0, 0)

            const weekEnd = new Date(now)
            weekEnd.setDate(now.getDate() - i * 7)
            weekEnd.setHours(23, 59, 59, 999)

            // Calculate total minutes for this week
            let totalSeconds = 0

            sessionData.forEach((session) => {
                if (!session.startTime) return

                const startTime = new Date(session.startTime)

                // Check if session falls in this week
                if (startTime >= weekStart && startTime <= weekEnd) {
                    totalSeconds += session.calculatedTime || 0
                }
            })

            // Format the week label
            const startLabel = weekStart.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
            const endLabel = weekEnd.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })

            result.push({
                name: `${startLabel}-${endLabel}`,
                minutes: Math.round(totalSeconds / 60), // Convert seconds to minutes
            })
        }

        return result
    }

    // Generate monthly data (last 6 months) - in minutes
    function generateMonthlyData(sessionData) {
        const result = []
        const now = new Date()

        // Create array for last 6 months
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
            monthStart.setHours(0, 0, 0, 0)

            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
            monthEnd.setHours(23, 59, 59, 999)

            // Calculate total minutes for this month
            let totalSeconds = 0

            sessionData.forEach((session) => {
                if (!session.startTime) return

                const startTime = new Date(session.startTime)

                // Check if session falls in this month
                if (startTime >= monthStart && startTime <= monthEnd) {
                    totalSeconds += session.calculatedTime || 0
                }
            })

            // Format the month label
            const monthLabel = monthStart.toLocaleDateString("en-US", { month: "short" })

            result.push({
                name: monthLabel,
                minutes: Math.round(totalSeconds / 60), // Convert seconds to minutes
            })
        }

        return result
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Study Statistics</h3>
                    <div className="text-sm font-medium">
                        Total: <span className="text-primary">{formatDuration(totalDuration)}</span>
                    </div>
                </div>

                <Tabs defaultValue="daily" className="w-full" onValueChange={setActiveTab} value={activeTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>

                    <TabsContent value="daily" className="mt-0">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `${value}m`}
                                    />
                                    <Tooltip
                                        formatter={(value) => {
                                            const hours = Math.floor(value / 60)
                                            const mins = value % 60
                                            return [`${hours}h ${mins}m`, "Study time"]
                                        }}
                                        contentStyle={{
                                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                                            border: "none",
                                            borderRadius: "4px",
                                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="minutes"
                                        stroke="#00C4FF"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: "#00C4FF" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="weekly" className="mt-0">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `${value}m`}
                                    />
                                    <Tooltip
                                        formatter={(value) => {
                                            const hours = Math.floor(value / 60)
                                            const mins = value % 60
                                            return [`${hours}h ${mins}m`, "Study time"]
                                        }}
                                        contentStyle={{
                                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                                            border: "none",
                                            borderRadius: "4px",
                                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="minutes"
                                        stroke="#1E1B4B"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: "#1E1B4B" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="monthly" className="mt-0">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `${value}m`}
                                    />
                                    <Tooltip
                                        formatter={(value) => {
                                            const hours = Math.floor(value / 60)
                                            const mins = value % 60
                                            return [`${hours}h ${mins}m`, "Study time"]
                                        }}
                                        contentStyle={{
                                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                                            border: "none",
                                            borderRadius: "4px",
                                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="minutes"
                                        stroke="#FFA500"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: "#FFA500" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
