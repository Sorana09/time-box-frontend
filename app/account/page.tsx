import { redirect } from "next/navigation";
import { getUserDetails } from "@/actions/fetchMethods";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page() {
    const user = await getUserDetails();

    if (!user) return redirect("/login");

    return (
        <div className="flex flex-col gap-6 p-8 min-h-screen bg-gray-50 dark:bg-black">
            {/* Welcome Card */}
            <Card className="bg-white dark:bg-black shadow-lg dark:shadow-black rounded-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Welcome, {user.firstName} {user.lastName}
                    </CardTitle>
                </CardHeader>
            </Card>

            {/* User Details Card */}
            <Card className="bg-white dark:bg-black shadow-md border border-gray-200 dark:border-black rounded-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-gray-800 dark:text-white font-semibold">
                        User Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700 dark:text-gray-300 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-200">Email:</span>
                        <span className="text-gray-800 dark:text-gray-200">{user.email}</span>
                    </div>
                    {/* Additional user details can be added here */}
                </CardContent>
            </Card>
        </div>
    );
}
