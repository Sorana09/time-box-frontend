"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col justify-center items-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-10">
          {/* Logo and Header */}
          <div className="space-y-4">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-white dark:text-black"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-center tracking-tight">TimeBox</h1>
            <p className="text-base text-gray-600 dark:text-gray-400 text-center max-w-sm mx-auto">
              Track your time, improve your productivity
            </p>
          </div>

          {/* Main Card */}
          <Card className="border-0 shadow-sm dark:shadow-md bg-gray-50 dark:bg-gray-900">
            <CardContent className="p-6">
              <div className="space-y-6">
                <Button
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white h-12 rounded-md transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="flex items-center justify-center">
                  <div className="h-px bg-gray-200 dark:bg-gray-800 w-full" />
                  <span className="px-4 text-xs text-gray-500 dark:text-gray-400">or</span>
                  <div className="h-px bg-gray-200 dark:bg-gray-800 w-full" />
                </div>

                <Link
                    href="/login"
                    className="block text-center text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  Sign in to your account
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} TimeBox. All rights reserved.
          </p>
        </div>
      </div>
  )
}
