"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import {register} from "@/actions/loginActions";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

export default function RegisterForm(props: { onRegister: Function }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  function registerButton() {
    const result = registerSchema.safeParse({ email, password, firstName, lastName });

    if (!result.success) {
      const formattedErrors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

    // Clear errors and proceed with registration
    setErrors({});
    register(email, password, firstName, lastName).then(() => props.onRegister());
  }

  return (
      <div className="flex flex-col gap-1.5">
        <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <Input placeholder="Password" onChange={(e) => setPassword(e.target.value)} type="password" />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

        <Input placeholder="First name" onChange={(e) => setFirstName(e.target.value)} />
        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}

        <Input placeholder="Last name" onChange={(e) => setLastName(e.target.value)} />
        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}

        <Button onClick={registerButton}>Register</Button>
      </div>
  );
}
