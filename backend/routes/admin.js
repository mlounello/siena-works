import { env } from "../config/env.js";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ Get all users
router.get("/users", async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_admin")
    .order("email", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ✅ Get all departments
router.get("/departments", async (req, res) => {
  const { data, error } = await supabase
    .from("departments")
    .select("id, code, friendly_name")
    .order("friendly_name", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ✅ Get all accounts
router.get("/accounts", async (req, res) => {
  const { data, error } = await supabase
    .from("accounts")
    .select("id, code, friendly_name")
    .order("friendly_name", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ✅ Update admin flag
router.post("/users/:id/admin", async (req, res) => {
  const { id } = req.params;
  const { is_admin } = req.body;

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ✅ Get a user’s current access (for preloading in Admin Dashboard)
router.get("/users/:id/access", async (req, res) => {
  const { id } = req.params;

  try {
    const [deptRes, accRes] = await Promise.all([
      supabase.from("user_departments").select("department_id").eq("user_id", id),
      supabase.from("user_accounts").select("account_id").eq("user_id", id),
    ]);

    if (deptRes.error || accRes.error) {
      return res.status(500).json({
        error:
          deptRes.error?.message ||
          accRes.error?.message ||
          "Failed to load user access",
      });
    }

    res.json({
  departmentIds: deptRes.data.map((d) => d.department_id),
  accountIds: accRes.data.map((a) => a.account_id),
});
  } catch (err) {
    console.error("Error fetching user access:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Update access (departments & accounts)
router.post("/users/:id/access", async (req, res) => {
  const { id } = req.params;
  const { departmentIds = [], accountIds = [] } = req.body;

  console.log("Saving access for:", id);
  console.log("Departments:", departmentIds);
  console.log("Accounts:", accountIds);

  // Clear existing access
  const deleteDepts = supabase.from("user_departments").delete().eq("user_id", id);
  const deleteAccs = supabase.from("user_accounts").delete().eq("user_id", id);
  const [delDeptRes, delAccRes] = await Promise.all([deleteDepts, deleteAccs]);

  if (delDeptRes.error || delAccRes.error) {
    console.error("Delete errors:", delDeptRes.error, delAccRes.error);
    return res.status(500).json({
      error:
        delDeptRes.error?.message ||
        delAccRes.error?.message ||
        "Failed to clear access",
    });
  }

  // Prepare new rows
  const deptRows = departmentIds.map((deptId) => ({
    user_id: id,
    department_id: deptId,
  }));
  const accRows = accountIds.map((accId) => ({
    user_id: id,
    account_id: accId,
  }));

  console.log("deptRows to insert:", deptRows);
  console.log("accRows to insert:", accRows);

  // 🔍 Insert new departments with response
  if (deptRows.length) {
    const { data, error } = await supabase
      .from("user_departments")
      .insert(deptRows)
      .select();

    if (error) {
      console.error("Department insert error:", error);
      return res.status(500).json({ error: error.message });
    }
    console.log("Dept insert result:", data);
  }

  // 🔍 Insert new accounts with response
  if (accRows.length) {
    const { data, error } = await supabase
      .from("user_accounts")
      .insert(accRows)
      .select();

    if (error) {
      console.error("Account insert error:", error);
      return res.status(500).json({ error: error.message });
    }
    console.log("Account insert result:", data);
  }

  console.log("Access successfully saved for:", id);
  res.json({ success: true });
});

export default router;