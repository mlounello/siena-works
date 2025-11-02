import { useEffect, useMemo, useState } from "react";
import supabase from "../supabaseClient";
import DrawerWrapper from "../components/ui/DrawerWrapper";

const STATUSES = [
  "Requested",
  "Ordered",
  "Partially Received",
  "Fully Received",
  "Invoice Sent",
  "Invoice Received",
  "Paid",
  "Cancelled",
];

const STATUS_COLORS = {
  Requested: "bg-white text-gray-700 border border-gray-300",
  Ordered: "bg-orange-100 text-orange-800",
  "Partially Received": "bg-purple-200 text-purple-800",
  "Fully Received": "bg-purple-600 text-white",
  "Invoice Sent": "bg-blue-200 text-blue-800",
  "Invoice Received": "bg-blue-500 text-white",
  Paid: "bg-green-500 text-white",
  Cancelled: "bg-red-500 text-white",
};

const fmt = (n) =>
  typeof n === "number"
    ? n.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterVendor, setFilterVendor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [sortKey, setSortKey] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editedOrder, setEditedOrder] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        setError(`Failed to load orders: ${error.message}`);
      } else {
        setOrders(data ?? []);
      }

      setLoading(false);
    };
    load();
  }, []);

  const vendorOptions = useMemo(() => {
    const names = Array.from(
      new Set(orders.map((o) => o.vendor?.name).filter(Boolean))
    );
    return names.sort();
  }, [orders]);

  const deptOptions = useMemo(() => {
    const names = Array.from(
      new Set(
        orders
          .map((o) => o.department?.friendly_name || o.department?.code)
          .filter(Boolean)
      )
    );
    return names.sort();
  }, [orders]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return orders.filter((o) => {
      const vendorName = o.vendor?.name || "";
      const deptName = o.department?.friendly_name || o.department?.code || "";
      const acct = o.account?.friendly_name || o.account?.code || "";
      const matchesSearch =
        !needle ||
        (o.requisition_number || "").toLowerCase().includes(needle) ||
        (o.po_number || "").toLowerCase().includes(needle) ||
        vendorName.toLowerCase().includes(needle) ||
        deptName.toLowerCase().includes(needle) ||
        acct.toLowerCase().includes(needle) ||
        (o.status || "").toLowerCase().includes(needle);

      const matchesDept = !filterDept || deptName === filterDept;
      const matchesVendor = !filterVendor || vendorName === filterVendor;
      const matchesStatus = !filterStatus || o.status === filterStatus;

      return matchesSearch && matchesDept && matchesVendor && matchesStatus;
    });
  }, [orders, search, filterDept, filterVendor, filterStatus]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const get = (row) => {
        switch (sortKey) {
          case "requisition_number":
            return row.requisition_number || "";
          case "po_number":
            return row.po_number || "";
          case "vendor":
            return row.vendor?.name || "";
          case "department":
            return row.department?.friendly_name || row.department?.code || "";
          case "account":
            return row.account?.friendly_name || row.account?.code || "";
          case "order_value":
            return Number(row.order_value) || 0;
          case "status":
            return row.status || "";
          case "created_at":
          default:
            return row.created_at || "";
        }
      };
      const av = get(a);
      const bv = get(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const setSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const openDrawer = (order) => {
    setSelectedOrder(order);
    setEditedOrder({
      id: order.id,
      requisition_number: order.requisition_number || "",
      po_number: order.po_number || "",
      status: order.status || "Requested",
      order_value: order.order_value || "",
      vendor_name: order.vendor?.name || "",
      department_name:
        order.department?.friendly_name || order.department?.code || "",
      account_name: order.account?.friendly_name || order.account?.code || "",
    });
    setDrawerOpen(true);
  };

  const saveOrder = async () => {
  if (!editedOrder.id) return;

  const updateData = {
    requisition_number: editedOrder.requisition_number?.trim() || null,
    po_number: editedOrder.po_number?.trim() || null,
    order_value:
      editedOrder.order_value === "" || editedOrder.order_value == null
        ? 0
        : Number(editedOrder.order_value),
    status: editedOrder.status,
  };

  try {
    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", editedOrder.id);

    if (error) {
      console.error("Error updating order:", error.message);
      alert("Failed to update order.");
    } else {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === editedOrder.id ? { ...o, ...updateData } : o
        )
      );
      setDrawerOpen(false);
      console.log("Order updated successfully.");
    }
  } catch (err) {
    console.error("Unexpected error updating order:", err);
    alert("Something went wrong.");
  }
};

  return (
    <div>
      <h1 className="text-2xl font-serif text-siena-green mt-0 mb-4">Orders</h1>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Departments</option>
          {deptOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={filterVendor}
          onChange={(e) => setFilterVendor(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Vendors</option>
          {vendorOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <Th label="Req #" sortKey="requisition_number" setSort={setSort} activeKey={sortKey} sortDir={sortDir} />
              <Th label="PO #" sortKey="po_number" setSort={setSort} activeKey={sortKey} sortDir={sortDir} />
              <Th label="Vendor" sortKey="vendor" setSort={setSort} activeKey={sortKey} sortDir={sortDir} />
              <Th label="Department" sortKey="department" setSort={setSort} activeKey={sortKey} sortDir={sortDir} />
              <Th label="Account" sortKey="account" setSort={setSort} activeKey={sortKey} sortDir={sortDir} />
              <Th label="Amount" sortKey="order_value" setSort={setSort} activeKey={sortKey} sortDir={sortDir} right />
              <Th label="Status" sortKey="status" setSort={setSort} activeKey={sortKey} sortDir={sortDir} />
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  Loading…
                </td>
              </tr>
            )}
            {error && !loading && (
              <tr>
                <td colSpan={8} className="p-4 text-red-500 text-center">
                  {error}
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              sorted.map((o) => (
                <tr key={o.id} className="border-t hover:bg-gray-50 dark:hover:bg-siena-darkGreen/40">
                  <Td>{o.requisition_number || "-"}</Td>
                  <Td>{o.po_number || "-"}</Td>
                  <Td>{o.vendor?.name || "-"}</Td>
                  <Td>{o.department?.friendly_name || o.department?.code || "-"}</Td>
                  <Td>{o.account?.friendly_name || o.account?.code || "-"}</Td>
                  <Td right>{fmt(Number(o.order_value))}</Td>
                  <Td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[o.status] || ""}`}>
                      {o.status}
                    </span>
                  </Td>
                  <Td right>
                    <button
                      onClick={() => openDrawer(o)}
                      className="text-siena-green hover:text-siena-gold text-sm font-medium"
                    >
                      Edit
                    </button>
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
<DrawerWrapper
  title={`Edit Order ${selectedOrder?.po_number || ""}`}
  isOpen={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  onSave={saveOrder}
  data={selectedOrder}
  editedData={editedOrder}
>
        {selectedOrder ? (
          <div className="space-y-4">
            {[
              ["Requisition #", "requisition_number"],
              ["PO #", "po_number"],
              ["Vendor", "vendor_name"],
              ["Department", "department_name"],
              ["Account", "account_name"],
              ["Amount", "order_value"],
            ].map(([label, field]) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  type={field === "order_value" ? "number" : "text"}
                  value={editedOrder[field] || ""}
                  onChange={(e) =>
                    setEditedOrder((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  className="border p-2 w-full rounded dark:bg-siena-darkGreen/30 dark:text-siena-gold"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={editedOrder.status || "Requested"}
                onChange={(e) =>
                  setEditedOrder((prev) => ({ ...prev, status: e.target.value }))
                }
                className="border p-2 w-full rounded dark:bg-siena-darkGreen/30 dark:text-siena-gold"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <p>No order selected.</p>
        )}
      </DrawerWrapper>
    </div>
  );
}

function Th({ label, sortKey, activeKey, sortDir, setSort, right }) {
  const active = sortKey === activeKey;
  return (
    <th
      className={`p-2 cursor-pointer select-none ${
        right ? "text-right" : "text-left"
      } ${active ? "text-siena-green font-semibold" : "text-gray-700 dark:text-siena-gold"}`}
      onClick={() => setSort(sortKey)}
    >
      {label} {active ? (sortDir === "asc" ? "▲" : "▼") : ""}
    </th>
  );
}

function Td({ children, right }) {
  return (
    <td
      className={`p-2 ${
        right ? "text-right" : "text-left"
      } align-middle whitespace-nowrap dark:text-siena-gold`}
    >
      {children}
    </td>
  );
}