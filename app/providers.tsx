"use client"
 
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
 
import { authClient } from "@/lib/auth-client"
import { getQueryClient } from "@/lib/get-query-client"
import { QueryClientProvider } from "@tanstack/react-query"
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack"
import { ThemeProvider } from 'next-themes'


 
export function Providers({ children }: { children: ReactNode }) {
    const router = useRouter()
    const queryClient = getQueryClient()
 
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider 
                attribute="class"
                defaultTheme="system"
                enableSystem={true}
            >


            <AuthUIProviderTanstack
                authClient={authClient}
                navigate={router.push}
                replace={router.replace}
                onSessionChange={() => {
                    // Clear router cache (protected routes)
                    router.refresh()
                    queryClient.clear()
                }}
                Link={Link}
                persistClient={true}
                providers={['google','github']}
                >
                {children}
            </AuthUIProviderTanstack>
            </ThemeProvider>
        </QueryClientProvider>
    )
}