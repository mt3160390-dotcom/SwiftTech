import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersForAdmin } from "@/store/admin/order-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { getAllUsersForAdmin } from "@/store/admin/users-slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  CircleDollarSign,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

// ─── colour palette ───────────────────────────────────────────────────────────
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6"];

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#22c55e",
  processing: "#6366f1",
  shipped: "#14b8a6",
  delivered: "#3b82f6",
  rejected: "#ef4444",
};

// ─── small stat card ──────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── custom tooltip for area / bar chart ─────────────────────────────────────
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-indigo-500">Revenue: Rs {payload[0]?.value?.toLocaleString()}</p>
      <p className="text-emerald-500">Orders: {payload[1]?.value}</p>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const dispatch = useDispatch();
  const { orderList } = useSelector((state) => state.adminOrder);
  const { productList } = useSelector((state) => state.adminProducts);
  const { usersList } = useSelector((state) => state.adminUsers ?? {});

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
    dispatch(fetchAllProducts());
    dispatch(getAllUsersForAdmin());
  }, [dispatch]);

  // ── derived stats ────────────────────────────────────────────────────────
  const totalRevenue = useMemo(
    () => (orderList ?? []).reduce((sum, o) => sum + (o.totalAmount ?? 0), 0),
    [orderList]
  );

  const statusCounts = useMemo(() => {
    const counts = {};
    (orderList ?? []).forEach((o) => {
      const s = o.orderStatus ?? "unknown";
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orderList]);

  // ── monthly revenue + order count (last 6 months) ────────────────────────
  const monthlyData = useMemo(() => {
    const map = {};
    const now = new Date();

    // seed last 6 months so empty months still show
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      map[key] = { month: key, revenue: 0, orders: 0 };
    }

    (orderList ?? []).forEach((o) => {
      const d = new Date(o.orderDate);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (map[key]) {
        map[key].revenue += o.totalAmount ?? 0;
        map[key].orders += 1;
      }
    });

    return Object.values(map);
  }, [orderList]);

  // ── top 5 products by quantity sold (from cartItems) ─────────────────────
  const topProducts = useMemo(() => {
    const counts = {};
    (orderList ?? []).forEach((o) => {
      (o.cartItems ?? []).forEach((item) => {
        const name = item.title ?? item.name ?? item.productId ?? "Unknown";
        counts[name] = (counts[name] ?? 0) + (item.quantity ?? 1);
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sold]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, sold }));
  }, [orderList]);

  // ── category breakdown from product list ────────────────────────────────
  const categoryData = useMemo(() => {
    const counts = {};
    (productList ?? []).forEach((p) => {
      const cat = p.category ?? "Other";
      counts[cat] = (counts[cat] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [productList]);

  const pendingOrders = (orderList ?? []).filter((o) => o.orderStatus === "pending").length;
  const confirmedOrders = (orderList ?? []).filter((o) => o.orderStatus === "confirmed").length;
  const rejectedOrders = (orderList ?? []).filter((o) => o.orderStatus === "rejected").length;

  return (
    <div className="space-y-6 p-1">
      {/* ── page title ── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Summary Report</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your store's performance
        </p>
      </div>

      {/* ── stat cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`Rs ${totalRevenue.toLocaleString()}`}
          icon={CircleDollarSign}
          color="#6366f1"
          sub={`from ${(orderList ?? []).length} orders`}
        />
        <StatCard
          title="Total Orders"
          value={(orderList ?? []).length}
          icon={ShoppingCart}
          color="#22c55e"
          sub={`${pendingOrders} pending`}
        />
        <StatCard
          title="Total Products"
          value={(productList ?? []).length}
          icon={Package}
          color="#f59e0b"
        />
        <StatCard
          title="Total Users"
          value={(usersList ?? []).length}
          icon={Users}
          color="#14b8a6"
        />
      </div>

      {/* ── order-status mini cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Confirmed Orders" value={confirmedOrders} icon={CheckCircle2} color="#22c55e" />
        <StatCard title="Pending Orders" value={pendingOrders} icon={Clock} color="#f59e0b" />
        <StatCard title="Rejected Orders" value={rejectedOrders} icon={XCircle} color="#ef4444" />
      </div>

      {/* ── revenue + orders area chart ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp size={18} className="text-indigo-500" />
            Revenue &amp; Orders — Last 6 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip content={<RevenueTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorRevenue)"
                name="Revenue (Rs)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#colorOrders)"
                name="Orders"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── bottom row: pie + bar ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* order status pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {statusCounts.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No orders yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {statusCounts.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} orders`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* top products bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top 5 Products Sold</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No sales data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={90}
                  />
                  <Tooltip formatter={(v) => [`${v} units`, "Sold"]} />
                  <Bar dataKey="sold" name="Units Sold" radius={[0, 4, 4, 0]}>
                    {topProducts.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── product category bar chart ── */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v} products`, ""]} />
                <Bar dataKey="value" name="Products" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdminDashboard;
