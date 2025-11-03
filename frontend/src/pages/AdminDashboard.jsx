import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import useSystemTheme from "../hooks/useSystemTheme";

const API_ROOT =
  (import.meta.env.VITE_API_BASE &&
    import.meta.env.VITE_API_BASE.replace(/\/+$/, "")) ||
  "http://localhost:4000";
const API_BASE = `${API_ROOT}/api/admin`;

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) throw new Error(json?.message || res.statusText || "Request failed");
    return json;
  } catch {
    throw new Error("Response was not JSON.");
  }
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUserAdmin, setSelectedUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);

  const theme = useSystemTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const loadProfile = async () => {
      setCheckingUser(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingUser(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      setIsAdmin(Boolean(profile?.is_admin));
      setCheckingUser(false);
    };

    loadProfile();
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setLoadError("");
    try {
      const [userRes, deptRes, accRes] = await Promise.all([
        fetchJSON(`${API_BASE}/users`),
        fetchJSON(`${API_BASE}/departments`),
        fetchJSON(`${API_BASE}/accounts`),
      ]);
      setUsers(Array.isArray(userRes) ? userRes : []);
      setDepartments(Array.isArray(deptRes) ? deptRes : []);
      setAccounts(Array.isArray(accRes) ? accRes : []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setLoadError(err?.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUserSelect(user) {
  setSelectedUser(user);
  setSelectedUserAdmin(Boolean(user.is_admin)); // use separate local state
  try {
    const accessData = await fetchJSON(`${API_BASE}/users/${user.id}/access`);
    setSelectedDepartments(accessData.departmentIds || []);
    setSelectedAccounts(accessData.accountIds || []);
  } catch (err) {
    console.error("Failed to load user access:", err);
    setSelectedDepartments([]);
    setSelectedAccounts([]);
  }
}

  async function saveAccess() {
    if (!selectedUser) return;
    try {
      await fetchJSON(`${API_BASE}/users/${selectedUser.id}/admin`, {
        method: "POST",
        body: JSON.stringify({ is_admin: selectedUserAdmin }),
      });

      await fetchJSON(`${API_BASE}/users/${selectedUser.id}/access`, {
        method: "POST",
        body: JSON.stringify({
          departmentIds: selectedDepartments,
          accountIds: selectedAccounts,
        }),
      });

      await supabase.auth.admin.updateUserById(selectedUser.id, {
        app_metadata: {
          departments: selectedDepartments,
          accounts: selectedAccounts,
          is_admin: selectedUserAdmin
        }
      });

      await supabase.auth.refreshSession();

      alert("User access updated!");
      await loadData();
    } catch (err) {
      alert(err?.message || "Failed to update user access.");
    }
  }

  if (checkingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-siena-green"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-siena-darkGreen text-siena-gold" : "bg-gray-50 text-gray-900"
        }`}
      >
        <p className="text-lg font-medium">You do not have access to this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-lg">Loading admin data...</div>;
  }

  if (loadError) {
    return (
      <div className="p-6 text-red-700 bg-red-50 border border-red-200 rounded">
        <p className="font-semibold mb-1">Could not load admin data.</p>
        <p>{loadError}</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-siena-darkGreen text-siena-gold" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-3 gap-8">
          {/* Users list */}
          <div>
            <h2 className="font-medium mb-2">Users</h2>
            <ul className="border rounded divide-y max-h-96 overflow-y-auto bg-white dark:bg-siena-darkGreen/30">
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-2 cursor-pointer ${
                    selectedUser?.id === user.id
                      ? "bg-siena-gold text-siena-darkGreen font-semibold"
                      : "hover:bg-siena-green hover:text-siena-gold"
                  }`}
                >
                  {user.full_name || user.email}
                  {user.is_admin && <span className="ml-2 text-xs">(admin)</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Edit access */}
          <div className="col-span-2">
            {selectedUser ? (
              <div className="bg-white dark:bg-siena-darkGreen/30 p-4 rounded border">
                <h2 className="font-medium text-lg mb-4">
                  Edit Access for {selectedUser.full_name || selectedUser.email}
                </h2>

                <label className="flex items-center gap-2 mb-4">
  <input
    type="checkbox"
    checked={selectedUserAdmin}
    onChange={(e) => setSelectedUserAdmin(e.target.checked)}
  />
  Admin privileges
</label>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">Departments</label>
                  <select
                    multiple
                    value={selectedDepartments}
                    onChange={(e) =>
                      setSelectedDepartments(
                        Array.from(e.target.selectedOptions, (opt) => opt.value)
                      )
                    }
                    className="w-full border rounded p-2 h-40 dark:bg-siena-darkGreen/50"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.friendly_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">Accounts</label>
                  <select
                    multiple
                    value={selectedAccounts}
                    onChange={(e) =>
                      setSelectedAccounts(
                        Array.from(e.target.selectedOptions, (opt) => opt.value)
                      )
                    }
                    className="w-full border rounded p-2 h-40 dark:bg-siena-darkGreen/50"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.friendly_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={saveAccess}
                  className="bg-siena-darkGreen text-white px-4 py-2 rounded hover:bg-siena-green"
                >
                  Save Access
                </button>
              </div>
            ) : (
              <p>Select a user to edit access.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}