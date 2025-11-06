import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"

// Demo data storage
const users = [
  { id: "1", email: "admin@example.com", name: "Admin User", role: "admin", createdAt: "2024-01-15" },
  { id: "2", email: "editor@example.com", name: "Editor User", role: "editor", createdAt: "2024-01-20" },
  { id: "3", email: "viewer@example.com", name: "Viewer User", role: "viewer", createdAt: "2024-02-01" },
]

async function GET(request: NextRequest) {
  return NextResponse.json({ users })
}

async function POST(request: NextRequest) {
  try {
    const { email, name, password, role } = await request.json()

    const newUser = {
      id: String(users.length + 1),
      email,
      name,
      role,
      createdAt: new Date().toISOString().split("T")[0],
    }

    users.push(newUser)
    return NextResponse.json({ user: newUser })
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 })
  }
}

export const GET_HANDLER = withAuth(GET, "admin")
export const POST_HANDLER = withAuth(POST, "admin")

export { GET_HANDLER as GET, POST_HANDLER as POST }
