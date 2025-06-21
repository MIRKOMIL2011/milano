import { type NextRequest, NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await request.json()
  const orderId = Number.parseInt(params.id)

  if (!hasDb) {
    // For demo mode, just return success
    return NextResponse.json({ success: true })
  }

  try {
    await sql`
      UPDATE orders 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${orderId}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
