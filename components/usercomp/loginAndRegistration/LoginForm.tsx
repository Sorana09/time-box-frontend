"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {login} from "@/actions/loginActions";
import{z} from "zod";
import {Input} from "@/components/ui/input";


const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  hashed_password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [hashed_password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  function handleLogin() {
    const result = loginSchema.safeParse({ email, hashed_password });

    if (!result.success) {
      const formattedErrors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

    // Clear errors and proceed with login
    setErrors({});
    login(email, hashed_password);
  }

  return (
      <div className="flex flex-col gap-1.5">
        <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <Input placeholder="Password" onChange={(e) => setPassword(e.target.value)} type="password" />
        {errors.hashed_password && <p className="text-red-500 text-sm">{errors.hashed_password}</p>}

        <Button onClick={handleLogin}>Login</Button>
      </div>
  );
}
