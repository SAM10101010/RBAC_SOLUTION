import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_DISPLAY_NAMES } from "@/lib/permissions"

async function GET(request: NextRequest) {
  const permissions = Object.entries(DEFAULT_ROLE_PERMISSIONS).reduce(
    (acc, [role, perms]) => {
      acc[role] = perms.map((perm) => ({
        id: perm,
        name: PERMISSION_DISPLAY_NAMES[perm],
      }))
      return acc
    },
    {} as Record<string, Array<{ id: string; name: string }>>,
  )

  const allPermissions = Object.values(PERMISSION_DISPLAY_NAMES).map((name, i) => ({
    id: Object.keys(PERMISSION_DISPLAY_NAMES)[i],
    name,
  }))

  return NextResponse.json({
    matrix: permissions,
    allPermissions,
    roles: Object.keys(DEFAULT_ROLE_PERMISSIONS),
  })
}

export const GET_HANDLER = withAuth(GET, "admin")

export { GET_HANDLER as GET }
