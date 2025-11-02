import { useEffect, useMemo, useState } from "react";
import supabase from "../../supabaseClient";
import DrawerWrapper from "./DrawerWrapper";
import toast from "react-hot-toast";

export default function DataManager({
  table,
  title,
  columns,
  idField = "id",
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState({});

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from(table).select("*").order(idField, { ascending: true });
      if (error) {
        console.error("Supabase error:", error);
        setError(error.message);
      } else {
        setRows(data ?? []);
      }
      setLoading(false);
    };
    load();
  }, [table, idField]);

  const openAdd = () => {
    setIsEditing(false);
    setEdited({});
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setIsEditing(true);
    setEdited({ ...row });
    setDrawerOpen(true);
  };

  const save = async () => {
    const loadingToast = toast.loading(isEditing ? "Updating..." : "Adding...");
    try {
      if (isEditing) {
        const { error } = await supabase.from(table).update(edited).eq(idField, edited[idField]);
        if (error) throw error;
        setRows((prev) => prev.map((r) => (r[idField] === edited[idField] ? edited : r)));
        toast.success(`${title.slice(0, -1)} updated.`, { id: loadingToast });
      } else {
        const { data, error } = await supabase.from(table).insert([edited]).select();
        if (error) throw error;
        setRows((prev) => [...prev, ...(data ?? [])]);
        toast.success(`${title.slice(0, -1)} added.`, { id: loadingToast });
      }
      setDrawerOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save.", { id: loadingToast });
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      const { error } = await supabase.from(table).delete().eq(idField, id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r[idField] !== id));
      toast.success("Deleted successfully.", { id: loadingToast });
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete.", { id: loadingToast });
    }
  };

  // ✅ Intelligent change detection
  const hasChanges = useMemo(() => {
    if (!drawerOpen) return false;

    if (!isEditing) {
      return Object.values(edited).some((v) => String(v ?? "").trim() !== "");
    }

    const original = rows.find((r) => r[idField] === edited[idField]);
    if (!original) return false;

    return columns.some(
      (c) =>
        String(original?.[c.key] ?? "").trim() !==
        String(edited?.[c.key] ?? "").trim()
    );
  }, [drawerOpen, isEditing, edited, rows, idField, columns]);

  return (
    <div>
      <h1 className="text-2xl font-serif text-siena-green mb-4">{title}</h1>

      <div className="flex justify-end mb-3">
        <button
          onClick={openAdd}
          className="bg-siena-green text-white px-4 py-2 rounded hover:bg-siena-darkGreen"
        >
          + Add {title.slice(0, -1)}
        </button>
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="p-2 text-left border-b">
                  {c.label}
                </th>
              ))}
              <th className="p-2 text-right border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[idField]} className="border-t hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={c.key} className="p-2 border-b">
                    {r[c.key] ?? "-"}
                  </td>
                ))}
                <td className="p-2 text-right">
                  <button
                    onClick={() => openEdit(r)}
                    className="text-siena-green hover:text-siena-gold mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(r[idField])}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Drawer */}
      <DrawerWrapper
        title={`${isEditing ? "Edit" : "Add"} ${title.slice(0, -1)}`}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={save}
        hasChanges={hasChanges}
      >
        {columns.map((c) => (
          <div key={c.key} className="mb-3">
            <label className="block text-sm font-medium mb-1">{c.label}</label>
            <input
              type="text"
              value={edited[c.key] || ""}
              onChange={(e) =>
                setEdited((prev) => ({ ...prev, [c.key]: e.target.value }))
              }
              className="border p-2 w-full rounded dark:bg-siena-darkGreen/30 dark:text-siena-gold"
            />
          </div>
        ))}
      </DrawerWrapper>
    </div>
  );
}