// 'use client'
// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
//
// const PomodoroTimer = () => {
//     const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
//     const [isRunning, setIsRunning] = useState(false);
//
//     useEffect(() => {
//         let timer;
//         if (isRunning && timeLeft > 0) {
//             timer = setInterval(() => {
//                 setTimeLeft((prev) => prev - 1);
//             }, 1000);
//         } else {
//             clearInterval(timer);
//         }
//         return () => clearInterval(timer);
//     }, [isRunning, timeLeft]);
//
//     const formatTime = (seconds) => {
//         const m = Math.floor(seconds / 60)
//             .toString()
//             .padStart(2, "0");
//         const s = (seconds % 60).toString().padStart(2, "0");
//         return `${m}:${s}`;
//     };
//
//     const handleStartPause = () => {
//         setIsRunning((prev) => !prev);
//     };
//
//     const handleReset = () => {
//         setIsRunning(false);
//         setTimeLeft(25 * 60);
//     };
//
//     return (
//         <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
//         <h1 className="text-4xl font-bold mb-8">Pomodoro Timer</h1>
//     <div className="text-6xl font-mono mb-8">{formatTime(timeLeft)}</div>
//         <div className="space-x-4">
//     <Button onClick={handleStartPause} className="text-xl">
//         {isRunning ? "Pause" : "Start"}
//         </Button>
//         <Button onClick={handleReset} className="text-xl" variant="outline">
//         Reset
//         </Button>
//         </div>
//         </div>
// );
// };
//
// export default PomodoroTimer;
