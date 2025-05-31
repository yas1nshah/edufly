import React from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ChangeEmailCard, ChangePasswordCard, DeleteAccountCard, PasskeysCard, ProvidersCard, SessionsCard, TwoFactorCard, UpdateAvatarCard } from "@daveyplate/better-auth-ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from '@/components/site-header'


const SettingsPage = async () => {
  
  return (
    <main>
        <SiteHeader title="Settings" /> 
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mx-auto max-w-3xl mt-4">
            {/* Can you add interesting patterns here? random patterns, patterns that are related to the current page, etc. */}


            {/* in the box above */}
          

            <Tabs defaultValue="account" className="w-full">
            <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className='w-full space-y-4'>
                <UpdateAvatarCard />
                <ChangeEmailCard />
                <SessionsCard />
                
            </TabsContent>

            <TabsContent value="security" className='w-full space-y-4'>
                <ChangePasswordCard />    
                <ProvidersCard />
                <DeleteAccountCard />
            </TabsContent>
                        
            </Tabs>


          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
    </main>
  )
}

export default SettingsPage