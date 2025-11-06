import { type NextRequest, NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"

// Demo posts data
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
  {
    id: "3",
    title: "Draft Post - Admin",
    content: "This is a draft post visible only to admins and the author.",
    authorId: "1",
    authorName: "Admin User",
    status: "draft",
    createdAt: "2024-02-25",
    updatedAt: "2024-02-25",
  },
]

async function GET(request: NextRequest) {
  const user = (request as AuthenticatedRequest).user!

  const url = new URL(request.url)
  const status = url.searchParams.get("status")
  const authorId = url.searchParams.get("authorId")

  let filtered = [...posts]

  if (user.role === "viewer") {
    // Viewers can only see published posts
    filtered = filtered.filter((p) => p.status === "published")
  } else if (user.role === "editor") {
    // Editors see their own posts (any status) + all published posts
    filtered = filtered.filter((p) => p.status === "published" || p.authorId === user.userId)
  }
  // Admins see all posts

  // Apply additional filters
  if (status) {
    filtered = filtered.filter((p) => p.status === status)
  }
  if (authorId) {
    filtered = filtered.filter((p) => p.authorId === authorId)
  }

  return NextResponse.json({ posts: filtered })
}

async function POST(request: NextRequest) {
  try {
    const { title, content, status } = await request.json()
    const user = (request as AuthenticatedRequest).user!

    // Editors and admins can create posts
    if (user.role === "viewer") {
      return NextResponse.json({ message: "Viewers cannot create posts" }, { status: 403 })
    }

    const newPost = {
      id: String(posts.length + 1),
      title,
      content,
      authorId: user.userId,
      authorName: user.email,
      status,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    posts.push(newPost)
    return NextResponse.json({ post: newPost })
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 })
  }
}

export const GET_HANDLER = withAuth(GET)
export const POST_HANDLER = withAuth(POST, ["editor", "admin"])

export { GET_HANDLER as GET, POST_HANDLER as POST }
