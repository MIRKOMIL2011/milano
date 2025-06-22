"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { ShoppingBag, Users, Eye, Check, Clock, ChefHat, Truck, CheckCircle, RefreshCw } from "lucide-react"

interface Order {
  id: number
  user_name?: string
  user_email?: string
  total_amount: number
  status: string
  delivery_address: string
  phone: string
  created_at: string
  items: any[]
}

interface User {
  id: number
  name: string
  email: string
  phone?: string
  created_at: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")
  const { toast } = useToast()
  const { t } = useLanguage()

  const ADMIN_PASSWORD = "admin123"

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
      fetchUsers()
      const interval = setInterval(() => {
        fetchOrders()
        fetchUsers()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      toast({ title: t("success"), description: "Admin paneliga xush kelibsiz!" })
    } else {
      toast({ title: t("error"), description: "Noto'g'ri parol", variant: "destructive" })
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchOrders(), fetchUsers()])
    setIsRefreshing(false)
    toast({ title: "Yangilandi", description: "Ma'lumotlar yangilandi" })
  }

  // **To‘g‘ri fetch chaqiruvi shu yerda: backtick bilan**
  async function updateOrderStatus(orderId: number) {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o))
        )
        toast({ title: t("success"), description: "Buyurtma yakunlandi" })
      }
    } catch (err) {
      toast({ title: t("error"), description: "Xatolik yuz berdi", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat("uz-UZ").format(price) + " so'm"

  // … qolgan kod o‘zgarmaydi (filterOrdersByStatus, getStatusText, va h.k.)

  if (!isAuthenticated) {
    return (
      // login form …
    )
  }

  const pendingOrders = orders.filter((o) => o.status === "pending")
  const activeOrders = orders.filter((o) => ["confirmed", "preparing", "ready"].includes(o.status))
  const completedOrders = orders.filter((o) => o.status === "delivered")

  return (
    // JSX: Header, Tabs, OrdersList va Dialog rendering …
  )
}
