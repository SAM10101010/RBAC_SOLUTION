import { type NextRequest, NextResponse } from "next/server"
import { extractToken, verifyToken } from "@/lib/auth"
import { userHasPermission } from "@/lib/permissions"

export async function POST(request: NextRequest) {
  try {
    const { permission } = await request.json()

    const token = extractToken(request.headers.get("authorization"))

    if (!token) {
      return NextResponse.json({ hasPermission: false }, { status: 401 })
    }

    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json({ hasPermission: false }, { status: 401 })
    }

    const hasPermission = userHasPermission(payload.role, permission)

    return NextResponse.json({
      hasPermission,
      role: payload.role,
      permission,
    })
  } catch {
    return NextResponse.json({ hasPermission: false }, { status: 400 })
  }
}
