import {Inter} from "next/font/google";
import "./globals.css";
import Link from "next/link";
import React from "react";

const inter = Inter({subsets: ["latin"]});

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className + " dark"}>
        <div className={"flex flex-row gap-2"}>
            <Link href={"/"}>Home</Link>
            <Link href={"/login"}>Login</Link>
            <Link href={"/dashboard"}>Dashboard</Link>
        </div>
        <main className={"mt-10 max-w-[1200px] px-7 mr-auto ml-auto"}>
            {children}
        </main>
        </body>
        </html>
    );
}
