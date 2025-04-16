"use client";


import {useState} from "react";
import LoginForm from "@/components/usercomp/loginAndRegistration/LoginForm";
import RegisterForm from "@/components/usercomp/loginAndRegistration/RegisterForm";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export default function LoginAndRegistrationForm() {
  const [tab, setTab] = useState("login");

  return <Tabs value={tab} onValueChange={setTab}>
    <TabsList>
      <TabsTrigger value="login">Login</TabsTrigger>
      <TabsTrigger value="register">Register</TabsTrigger>
    </TabsList>
    <TabsContent value="login"><LoginForm/></TabsContent>
    <TabsContent value="register"><RegisterForm onRegister={() => setTab("login")}/></TabsContent>
  </Tabs>
}