import { type NextRequest, NextResponse } from "next/server"
import { extractToken, verifyToken } from "./auth"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: "admin" | "editor" | "viewer"
  }
}

export async function authenticateRequest(
  request: NextRequest,
): Promise<{ user: AuthenticatedRequest["user"]; error: null } | { user: null; error: NextResponse }> {
  const token = extractToken(request.headers.get("authorization"))

  if (!token) {
    return {
      user: null,
      error: NextResponse.json({ message: "Missing authorization token" }, { status: 401 }),
    }
  }

  const payload = await verifyToken(token)

  if (!payload) {
    return {
      user: null,
      error: NextResponse.json({ message: "Invalid or expired token" }, { status: 401 }),
    }
  }

  return {
    user: {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    error: null,
  }
}

export function requireRole(userRole: string, requiredRoles: string | string[]): NextResponse | null {
  const roles = typeof requiredRoles === "string" ? [requiredRoles] : requiredRoles

  if (!roles.includes(userRole)) {
    return NextResponse.json({ message: "Insufficient permissions for this action" }, { status: 403 })
  }

  return null
}

export function withAuth<T extends (request: NextRequest, ...args: any[]) => Promise<NextResponse>>(
  handler: T,
  requiredRoles?: string | string[],
): (request: NextRequest, ...args: Parameters<T>) => Promise<NextResponse> {
  return async (request: NextRequest, ...args: Parameters<T>) => {
    const auth = await authenticateRequest(request)

    if (auth.error) {
      return auth.error
    }

    if (requiredRoles) {
      const roleError = requireRole(auth.user!.role, requiredRoles)
      if (roleError) {
        return roleError
      }
    }
    // Attach user to request-like object for handler access
    ;(request as AuthenticatedRequest).user = auth.user

    return handler(request, ...args)
  }
}
