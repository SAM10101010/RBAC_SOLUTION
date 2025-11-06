"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebar"
import TopBar from "./top-bar"
import AdminPanel from "./panels/admin-panel"
import EditorPanel from "./panels/editor-panel"
import ViewerPanel from "./panels/viewer-panel"
import AuditLogs from "./panels/audit-logs"

interface User {
  id: string
  email: string
  role: "admin" | "editor" | "viewer"
  name: string
}

interface DashboardProps {
  token: string
  setToken: (token: string | null) => void
}

export default function Dashboard({ token, setToken }: DashboardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [activePanel, setActivePanel] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    setToken(null)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const renderPanel = () => {
    switch (activePanel) {
      case "admin":
        return user.role === "admin" ? <AdminPanel token={token} /> : <div>Access Denied</div>
      case "editor":
        return user.role === "admin" || user.role === "editor" ? (
          <EditorPanel token={token} />
        ) : (
          <div>Access Denied</div>
        )
      case "viewer":
        return <ViewerPanel token={token} />
      case "audit":
        return user.role === "admin" ? <AuditLogs token={token} /> : <div>Access Denied</div>
      default:
        return <AdminPanel token={token} />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        userRole={user.role}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col">
        <TopBar user={user} onLogout={handleLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-8">{renderPanel()}</div>
        </main>
      </div>
    </div>
  )
}
