"use client"

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { ShoppingBag, Users, Eye, CheckCircle, Clock, ChefHat, Truck, Check, RefreshCw } from "lucide-react";

interface Order {
id: number;
user_name?: string;
total_amount: number;
status: string;
phone: string;
delivery_address: string;
created_at: string;
items: Array<{ name?: string; price: number; quantity: number }>;
}

interface User {
id: number;
name: string;
email: string;
phone?: string;
created_at: string;
}

export default function AdminPage() {
const { toast } = useToast();
const { t } = useLanguage();

const [password, setPassword] = useState("");
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [orders, setOrders] = useState<Order[]>([]);
const [users, setUsers] = useState<User[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [isRefreshing, setIsRefreshing] = useState(false);
const [activeTab, setActiveTab] = useState<"pending" | "active" | "completed">("pending");

const ADMIN_PASSWORD = "admin123";

useEffect(() => {
if (isAuthenticated) {
loadData();
const interval = setInterval(loadData, 30000);
return () => clearInterval(interval);
}
}, [isAuthenticated]);

async function loadData() {
await Promise.all([fetchOrders(), fetchUsers()]);
}

function handleLogin() {
if (password === ADMIN_PASSWORD) {
setIsAuthenticated(true);
toast({ title: t("success"), description: "Admin paneliga xush kelibsiz!" });
} else {
toast({ title: t("error"), description: "Noto'g'ri parol", variant: "destructive" });
}
}

async function fetchOrders() {
try {
const res = await fetch("/api/orders");
const data = await res.json();
setOrders(data.orders || []);
} catch (err) {
console.error(err);
}
}

async function fetchUsers() {
try {
const res = await fetch("/api/admin/users");
const data = await res.json();
setUsers(data.users || []);
} catch (err) {
console.error(err);
}
}

async function handleRefresh() {
setIsRefreshing(true);
await loadData();
setIsRefreshing(false);
toast({ title: "Yangilandi", description: "Ma'lumotlar yangilandi" });
}

async function updateOrderStatus(orderId: number) {
setIsLoading(true);
try {
const res = await fetch(/api/orders/${orderId}, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ status: "completed" }),
});
if (res.ok) {
setOrders((prev) =>
prev.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o))
);
toast({ title: t("success"), description: "Buyurtma yakunlandi" });
}
} catch (err) {
toast({ title: t("error"), description: "Xatolik yuz berdi", variant: "destructive" });
} finally {
setIsLoading(false);
}
}

function formatPrice(price: number) {
return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
}

const pending = orders.filter((o) => o.status === "pending");
const active = orders.filter((o) => ["confirmed", "preparing", "ready"].includes(o.status));
const completed = orders.filter((o) => o.status === "delivered");

if (!isAuthenticated) {
return (


Admin Login

Parol
<Input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
Kirish



);
}

return (



Admin Dashboard

 Yangilash




Buyurtmalar
Foydalanuvchilar




Yangi ({pending.length})
Faol ({active.length})
Yakunlangan ({completed.length})














Foydalanuvchilar ({users.length})

{users.map((u) => (
{u.name} - {u.email}
))}





);
}

function OrdersList({ orders, onUpdateStatus, isLoading, showActions = true }: any) {
if (!orders.length) return Buyurtma yo'q;
return (

{orders.map((o: Order) => (


#{o.id} {o.user_name || "Mehmon"}
{formatPrice(o.total_amount)}

{showActions && o.status === "pending" && (
<Button onClick={() => onUpdateStatus(o.id)} disabled={isLoading}>
Yakunlash

)}

))}

);
}
