"use client"

import { LayoutDashboard, Users, FileText, BarChart3, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activePanel: string
  setActivePanel: (panel: string) => void
  userRole: string
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Sidebar({ activePanel, setActivePanel, userRole, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, roles: ["admin", "editor", "viewer"] },
    { id: "admin", label: "Admin Panel", icon: Users, roles: ["admin"] },
    { id: "editor", label: "Editor Panel", icon: FileText, roles: ["admin", "editor"] },
    { id: "viewer", label: "Viewer Panel", icon: BarChart3, roles: ["admin", "editor", "viewer"] },
    { id: "audit", label: "Audit Logs", icon: LogOut, roles: ["admin"] },
  ]

  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(userRole))

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {sidebarOpen && <span className="font-bold text-lg text-sidebar-foreground">RBAC</span>}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = activePanel === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          className="w-full justify-center bg-transparent"
          onClick={() => {
            localStorage.removeItem("authToken")
            location.reload()
          }}
        >
          {sidebarOpen ? "Logout" : "←"}
        </Button>
      </div>
    </div>
  )
}
