import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth"

// Demo users database (in production, use real database)
const DEMO_USERS = [
  {
    id: "1",
    email: "admin@example.com",
    password: "password",
    name: "Admin User",
    role: "admin" as const,
  },
  {
    id: "2",
    email: "editor@example.com",
    password: "password",
    name: "Editor User",
    role: "editor" as const,
  },
  {
    id: "3",
    email: "viewer@example.com",
    password: "password",
    name: "Viewer User",
    role: "viewer" as const,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = DEMO_USERS.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 })
  }
}
