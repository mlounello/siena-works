import { useEffect, useMemo, useState } from "react";
import supabase from "../supabaseClient";
import DrawerWrapper from "../components/ui/DrawerWrapper";
import toast from "react-hot-toast";

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
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [accounts, setAccounts] = useState([]);
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
      try {
        const [
          { data: orderData },
          { data: vendorData },
          { data: deptData },
          { data: acctData },
        ] = await Promise.all([
          supabase
            .from("orders")
            .select(`
              id,
              requisition_number,
              po_number,
              order_value,
              status,
              created_at,
              vendor:vendor_id(id, name),
              account:account_code_id(id, code, friendly_name),
              department:department_id(id, code, friendly_name)
            `)
            .order("created_at", { ascending: false }),
          supabase.from("vendors").select("id, name").order("name"),
          supabase.from("departments").select("id, code, friendly_name").order("friendly_name"),
          supabase.from("accounts").select("id, code, friendly_name").order("friendly_name"),
        ]);

        setOrders(orderData || []);
        setVendors(vendorData || []);
        setDepartments(deptData || []);
        setAccounts(acctData || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      }
      setLoading(false);
    };
    load();
  }, []);

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
    return [...filtered].sort((a, b) => {
      const get = (r) => {
        switch (sortKey) {
          case "requisition_number": return r.requisition_number || "";
          case "po_number": return r.po_number || "";
          case "vendor": return r.vendor?.name || "";
          case "department": return r.department?.friendly_name || r.department?.code || "";
          case "account": return r.account?.friendly_name || r.account?.code || "";
          case "order_value": return Number(r.order_value) || 0;
          case "status": return r.status || "";
          default: return r.created_at || "";
        }
      };
      const av = get(a), bv = get(b);
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }, [filtered, sortKey, sortDir]);

  const setSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const openDrawer = (order = null) => {
    if (order) {
      setSelectedOrder(order);
      setEditedOrder({
        id: order.id,
        requisition_number: order.requisition_number || "",
        po_number: order.po_number || "",
        order_value: order.order_value || "",
        status: order.status || "Requested",
        vendor_id: order.vendor?.id || "",
        department_id: order.department?.id || "",
        account_code_id: order.account?.id || "",
      });
    } else {
      setSelectedOrder(null);
      setEditedOrder({
        requisition_number: "",
        po_number: "",
        order_value: "",
        status: "Requested",
        vendor_id: "",
        department_id: "",
        account_code_id: "",
      });
    }
    setDrawerOpen(true);
  };

  const saveOrder = async () => {
    if (!editedOrder) return;
    const payload = {
      requisition_number: editedOrder.requisition_number?.trim() || null,
      po_number: editedOrder.po_number?.trim() || null,
      order_value: Number(editedOrder.order_value) || 0,
      status: editedOrder.status || "Requested",
      vendor_id: editedOrder.vendor_id || null,
      department_id: editedOrder.department_id || null,
      account_code_id: editedOrder.account_code_id || null,
    };
    const loadingToast = toast.loading(editedOrder.id ? "Saving changes..." : "Creating order...");
    try {
      if (editedOrder.id) {
        const { error } = await supabase.from("orders").update(payload).eq("id", editedOrder.id);
        if (error) throw error;
        setOrders((p) => p.map((o) => (o.id === editedOrder.id ? { ...o, ...payload } : o)));
        toast.success("Order updated successfully!", { id: loadingToast });
      } else {
        const { data, error } = await supabase.from("orders").insert([payload]).select().single();
        if (error) throw error;
        setOrders((p) => [data, ...p]);
        toast.success("Order created successfully!", { id: loadingToast });
      }
      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save order.", { id: loadingToast });
    }
  };

  const deleteOrder = async () => {
    if (!selectedOrder?.id) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete this order?`);
    if (!confirmDelete) return;

    const loadingToast = toast.loading("Deleting order...");
    try {
      const { error } = await supabase.from("orders").delete().eq("id", selectedOrder.id);
      if (error) throw error;
      setOrders((p) => p.filter((o) => o.id !== selectedOrder.id));
      toast.success("Order deleted successfully!", { id: loadingToast });
      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order.", { id: loadingToast });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif text-siena-green mt-0 mb-4">Orders</h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => openDrawer(null)}
          className="bg-siena-green text-white px-4 py-2 rounded hover:bg-siena-darkGreen"
        >
          + Add Order
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="border p-2 rounded">
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.friendly_name}>{d.friendly_name || d.code}</option>
          ))}
        </select>
        <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} className="border p-2 rounded">
          <option value="">All Vendors</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.name}>{v.name}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border p-2 rounded">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border p-2 rounded" />
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
            {loading ? (
              <tr><td colSpan={8} className="p-4 text-center">Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="p-4 text-red-500 text-center">{error}</td></tr>
            ) : (
              sorted.map((o) => (
                <tr key={o.id} className="border-t hover:bg-gray-50 dark:hover:bg-siena-darkGreen/40">
                  <Td>{o.requisition_number || "-"}</Td>
                  <Td>{o.po_number || "-"}</Td>
                  <Td>{o.vendor?.name || "-"}</Td>
                  <Td>{o.department?.friendly_name || o.department?.code || "-"}</Td>
                  <Td>{o.account?.friendly_name || o.account?.code || "-"}</Td>
                  <Td right>{fmt(Number(o.order_value))}</Td>
                  <Td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[o.status] || ""}`}>{o.status}</span>
                  </Td>
                  <Td right>
                    <button onClick={() => openDrawer(o)} className="text-siena-green hover:text-siena-gold text-sm font-medium">Edit</button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      <DrawerWrapper title={selectedOrder ? `Edit Order ${selectedOrder.po_number || ""}` : "New Order"} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={saveOrder}>
        {editedOrder ? (
          <div className="space-y-4">
            <Input label="Requisition #" field="requisition_number" type="text" val={editedOrder} setVal={setEditedOrder} />
            <Input label="PO #" field="po_number" type="text" val={editedOrder} setVal={setEditedOrder} />
            <Select label="Vendor" field="vendor_id" opts={vendors} val={editedOrder} setVal={setEditedOrder} dKey="name" />
            <Select label="Department" field="department_id" opts={departments} val={editedOrder} setVal={setEditedOrder} dKey="friendly_name" fKey="code" />
            <Select label="Account" field="account_code_id" opts={accounts} val={editedOrder} setVal={setEditedOrder} dKey="friendly_name" fKey="code" />
            <Input label="Amount" field="order_value" type="number" val={editedOrder} setVal={setEditedOrder} />
            <Select label="Status" field="status" opts={STATUSES.map((s) => ({ id: s, name: s }))} val={editedOrder} setVal={setEditedOrder} dKey="name" />
            {selectedOrder && (
              <button onClick={deleteOrder} className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 w-full mt-4">
                Delete Order
              </button>
            )}
          </div>
        ) : <p>No order selected.</p>}
      </DrawerWrapper>
    </div>
  );
}

