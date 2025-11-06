"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AuditLogsProps {
  token: string
}

interface AuditLog {
  id: string
  userId: string
  userName: string
  email: string
  action: string
  resource: string
  resourceName?: string
  status: "success" | "failure"
  timestamp: string
  details: string
  changes?: Record<string, any>
}

interface AuditStats {
  totalLogs: number
  successCount: number
  failureCount: number
  byAction: Record<string, number>
  byResource: Record<string, number>
}

export default function AuditLogs({ token }: AuditLogsProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [resourceFilter, setResourceFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchAuditLogs()
  }, [actionFilter, resourceFilter, statusFilter])

  const fetchAuditLogs = async () => {
    try {
      const url = new URL("/api/audit-logs", window.location.origin)
      if (actionFilter !== "all") url.searchParams.append("action", actionFilter)
      if (resourceFilter !== "all") url.searchParams.append("resource", resourceFilter)
      if (statusFilter !== "all") url.searchParams.append("status", statusFilter)
      url.searchParams.append("stats", "true")

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const colorMap: { [key: string]: string } = {
      CREATE: "bg-green-500/20 text-green-700",
      READ: "bg-blue-500/20 text-blue-700",
      UPDATE: "bg-yellow-500/20 text-yellow-700",
      DELETE: "bg-red-500/20 text-red-700",
    }
    return colorMap[action] || "bg-gray-500/20 text-gray-700"
  }

  const getResourceBadge = (resource: string) => {
    const colorMap: { [key: string]: string } = {
      User: "bg-purple-500/20 text-purple-700",
      Post: "bg-indigo-500/20 text-indigo-700",
      Role: "bg-orange-500/20 text-orange-700",
      Permission: "bg-pink-500/20 text-pink-700",
    }
    return colorMap[resource] || "bg-gray-500/20 text-gray-700"
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const chartData = stats
    ? [
        { name: "CREATE", count: stats.byAction.CREATE || 0 },
        { name: "READ", count: stats.byAction.READ || 0 },
        { name: "UPDATE", count: stats.byAction.UPDATE || 0 },
        { name: "DELETE", count: stats.byAction.DELETE || 0 },
      ]
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">Track all system activities and changes</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.totalLogs}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Events</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.successCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Successful</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.failureCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Failed</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.successCount > 0 ? Math.round((stats.successCount / stats.totalLogs) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {chartData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Activity by Action Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>System Activity Log</CardTitle>
          <CardDescription>Complete log of all user actions and system events</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, email, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="READ">Read</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
              </select>

              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="all">All Resources</option>
                <option value="User">Users</option>
                <option value="Post">Posts</option>
                <option value="Role">Roles</option>
                <option value="Permission">Permissions</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>

              <Button variant="outline" size="sm" className="ml-auto gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {logs.length === 0 ? "No audit logs yet." : "No logs match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-border">
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{log.userName}</div>
                          <div className="text-xs text-muted-foreground">{log.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadge(log.action)}>{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getResourceBadge(log.resource)}>{log.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.status === "success" ? "default" : "destructive"} className="capitalize">
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
