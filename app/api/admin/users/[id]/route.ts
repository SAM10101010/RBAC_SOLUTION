import { type NextRequest, NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"

const users = [
  { id: "1", email: "admin@example.com", name: "Admin User", role: "admin", createdAt: "2024-01-15" },
  { id: "2", email: "editor@example.com", name: "Editor User", role: "editor", createdAt: "2024-01-20" },
  { id: "3", email: "viewer@example.com", name: "Viewer User", role: "viewer", createdAt: "2024-02-01" },
]

async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = users.find((u) => u.id === id)

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ user })
}

async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { name, email, role } = await request.json()
    const user = (request as AuthenticatedRequest).user!

    const userIndex = users.findIndex((u) => u.id === id)

    if (userIndex === -1) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ message: "Only admins can update users" }, { status: 403 })
    }

    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      role: role || users[userIndex].role,
    }

    return NextResponse.json({ user: users[userIndex] })
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 })
  }
}

async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = (request as AuthenticatedRequest).user!

  if (user.role !== "admin") {
    return NextResponse.json({ message: "Only admins can delete users" }, { status: 403 })
  }

  if (user.userId === id) {
    return NextResponse.json({ message: "Cannot delete your own account" }, { status: 400 })
  }

  const userIndex = users.findIndex((u) => u.id === id)

  if (userIndex === -1) {
    return NextResponse.json({ message: "User not found" }, { status: 404 })
  }

  users.splice(userIndex, 1)

  return NextResponse.json({ message: "User deleted successfully" })
}

export const GET_HANDLER = withAuth(GET, "admin")
export const PUT_HANDLER = withAuth(PUT, "admin")
export const DELETE_HANDLER = withAuth(DELETE, "admin")

export { GET_HANDLER as GET, PUT_HANDLER as PUT, DELETE_HANDLER as DELETE }
