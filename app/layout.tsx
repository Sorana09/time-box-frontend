"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
                                         children,
                                     }: {
    children: React.ReactNode
}) {
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Check if the user's preference is saved in localStorage
    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem("theme")
        if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            setIsDarkMode(true)
            document.documentElement.classList.add("dark")
        } else {
            setIsDarkMode(false)
            document.documentElement.classList.remove("dark")
        }
    }, [])

    // Toggle theme
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode)
        if (isDarkMode) {
            document.documentElement.classList.remove("dark")
            localStorage.setItem("theme", "light")
        } else {
            document.documentElement.classList.add("dark")
            localStorage.setItem("theme", "dark")
        }
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <html lang="en">
            <body className={inter.className}>
            <div className="min-h-screen"></div>
            </body>
            </html>
        )
    }

    return (
        <html lang="en">
        <body
            className={`${inter.className} min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300`}
        >
        {/* Minimalist Header */}
        <header className="fixed top-0 left-0 right-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
                <Link href="/" className="text-lg font-medium">
                    TimeBox
                </Link>

                <div className="flex items-center gap-6">
                    <nav className="hidden sm:flex items-center space-x-6">
                        <Link
                            href="/"
                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                        >
                            Dashboard
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                        >
                            Login
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-full w-8 h-8 flex items-center justify-center"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </header>

        {/* Main Content with padding for fixed header */}
        <main className="pt-16 min-h-screen">{children}</main>
        </body>
        </html>
    )
}