function Th({ label, sortKey, activeKey, sortDir, setSort, right }) {
  const active = sortKey === activeKey;
  return (
    <th
      onClick={() => setSort(sortKey)}
      className={`p-2 cursor-pointer select-none ${
        right ? "text-right" : "text-left"
      } ${
        active
          ? "text-siena-green font-semibold"
          : "text-gray-700 dark:text-siena-gold"
      }`}
    >
      {label} {active ? (sortDir === "asc" ? "▲" : "▼") : ""}
    </th>
  );
}

const Td = ({ children, right }) => (
  <td className={`p-2 ${right ? "text-right" : "text-left"} align-middle whitespace-nowrap dark:text-siena-gold`}>
    {children}
  </td>
);

const Input = ({ label, field, type, val, setVal }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      value={val[field] || ""}
      onChange={(e) => setVal((p) => ({ ...p, [field]: e.target.value }))}
      className="border p-2 w-full rounded dark:bg-siena-darkGreen/30 dark:text-siena-gold"
    />
  </div>
);

const Select = ({ label, field, opts, val, setVal, dKey, fKey }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select
      value={val[field] || ""}
      onChange={(e) => setVal((p) => ({ ...p, [field]: e.target.value }))}
      className="border p-2 w-full rounded dark:bg-siena-darkGreen/30 dark:text-siena-gold"
    >
      <option value="">Select {label}</option>
      {opts.map((o) => (
        <option key={o.id || o} value={o.id || o}>{o[dKey] || o[fKey] || o}</option>
      ))}
    </select>
  </div>
);