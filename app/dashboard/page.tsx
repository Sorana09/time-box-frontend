"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw } from "lucide-react"

export default function PomodoroTimer() {
    const TIMER_MODES = {
        pomodoro: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
    }

    const [mode, setMode] = useState<"pomodoro" | "shortBreak" | "longBreak">("pomodoro")
    const [timeLeft, setTimeLeft] = useState(TIMER_MODES[mode])
    const [isActive, setIsActive] = useState(false)
    const [cycles, setCycles] = useState(0)

    useEffect(() => {
        setTimeLeft(TIMER_MODES[mode])
        setIsActive(false)
    }, [mode])

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1)
            }, 1000)
        } else if (isActive && timeLeft === 0) {
            setIsActive(false)

            if (mode === "pomodoro") {
                const newCycles = cycles + 1
                setCycles(newCycles)

                if (newCycles % 4 === 0) {
                    setMode("longBreak")
                } else {
                    setMode("shortBreak")
                }
            } else {
                setMode("pomodoro")
            }

        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isActive, timeLeft, mode, cycles])


    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const toggleTimer = () => setIsActive(!isActive)
    const resetTimer = () => {
        setIsActive(false)
        setTimeLeft(TIMER_MODES[mode])
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black dark:bg-black dark:text-white">
            <div className="w-full max-w-md rounded-lg border border-gray-200 p-8 shadow-sm dark:border-gray-800">
                <h1 className="mb-6 text-center text-2xl font-bold tracking-tight">Pomodoro Timer</h1>

                <Tabs defaultValue="pomodoro" className="mb-6" onValueChange={(value) => setMode(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
                        <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
                        <TabsTrigger value="longBreak">Long Break</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="mb-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 text-7xl font-bold tabular-nums">{formatTime(timeLeft)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {mode === "pomodoro" ? "Focus time" : "Break time"}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center space-x-4">
                    <Button variant="outline" size="icon" onClick={toggleTimer} className="h-12 w-12 rounded-full border-2">
                        {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>

                    <Button variant="outline" size="icon" onClick={resetTimer} className="h-12 w-12 rounded-full border-2">
                        <RotateCcw className="h-5 w-5" />
                    </Button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">Completed cycles: {cycles}</div>
            </div>
        </div>
    )
}
