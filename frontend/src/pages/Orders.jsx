import { useEffect, useMemo, useState } from "react"
import supabase from "../supabaseClient"
import { colors } from "../theme"

const STATUSES = [
  "Requested",
  "Ordered",
  "Delivered",
  "Partially Received",
  "Fully Received",
  "Invoice Sent",
  "Invoice Received",
  "Paid",
  "Cancelled",
]

// Simple currency formatter
const fmt = (n) =>
  typeof n === "number" ? n.toLocaleString("en-US", { style: "currency", currency: "USD" }) : ""

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [search, setSearch] = useState("")
  const [filterDept, setFilterDept] = useState("")
  const [filterVendor, setFilterVendor] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  // Sorting
  const [sortKey, setSortKey] = useState("created_at")
  const [sortDir, setSortDir] = useState("desc")

  useEffect(() => {
  const load = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
  .from("orders")
  .select(`
    id,
    requisition_number,
    po_number,
    order_value,
    status,
    created_at,
    vendor:vendor_id(name),
    account:account_code_id(code, friendly_name),
    department:department_id(code, friendly_name)
  `)
  .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      setError(`Failed to load orders: ${error.message}`)
    } else {
      console.log("Orders loaded:", data)
      setOrders(data ?? [])
    }

    setLoading(false)
  }
  load()
}, [])

  // Build dropdown options from actual data
  const vendorOptions = useMemo(() => {
    const names = Array.from(new Set(orders.map(o => o.vendor?.name).filter(Boolean)))
    return names.sort()
  }, [orders])

  const deptOptions = useMemo(() => {
    const names = Array.from(new Set(orders.map(o => o.department?.friendly_name || o.department?.code).filter(Boolean)))
    return names.sort()
  }, [orders])

  // Apply filters + search
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return orders.filter(o => {
      const vendorName = o.vendor?.name || ""
      const deptName = o.department?.friendly_name || o.department?.code || ""
      const acct = o.account?.friendly_name || o.account?.code || ""
      const matchesSearch =
        !needle ||
        (o.requisition_number || "").toLowerCase().includes(needle) ||
        (o.po_number || "").toLowerCase().includes(needle) ||
        vendorName.toLowerCase().includes(needle) ||
        deptName.toLowerCase().includes(needle) ||
        String(o.order_value ?? "").toLowerCase().includes(needle) ||
        acct.toString().toLowerCase().includes(needle) ||
        (o.status || "").toLowerCase().includes(needle)

      const matchesDept = !filterDept || deptName === filterDept
      const matchesVendor = !filterVendor || vendorName === filterVendor
      const matchesStatus = !filterStatus || o.status === filterStatus

      return matchesSearch && matchesDept && matchesVendor && matchesStatus
    })
  }, [orders, search, filterDept, filterVendor, filterStatus])

  // Sort
  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1
    const copy = [...filtered]
    copy.sort((a, b) => {
      const get = (row) => {
        switch (sortKey) {
          case "requisition_number": return row.requisition_number || ""
          case "po_number": return row.po_number || ""
          case "vendor": return row.vendor?.name || ""
          case "department": return row.department?.friendly_name || row.department?.code || ""
          case "account": return row.account?.friendly_name || row.account?.code || ""
          case "order_value": return Number(row.order_value) || 0
          case "status": return row.status || ""
          case "created_at":
          default: return row.created_at || ""
        }
      }
      const av = get(a)
      const bv = get(b)
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const setSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    // optimistic update
    const prev = orders
    setOrders((rows) => rows.map(r => (r.id === orderId ? { ...r, status: newStatus } : r)))

    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)
    if (error) {
      console.error(error)
      // revert on failure
      setOrders(prev)
      alert("Failed to update status.")
    }
  }

  return (
    <div>
      <h1 style={{ color: colors.green, fontFamily: "Merriweather", marginTop: 0 }}>
        Orders
      </h1>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)}>
          <option value="">All Vendors</option>
          {vendorOptions.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <input
          type="text"
          placeholder="Search requisition, PO, vendor, account, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.5rem" }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f6f6f6" }}>
            <tr>
              <Th onClick={() => setSort("requisition_number")} active={sortKey === "requisition_number"} dir={sortDir}>Req #</Th>
              <Th onClick={() => setSort("po_number")} active={sortKey === "po_number"} dir={sortDir}>PO #</Th>
              <Th onClick={() => setSort("vendor")} active={sortKey === "vendor"} dir={sortDir}>Vendor</Th>
              <Th onClick={() => setSort("department")} active={sortKey === "department"} dir={sortDir}>Department</Th>
              <Th onClick={() => setSort("account")} active={sortKey === "account"} dir={sortDir}>Account</Th>
              <Th onClick={() => setSort("order_value")} active={sortKey === "order_value"} dir={sortDir} right>Amount</Th>
              <Th onClick={() => setSort("status")} active={sortKey === "status"} dir={sortDir}>Status</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ padding: "1rem" }}>Loading…</td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={7} style={{ padding: "1rem", color: "crimson" }}>{error}</td></tr>
            )}
            {!loading && !error && sorted.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "1rem" }}>No matching orders.</td></tr>
            )}
            {!loading && !error && sorted.map((o) => (
              <tr key={o.id} style={{ borderTop: "1px solid #eee" }}>
                <Td>{o.requisition_number || "-"}</Td>
                <Td>{o.po_number || "-"}</Td>
                <Td>{o.vendor?.name || "-"}</Td>
                <Td>{o.department?.friendly_name || o.department?.code || "-"}</Td>
                <Td>{o.account?.friendly_name || o.account?.code || "-"}</Td>
                <Td right>{fmt(Number(o.order_value))}</Td>
                <Td>
                  <select
                    value={o.status || "Requested"}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children, onClick, active, dir, right }) {
  return (
    <th
      onClick={onClick}
      style={{
        textAlign: right ? "right" : "left",
        padding: "0.75rem",
        cursor: "pointer",
        color: active ? colors.darkGreen : "#333",
        userSelect: "none",
        whiteSpace: "nowrap"
      }}
      title="Click to sort"
    >
      {children} {active ? (dir === "asc" ? "▲" : "▼") : ""}
    </th>
  )
}

function Td({ children, right }) {
  return (
    <td style={{ padding: "0.75rem", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>
      {children}
    </td>
  )
}