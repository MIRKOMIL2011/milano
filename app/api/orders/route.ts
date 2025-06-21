import { type NextRequest, NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

type LineItem = { id: number; quantity: number; price: number }
type Order = {
  id: number
  user_id: number | null
  total_amount: number
  status: string
  delivery_address: string
  latitude?: number | null
  longitude?: number | null
  phone: string
  notes?: string | null
  payment_method: string
  created_at: string
  items: LineItem[]
}

/* -------- In-memory demo store (only when DATABASE_URL is missing) -------- */
const demoOrders: Order[] = []
let demoId = 1

/* -------------------------------------------------------------------------- */
/* POST  – Create order                                                       */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  const { userId, items, totalAmount, deliveryAddress, latitude, longitude, phone, notes, paymentMethod } =
    await req.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Order items are required" }, { status: 400 })
  }

  /* ---------- DEMO MODE (no DATABASE_URL) ---------- */
  if (!hasDb) {
    const order: Order = {
      id: demoId++,
      user_id: userId ?? null,
      total_amount: totalAmount,
      status: "pending",
      delivery_address: deliveryAddress,
      latitude,
      longitude,
      phone,
      notes,
      payment_method: paymentMethod,
      created_at: new Date().toISOString(),
      items,
    }
    demoOrders.unshift(order)
    return NextResponse.json({ success: true, order })
  }

  /* ---------- REAL DATABASE FLOW ---------- */
  try {
    const inserted = await sql`
      INSERT INTO orders
        (user_id,total_amount,delivery_address,latitude,longitude,phone,notes,payment_method)
      VALUES
        (${userId ?? null},${totalAmount},${deliveryAddress},${latitude ?? null},
         ${longitude ?? null},${phone},${notes ?? null},${paymentMethod})
      RETURNING *
    `

    // neon returns rows in different shapes depending on client; normalise:
    const orderRow: any = Array.isArray(inserted) ? inserted[0] : (inserted as { rows: any[] }).rows?.[0]

    if (!orderRow) {
      throw new Error("Failed to retrieve created order")
    }

    // Insert order items
    for (const it of items as LineItem[]) {
      await sql`
        INSERT INTO order_items (order_id,menu_item_id,quantity,price)
        VALUES (${orderRow.id},${it.id},${it.quantity},${it.price})
      `
    }

    return NextResponse.json({ success: true, order: orderRow })
  } catch (err) {
    console.error("DB error (create order):", (err as Error).message)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

/* -------------------------------------------------------------------------- */
/* GET – return orders (all or by user)                                       */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  /* ---------- DEMO MODE ---------- */
  if (!hasDb) {
    const list = userId ? demoOrders.filter((o) => String(o.user_id) === userId) : demoOrders
    return NextResponse.json({ orders: list })
  }

  /* ---------- REAL DATABASE FLOW ---------- */
  try {
    const rows =
      userId !== null
        ? await sql`
            SELECT
              o.*,
              json_agg(
                json_build_object(
                  'id',oi.id,
                  'menu_item_id',oi.menu_item_id,
                  'quantity',oi.quantity,
                  'price',oi.price
                )
              ) AS items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ${userId}
            GROUP BY o.id
            ORDER BY o.created_at DESC
          `
        : await sql`
            SELECT
              o.*,
              json_agg(
                json_build_object(
                  'id',oi.id,
                  'menu_item_id',oi.menu_item_id,
                  'quantity',oi.quantity,
                  'price',oi.price
                )
              ) AS items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
          `

    return NextResponse.json({ orders: Array.isArray(rows) ? rows : (rows as any).rows })
  } catch (err) {
    console.error("DB error (fetch orders):", (err as Error).message)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
