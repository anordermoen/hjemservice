"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        const handleLogout = async () => {
            await signOut({ redirect: false });
            await signOut({ redirect: false });
            window.location.href = "/";
        };

        handleLogout();
    }, [router]);

    return (
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
            <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Logger ut...</p>
            </div>
        </div>
    );
}
