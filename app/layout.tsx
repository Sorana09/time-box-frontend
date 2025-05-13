'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// Import Lucide Icons
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon } from "lucide-react"; // Directly importing Lucide icons

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Check if the user's preference is saved in localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        }
    }, []);

    // Toggle theme
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }
    };

    return (
        <html lang="en">
        <body className={`${inter.className} min-h-screen bg-background text-foreground transition-all duration-300`}>
        {/* Header Navigation */}
        <header className="w-full border-b bg-card shadow-sm dark:bg-black dark:text-white">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-semibold">Study Tracker</h1>
                <nav className="flex gap-4">
                    <Link href="/" passHref>
                        <Button variant="ghost">Home</Button>
                    </Link>
                    <Link href="/login" passHref>
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Link href="/dashboard" passHref>
                        <Button variant="default">Dashboard</Button>
                    </Link>
                </nav>
                <Button variant="ghost" onClick={toggleTheme}>
                    {isDarkMode ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </Button>
            </div>
        </header>

        {/* Separator for clear division */}
        <Separator className="my-4" />

        {/* Main Content */}
        <main className="">
            {children}
        </main>
        </body>
        </html>
    );
}
