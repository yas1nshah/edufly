import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"



const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
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
  )
}

export default DashboardLayout
