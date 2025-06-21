import { NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

const demoCategories = [
  { id: 1, name_uz: "Burgerlar", name_ru: "Бургеры", name_en: "Burgers" },
  { id: 2, name_uz: "Pitsalar", name_ru: "Пиццы", name_en: "Pizzas" },
]

/**
 * GET /api/categories – returns menu categories.
 * Provides demo categories when the DB is unavailable.
 */
export async function GET() {
  if (!hasDb) {
    return NextResponse.json({ categories: demoCategories })
  }

  try {
    const rows = await sql`SELECT * FROM categories ORDER BY id`
    return NextResponse.json({ categories: rows })
  } catch (err) {
    console.error("DB error in /api/categories:", (err as Error).message)
    return NextResponse.json({ categories: demoCategories })
  }
}
