'use client';

import { Button } from '@/components/ui/button'; // Shadcn UI Button
import { Card, CardContent } from '@/components/ui/card'; // Shadcn UI Card
import { useRouter } from 'next/navigation'; // Correct import from next/navigation
import Link from 'next/link'; // Import Link for navigation

export default function Home() {
  const router = useRouter(); // Using the correct router from next/navigation

  const handleNavigate = (path: string) => {
    router.push(path); // Handle navigation
  };

  return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col justify-center items-center py-10 px-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Welcome to TimeBox
          </h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-300">
            Efficiently manage your subjects, sessions, and track your progress.
          </p>
        </header>

        {/* Card Container for Main Action */}
        <div className="w-full max-w-lg space-y-6">
          <Card className="shadow-lg dark:shadow-xl transition-all duration-300 ease-in-out">
            <CardContent>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 text-center">
                Ready to Start?
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 text-center">
                Start managing your subjects and track your sessions with ease.
              </p>
              <div className="mt-6 text-center">
                <Button
                    onClick={() => handleNavigate('/dashboard')}
                    className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-3 rounded-md"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-100 dark:bg-gray-800 shadow-md p-6 text-center">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <Link href="/login" className="hover:underline text-blue-500">
                Login
              </Link>
            </div>
          </Card>
        </div>
      </div>
  );
}
