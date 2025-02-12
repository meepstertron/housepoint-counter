'use client'

import * as React from 'react'
import { Home, Settings, BookMarked, HelpCircle, LogOut, Info, Shield, Archive } from 'lucide-react'
import useToken from './useToken'
import { getCurrentUser, isAdmin } from '@/lib/api'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export default function CustomSidebar() {
  const { resetToken, token } = useToken();
  const [user, setUser] = React.useState<{ name: string; email: string } | null>(null);
  const [isAdminUser, setIsAdminUser] = React.useState<boolean>(false);

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
        const adminStatus = await isAdmin(token);
        setIsAdminUser(adminStatus);
      } catch (error) {
        console.error("Failed to fetch user", error);
        handleLogout();
      }
    }
    if (token) {
      fetchUser();
    }
  }, [token]);

  const handleLogout = () => {
    resetToken();
    window.location.href = '/';
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/students">
                  <BookMarked className="h-4 w-4" />
                  <span>Students</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/archive">
                  <Archive className="h-4 w-4" />
                  <span>Archive</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/help">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAdminUser && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin">
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <Button className="mt-5"  variant="default" asChild>
              <a href="/award">Award Housepoints</a>
            </Button>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user ? `@${user.name}` : "@username"} />
                      <AvatarFallback>{user ? user.name.slice(0, 2).toUpperCase() : "UN"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user ? user.name : "Username"}</span>
                      <span className="text-xs text-muted-foreground">{user ? user.email : "user@example.com"}</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <a href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hidden" asChild>
                    <a href="/about">
                      <Info className="mr-2 h-4 w-4" />
                      <span>About</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}