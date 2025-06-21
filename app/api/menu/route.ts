import { NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

const demoMenu = [
  {
    id: 1,
    category_id: 1,
    name_uz: "Milano Burger",
    name_ru: "Милано Бургер",
    name_en: "Milano Burger",
    description_uz: "Maxsus sous bilan tayyorlangan burger",
    description_ru: "Бургер с особым соусом",
    description_en: "Burger with special sauce",
    price: 25000,
    image_url: "/placeholder.svg?height=300&width=300",
    category_name_uz: "Burgerlar",
    category_name_ru: "Бургеры",
    category_name_en: "Burgers",
  },
  {
    id: 2,
    category_id: 2,
    name_uz: "Margherita",
    name_ru: "Маргарита",
    name_en: "Margherita",
    description_uz: "Klassik italyan pitsasi",
    description_ru: "Классическая итальянская пицца",
    description_en: "Classic Italian pizza",
    price: 35000,
    image_url: "/placeholder.svg?height=300&width=300",
    category_name_uz: "Pitsalar",
    category_name_ru: "Пиццы",
    category_name_en: "Pizzas",
  },
]

/**
 * GET /api/menu – returns all available menu items.
 * Falls back to hard-coded demo data if the database is unreachable.
 */
export async function GET() {
  if (!hasDb) {
    return NextResponse.json({ menuItems: demoMenu })
  }

  try {
    const rows = await sql`
      SELECT
        mi.*,
        c.name_uz AS category_name_uz,
        c.name_ru AS category_name_ru,
        c.name_en AS category_name_en
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.is_available = true
      ORDER BY c.id, mi.name_uz
    `
    return NextResponse.json({ menuItems: rows })
  } catch (err) {
    console.error("DB error in /api/menu:", (err as Error).message)
    return NextResponse.json({ menuItems: demoMenu })
  }
}
