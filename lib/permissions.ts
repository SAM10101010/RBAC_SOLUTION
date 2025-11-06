export type Permission =
  | "create:content"
  | "read:content"
  | "update:own_content"
  | "update:any_content"
  | "delete:content"
  | "manage:users"
  | "view:audit_logs"

export interface RolePermissions {
  [role: string]: Permission[]
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    "create:content",
    "read:content",
    "update:own_content",
    "update:any_content",
    "delete:content",
    "manage:users",
    "view:audit_logs",
  ],
  editor: ["create:content", "read:content", "update:own_content"],
  viewer: ["read:content"],
}

export interface Permission_DisplayName {
  [key: string]: string
}

export const PERMISSION_DISPLAY_NAMES: Permission_DisplayName = {
  "create:content": "Create Content",
  "read:content": "View Content",
  "update:own_content": "Edit Own Content",
  "update:any_content": "Edit Any Content",
  "delete:content": "Delete Content",
  "manage:users": "Manage Users",
  "view:audit_logs": "View Audit Logs",
}

export function userHasPermission(userRole: string, permission: Permission): boolean {
  const permissions = DEFAULT_ROLE_PERMISSIONS[userRole] || []
  return permissions.includes(permission)
}

export function userHasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  const userPermissions = DEFAULT_ROLE_PERMISSIONS[userRole] || []
  return permissions.some((p) => userPermissions.includes(p))
}

export function userHasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  const userPermissions = DEFAULT_ROLE_PERMISSIONS[userRole] || []
  return permissions.every((p) => userPermissions.includes(p))
}

export function getRolePermissions(role: string): Permission[] {
  return DEFAULT_ROLE_PERMISSIONS[role] || []
}

export function getAllPermissions(): Permission[] {
  return Object.values(PERMISSION_DISPLAY_NAMES).map((_, i) => Object.keys(PERMISSION_DISPLAY_NAMES)[i] as Permission)
}
