import {redirect} from "next/navigation";
import {getUserDetails} from "@/actions/fetchMethods";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";



export default async function Page() {
    const user = await getUserDetails();

    if (!user) return redirect("/login");

    return <div className={"flex flex-col gap-1.5"}>
        <Card className={"bg-gray-700"}>
            <CardHeader>
                <CardTitle className={"flex flex-row gap-5 items-center"}>
                    <p className={"text-3xl text-gray-400"}>Welcome, {user.firstName} {user.lastName}</p>
                </CardTitle>
            </CardHeader>
        </Card>
        <Card  className={"bg-gray-700"}>
            <CardHeader>
                <CardTitle className={"flex flex-row gap-5 items-center"}>
                    User details
                </CardTitle>
            </CardHeader>
            <CardContent>
                <span >Email: {user.email}</span>
            </CardContent>
        </Card>
    </div>;
}