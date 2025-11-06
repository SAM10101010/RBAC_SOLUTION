"use client"

import { useState, useEffect } from "react"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"
import Dashboard from "@/components/dashboard/dashboard"
// Removed database initialization from client component

export default function Home() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    // Removed database initialization from client component
    // This should be handled on the server side
    
    const savedToken = localStorage.getItem("authToken")
    if (savedToken) {
      setToken(savedToken)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          <p className="mt-4 text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (token) {
    return <Dashboard token={token} setToken={setToken} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {showSignup ? (
        <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
      ) : (
        <LoginForm onSwitchToSignup={() => setShowSignup(true)} onSuccess={setToken} />
      )}
    </div>
  )
}