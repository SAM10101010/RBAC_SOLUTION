import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth"
import { query } from "@/lib/db-postgres"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user in database
    const result = await query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password])
    const user = result.rows[0]

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = await generateToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectTo: "/" // Always redirect to home page which handles role-based rendering
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: "Invalid request" }, { status: 400 })
  }
}