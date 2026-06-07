import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import crypto from "crypto"

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "nextauth_dev_fallback_secret_change_me"

export async function POST(req: NextRequest) {
  try {
    const { email, token, password } = await req.json()

    if (!email || !token || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 1. Fetch user from PostgreSQL
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        status: "ACTIVE",
        deletedAt: null,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found or account is inactive" }, { status: 404 })
    }

    // 2. Parse and validate the token
    const parts = token.split("-")
    if (parts.length !== 2) {
      return NextResponse.json({ error: "Invalid reset token format" }, { status: 400 })
    }

    const [hexTokenData, signature] = parts
    let tokenData = ""
    try {
      tokenData = Buffer.from(hexTokenData, "hex").toString("utf-8")
    } catch {
      return NextResponse.json({ error: "Failed to decode reset token" }, { status: 400 })
    }

    const tokenParts = tokenData.split(":")
    if (tokenParts.length !== 2) {
      return NextResponse.json({ error: "Invalid token payload structure" }, { status: 400 })
    }

    const [userId, expiresStr] = tokenParts
    const expires = parseInt(expiresStr, 10)

    if (userId !== user.id) {
      return NextResponse.json({ error: "Reset token does not match this user account" }, { status: 400 })
    }

    // 3. Verify expiration
    if (Date.now() > expires) {
      return NextResponse.json({ error: "Reset token has expired (valid for 1 hour only)" }, { status: 400 })
    }

    // 4. Verify HMAC signature
    const signingSecret = `${AUTH_SECRET}:${user.passwordHash}`
    const hmac = crypto.createHmac("sha256", signingSecret)
    hmac.update(tokenData)
    const computedSignature = hmac.digest("hex")

    if (signature !== computedSignature) {
      return NextResponse.json({ error: "Invalid reset token or signature mismatch. It may have already been used." }, { status: 400 })
    }

    // 5. Update password in PostgreSQL
    const passwordHash = await hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return NextResponse.json({
      ok: true,
      message: "Password reset successfully. You can now log in.",
    })
  } catch (err: unknown) {
    console.error("[reset-password] Error:", err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
