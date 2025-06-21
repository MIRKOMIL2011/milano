import { neon } from "@neondatabase/serverless"

// Check if we have a real database URL
export const hasDb = Boolean(
  process.env.DATABASE_URL &&
    process.env.DATABASE_URL !== "" &&
    !process.env.DATABASE_URL.includes("your-database-url"),
)

// Create SQL client
export const sql = hasDb
  ? neon(process.env.DATABASE_URL!)
  : async () => {
      console.warn("⚠️  No DATABASE_URL found - using demo mode")
      return []
    }

// Database connection test
export async function testConnection() {
  if (!hasDb) {
    console.log("🔄 Running in DEMO mode - no real database")
    return false
  }

  try {
    await sql`SELECT 1 as test`
    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}
