import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getAuditLogs, getAuditStats } from "@/lib/audit"

async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")
  const action = url.searchParams.get("action")
  const resource = url.searchParams.get("resource")
  const status = url.searchParams.get("status")
  const fromDate = url.searchParams.get("fromDate")
  const toDate = url.searchParams.get("toDate")
  const includeStats = url.searchParams.get("stats") === "true"

  const logs = getAuditLogs({
    userId: userId || undefined,
    action: action || undefined,
    resource: resource || undefined,
    status: status || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  })

  const response: any = { logs }

  if (includeStats) {
    response.stats = getAuditStats()
  }

  return NextResponse.json(response)
}

export const GET_HANDLER = withAuth(GET, "admin")

export { GET_HANDLER as GET }
