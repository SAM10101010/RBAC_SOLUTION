import { jwtVerify, SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production")

export interface TokenPayload {
  userId: string
  email: string
  role: "admin" | "editor" | "viewer"
  iat?: number
  exp?: number
}

export async function generateToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret)

  return token
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify(token, secret)
    const payload = verified.payload as unknown as TokenPayload
    
    // Validate required fields exist
    if (!payload.userId || !payload.email || !payload.role) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

export function extractToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }
  return authHeader.slice(7)
}

export function hasRole(userRole: string, requiredRole: string | string[]): boolean {
  if (typeof requiredRole === "string") {
    return userRole === requiredRole
  }
  return requiredRole.includes(userRole)
}

export const ROLE_HIERARCHY: Record<string, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

export function hasRoleOrHigher(userRole: string, minimumRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minimumRole] || 0)
}