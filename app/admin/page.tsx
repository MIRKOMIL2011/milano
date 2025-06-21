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
import { ShoppingBag, Users, Eye, CheckCircle, Clock, ChefHat, Truck, Check, RefreshCw } from "lucide-react"

interface Order {
id: number
user\_name?: string
user\_email?: string
total\_amount: number
status: string
delivery\_address: string
phone: string
created\_at: string
items: any\[]
}

interface User {
id: number
name: string
email: string
phone?: string
created\_at: string
}

export default function AdminPage() {
const \[isAuthenticated, setIsAuthenticated] = useState(false)
const \[password, setPassword] = useState("")
const \[orders, setOrders] = useState\<Order\[]>(\[])
const \[users, setUsers] = useState\<User\[]>(\[])
const \[selectedOrder, setSelectedOrder] = useState\<Order | null>(null)
const \[isLoading, setIsLoading] = useState(false)
const \[isRefreshing, setIsRefreshing] = useState(false)
const \[activeTab, setActiveTab] = useState("pending")
const { toast } = useToast()
const { t } = useLanguage()

const ADMIN\_PASSWORD = "admin123"

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
}, \[isAuthenticated])

const handleLogin = () => {
if (password === ADMIN\_PASSWORD) {
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
setOrders(data.orders || \[])
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
setUsers(data.users || \[])
}
} catch (error) {
console.error("Error fetching users:", error)
}
}

const handleRefresh = async () => {
setIsRefreshing(true)
await Promise.all(\[fetchOrders(), fetchUsers()])
setIsRefreshing(false)
toast({ title: "Yangilandi", description: "Ma'lumotlar yangilandi" })
}

const updateOrderStatus = async (orderId: number, status: string) => {
setIsLoading(true)
try {
const response = await fetch(`/api/orders/${orderId}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ status: status === "pending" ? "completed" : status }),
})

```
  if (response.ok) {
    toast({ title: t("success"), description: `Buyurtma holati ${status === "pending" ? "Yakunlandi" : "Yangilandi"}` })
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: status === "pending" ? "completed" : status } : o)))
  }
} catch (error) {
  toast({ title: t("error"), description: "Buyurtma holatini o'zgartirishda xatolik", variant: "destructive" })
} finally {
  setIsLoading(false)
}
```

}

const formatPrice = (price: number) => new Intl.NumberFormat("uz-UZ").format(price) + " so'm"

const filterOrdersByStatus = (status: string) => {
switch (status) {
case "pending":
return orders.filter((o) => o.status === "pending")
case "active":
return orders.filter((o) => \["confirmed", "preparing", "ready"].includes(o.status))
case "completed":
return orders.filter((o) => o.status === "delivered")
default:
return orders
}
}

const getNextStatus = (status: string) => {
switch (status) {
case "pending":
return "completed"
default:
return null
}
}

const getNextStatusText = (status: string) => {
const next = getNextStatus(status)
return next === "completed" ? "Yakunlash" : null
}

const pendingOrders = filterOrdersByStatus("pending")
const activeOrders = filterOrdersByStatus("active")
const completedOrders = filterOrdersByStatus("completed")

if (!isAuthenticated) {
return ( <div className="min-h-screen flex items-center justify-center"> <Card className="w-full max-w-md"> <CardHeader> <CardTitle>Admin Panel</CardTitle> </CardHeader> <CardContent> <Label htmlFor="password">Parol</Label>
\<Input
id="password"
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
onKeyPress={(e) => e.key === "Enter" && handleLogin()}
/> <Button onClick={handleLogin} className="mt-4 w-full">
Kirish </Button> </CardContent> </Card> </div>
)
}

return ( <div className="min-h-screen p-4"> <Header /> <div className="flex justify-between mb-4"> <h1 className="text-2xl">Admin Dashboard</h1> <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline"> <RefreshCw className="mr-2" /> Yangilash </Button> </div> <Tabs defaultValue="orders"> <TabsList> <TabsTrigger value="orders">Buyurtmalar</TabsTrigger> </TabsList> <TabsContent value="orders"> <Tabs value={activeTab} onValueChange={setActiveTab}> <TabsList> <TabsTrigger value="pending">Yangi ({pendingOrders.length})</TabsTrigger> <TabsTrigger value="active">Faol ({activeOrders.length})</TabsTrigger> <TabsTrigger value="completed">Yakunlangan ({completedOrders.length})</TabsTrigger> </TabsList> <TabsContent value="pending"> <OrdersList orders={pendingOrders} onUpdateStatus={updateOrderStatus} onViewOrder={setSelectedOrder} isLoading={isLoading} /> </TabsContent> <TabsContent value="active"> <OrdersList orders={activeOrders} onUpdateStatus={updateOrderStatus} onViewOrder={setSelectedOrder} isLoading={isLoading} /> </TabsContent> <TabsContent value="completed"> <OrdersList orders={completedOrders} onUpdateStatus={updateOrderStatus} onViewOrder={setSelectedOrder} isLoading={isLoading} showActions={false} /> </TabsContent> </Tabs> </TabsContent> </Tabs>
{selectedOrder && (
\<Dialog open={true} onOpenChange={() => setSelectedOrder(null)}> <DialogContent> <DialogHeader> <DialogTitle>Buyurtma #{selectedOrder.id}</DialogTitle> </DialogHeader> <div>
{/\* Tafsilotlar bu yerda \*/} </div> </DialogContent> </Dialog>
)} </div>
)
}

function OrdersList({ orders, onUpdateStatus, onViewOrder, isLoading, showActions = true }: any) {
if (orders.length === 0) {
return <div>Bu bo'limda buyurtma yo'q</div>
}
return ( <div className="space-y-4">
{orders.map((order: Order) => ( <div key={order.id} className="p-4 border rounded-lg"> <div className="flex justify-between"> <div> <p>#{order.id} {order.user\_name || "Mehmon"}</p> <p>{order.phone}</p> </div>
{showActions && getNextStatus(order.status) && (
\<Button onClick={() => onUpdateStatus(order.id, order.status)} disabled={isLoading}>
Yakunlash </Button>
)} </div> </div>
))} </div>
)
}
