

import LoginAndRegistrationForm from "@/components/usercomp/loginAndRegistration/LoginAndRegistrationForm";
import {redirect} from "next/navigation";
import {getUserDetails} from "@/actions/fetchMethods";

export default async function Page() {
    const user = await getUserDetails();
    console.log(user);
    if (!user) return <LoginAndRegistrationForm/>;

    redirect("/account");
}