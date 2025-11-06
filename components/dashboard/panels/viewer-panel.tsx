"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ViewerPanelProps {
  token: string
}

interface Post {
  id: string
  title: string
  content: string
  authorName: string
  status: string
  createdAt: string
}

export default function ViewerPanel({ token }: ViewerPanelProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchPublishedPosts()
  }, [])

  const fetchPublishedPosts = async () => {
    try {
      const response = await fetch("/api/posts?status=published", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      } else {
        setErrorMessage("Failed to fetch content")
      }
    } catch (error) {
      setErrorMessage("An error occurred while fetching content")
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Content Library</h1>
        <p className="text-muted-foreground mt-2">Browse and read published articles</p>
      </div>

      {errorMessage && (
        <Alert className="bg-red-500/10 border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {selectedPost ? (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{selectedPost.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="bg-green-500/20 text-green-700">
                    Published
                  </Badge>
                  <span className="text-sm text-muted-foreground">by {selectedPost.authorName}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedPost.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none"
              >
                ✕
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">{selectedPost.content}</p>
            </div>
            <div className="pt-4 border-t border-border">
              <button onClick={() => setSelectedPost(null)} className="text-sm text-primary hover:underline">
                ← Back to Library
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Published Articles</CardTitle>
            <CardDescription>Read articles shared with you</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading articles...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No published articles available yet.</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No articles match your search.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id} className="border-border hover:bg-accent/50">
                        <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{post.authorName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => setSelectedPost(post)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Read
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Access Level Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-sm text-green-700">
              As a Viewer, you have access to all published articles. You cannot create, edit, or delete content.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
