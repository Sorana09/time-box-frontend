'use client'

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {deleteSession} from "@/actions/sessionAction";

export default function Logout() {
    //const{toast} = useToast();
    return <Card>
        <CardHeader>
            <CardTitle className={"flex flex-row gap-5 items-center"}>
                Logout
            </CardTitle>
        </CardHeader>
        <CardContent className={"flex flex-col"}>
            <Button size={"sm"} variant={"outline"} onClick={() => {
                deleteSession();
            }}>Logout</Button>
        </CardContent>
    </Card>
}