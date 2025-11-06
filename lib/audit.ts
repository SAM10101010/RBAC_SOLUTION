export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  email: string
  action: "CREATE" | "READ" | "UPDATE" | "DELETE"
  resource: "User" | "Post" | "Role" | "Permission"
  resourceId?: string
  resourceName?: string
  status: "success" | "failure"
  statusCode?: number
  ip?: string
  userAgent?: string
  timestamp: string
  details: string
  changes?: Record<string, any>
}

// In-memory audit log storage (in production, use database)
const auditLogs: AuditLogEntry[] = [
  {
    id: "1",
    userId: "1",
    userName: "Admin User",
    email: "admin@example.com",
    action: "CREATE",
    resource: "User",
    resourceId: "2",
    resourceName: "editor@example.com",
    status: "success",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: "Created new user: editor@example.com with role editor",
  },
  {
    id: "2",
    userId: "2",
    userName: "Editor User",
    email: "editor@example.com",
    action: "CREATE",
    resource: "Post",
    resourceId: "1",
    resourceName: "Getting Started with RBAC",
    status: "success",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    details: "Created new post: Getting Started with RBAC",
  },
  {
    id: "3",
    userId: "1",
    userName: "Admin User",
    email: "admin@example.com",
    action: "UPDATE",
    resource: "User",
    resourceId: "3",
    resourceName: "viewer@example.com",
    status: "success",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    details: "Updated user role: viewer@example.com viewer -> editor",
    changes: { role: { from: "viewer", to: "editor" } },
  },
  {
    id: "4",
    userId: "3",
    userName: "Viewer User",
    email: "viewer@example.com",
    action: "READ",
    resource: "Post",
    resourceId: "1",
    resourceName: "Getting Started with RBAC",
    status: "success",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    details: "Viewed post: Getting Started with RBAC",
  },
]

export function logAuditEvent(entry: Omit<AuditLogEntry, "id">): AuditLogEntry {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: String(auditLogs.length + 1),
  }
  auditLogs.push(newEntry)
  return newEntry
}

export function getAuditLogs(filters?: {
  userId?: string
  action?: string
  resource?: string
  status?: string
  fromDate?: string
  toDate?: string
}): AuditLogEntry[] {
  let filtered = [...auditLogs]

  if (filters?.userId) {
    filtered = filtered.filter((log) => log.userId === filters.userId)
  }
  if (filters?.action) {
    filtered = filtered.filter((log) => log.action === filters.action)
  }
  if (filters?.resource) {
    filtered = filtered.filter((log) => log.resource === filters.resource)
  }
  if (filters?.status) {
    filtered = filtered.filter((log) => log.status === filters.status)
  }
  if (filters?.fromDate) {
    filtered = filtered.filter((log) => new Date(log.timestamp) >= new Date(filters.fromDate!))
  }
  if (filters?.toDate) {
    filtered = filtered.filter((log) => new Date(log.timestamp) <= new Date(filters.toDate!))
  }

  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function getAuditStats() {
  return {
    totalLogs: auditLogs.length,
    successCount: auditLogs.filter((log) => log.status === "success").length,
    failureCount: auditLogs.filter((log) => log.status === "failure").length,
    byAction: {
      CREATE: auditLogs.filter((log) => log.action === "CREATE").length,
      READ: auditLogs.filter((log) => log.action === "READ").length,
      UPDATE: auditLogs.filter((log) => log.action === "UPDATE").length,
      DELETE: auditLogs.filter((log) => log.action === "DELETE").length,
    },
    byResource: {
      User: auditLogs.filter((log) => log.resource === "User").length,
      Post: auditLogs.filter((log) => log.resource === "Post").length,
      Role: auditLogs.filter((log) => log.resource === "Role").length,
      Permission: auditLogs.filter((log) => log.resource === "Permission").length,
    },
  }
}
