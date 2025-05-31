import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui"



const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
    <RedirectToSignIn />
    <SignedIn>

    <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties
    }
    >
        <AppSidebar variant="inset" />
        <SidebarInset>
            {children}
      </SidebarInset>
      
    </SidebarProvider>
    </SignedIn>
      </>
  )
}

export default DashboardLayout
