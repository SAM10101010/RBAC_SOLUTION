"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, ChevronDown, AlertCircle, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminPanelProps {
  token: string
}

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "editor" | "viewer"
  createdAt: string
}

interface Role {
  id: string
  name: string
  permissions: string[]
  userCount: number
  createdAt: string
}

export default function AdminPanel({ token }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "viewer" as "admin" | "editor" | "viewer",
  })

  const [roles, setRoles] = useState<Role[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(true)

  useEffect(() => {
    fetchUsers()
    fetchPermissionMatrix()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      setErrorMessage("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissionMatrix = async () => {
    try {
      const response = await fetch("/api/permissions/matrix", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        // Transform API response to role format
        const transformedRoles: Role[] = data.roles.map((roleName: string) => ({
          id: roleName,
          name: roleName.charAt(0).toUpperCase() + roleName.slice(1),
          permissions: data.matrix[roleName].map((p: any) => p.name),
          userCount: users.filter((u) => u.role === roleName).length,
          createdAt: "2024-01-01",
        }))
        setRoles(transformedRoles)
      }
    } catch (error) {
      console.error("Failed to fetch permission matrix")
    } finally {
      setLoadingPermissions(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setUsers([...users, data.user])
        setFormData({ email: "", name: "", password: "", role: "viewer" })
        setShowUserForm(false)
        setSuccessMessage("User created successfully")
        setTimeout(() => setSuccessMessage(null), 3000)
        fetchPermissionMatrix()
      } else {
        setErrorMessage("Failed to create user")
      }
    } catch (error) {
      setErrorMessage("An error occurred while creating user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          setUsers(users.filter((u) => u.id !== userId))
          setSuccessMessage("User deleted successfully")
          setTimeout(() => setSuccessMessage(null), 3000)
          fetchPermissionMatrix()
        } else {
          const data = await response.json()
          setErrorMessage(data.message || "Failed to delete user")
        }
      } catch (error) {
        setErrorMessage("An error occurred while deleting user")
      }
    }
  }

  const handleUpdateUser = async (userId: string, updatedData: Partial<User>) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(users.map((u) => (u.id === userId ? data.user : u)))
        setSuccessMessage("User updated successfully")
        setTimeout(() => setSuccessMessage(null), 3000)
        fetchPermissionMatrix()
      } else {
        setErrorMessage("Failed to update user")
      }
    } catch (error) {
      setErrorMessage("An error occurred while updating user")
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "editor":
        return "default"
      default:
        return "secondary"
    }
  }

  const getRoleBgColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10"
      case "editor":
        return "bg-blue-500/10"
      case "viewer":
        return "bg-green-500/10"
      default:
        return "bg-gray-500/10"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage users, roles, and permissions</p>
        </div>
      </div>

      {successMessage && (
        <Alert className="bg-green-500/10 border-green-500/30">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="bg-red-500/10 border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{users.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Users</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{roles.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Active Roles</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{users.filter((u) => u.role === "admin").length}</div>
              <div className="text-sm text-muted-foreground mt-1">Administrators</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Create and manage system users</CardDescription>
          </div>
          <Button onClick={() => setShowUserForm(!showUserForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </CardHeader>

        {showUserForm && (
          <CardContent className="border-t border-border pt-6">
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "admin" | "editor" | "viewer",
                      })
                    }
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                    required
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create User</Button>
                <Button type="button" variant="outline" onClick={() => setShowUserForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}

        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className={`border-border ${getRoleBgColor(user.role)}`}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Configure roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPermissions ? (
            <div className="text-center py-8 text-muted-foreground">Loading roles...</div>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 rounded-lg border border-border ${getRoleBgColor(role.id)} space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{role.name}</h4>
                      <p className="text-sm text-muted-foreground">{role.userCount} users</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Edit
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>Role-based permissions overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Action</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-center">Editor</TableHead>
                  <TableHead className="text-center">Viewer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { action: "Create Content", admin: true, editor: true, viewer: false },
                  { action: "Edit Own Content", admin: true, editor: true, viewer: false },
                  { action: "Edit Any Content", admin: true, editor: false, viewer: false },
                  { action: "Delete Content", admin: true, editor: false, viewer: false },
                  { action: "View Content", admin: true, editor: true, viewer: true },
                  { action: "Manage Users", admin: true, editor: false, viewer: false },
                  { action: "View Audit Logs", admin: true, editor: false, viewer: false },
                ].map((row) => (
                  <TableRow key={row.action} className="border-border">
                    <TableCell className="font-medium">{row.action}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.admin ? "default" : "secondary"}>{row.admin ? "✓" : "✗"}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.editor ? "default" : "secondary"}>{row.editor ? "✓" : "✗"}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.viewer ? "default" : "secondary"}>{row.viewer ? "✓" : "✗"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
