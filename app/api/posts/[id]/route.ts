import { type NextRequest, NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"

const posts = [
  {
    id: "1",
    title: "Getting Started with RBAC",
    content: "Learn the basics of Role-Based Access Control and how it secures your application.",
    authorId: "2",
    authorName: "Editor User",
    status: "published",
    createdAt: "2024-02-15",
    updatedAt: "2024-02-15",
  },
  {
    id: "2",
    title: "Advanced Permission Management",
    content: "Dive deeper into granular permissions and fine-grained access control strategies.",
    authorId: "2",
    authorName: "Editor User",
    status: "published",
    createdAt: "2024-02-20",
    updatedAt: "2024-02-20",
  },
]

async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { title, content, status } = await request.json()
    const user = (request as AuthenticatedRequest).user!

    const postIndex = posts.findIndex((p) => p.id === id)

    if (postIndex === -1) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    const post = posts[postIndex]

    if (user.role === "editor" && post.authorId !== user.userId) {
      return NextResponse.json({ message: "You can only edit your own posts" }, { status: 403 })
    }

    if (user.role === "viewer") {
      return NextResponse.json({ message: "Viewers cannot edit posts" }, { status: 403 })
    }

    posts[postIndex] = {
      ...posts[postIndex],
      title,
      content,
      status,
      updatedAt: new Date().toISOString().split("T")[0],
    }

    return NextResponse.json({ post: posts[postIndex] })
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 })
  }
}

export const PUT_HANDLER = withAuth(PUT, ["editor", "admin"])

export { PUT_HANDLER as PUT }
