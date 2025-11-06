import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db-postgres"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, role } = await request.json()

    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email])
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Create new user
    const result = await query(
      'INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, name, password, role]
    )

    const user = result.rows[0]

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
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ message: "Invalid request" }, { status: 400 })
  }
}