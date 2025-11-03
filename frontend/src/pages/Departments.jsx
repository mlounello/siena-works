import DataManager from "../components/ui/DataManager";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function Departments() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      setIsAdmin(Boolean(profile?.is_admin));
    };
    loadProfile();
  }, []);

  return (
    <DataManager
      title="Departments"
      table="departments"
      idField="id"
      columns={
        isAdmin
          ? [
              { key: "code", label: "Department Code", type: "text", required: true },
              { key: "friendly_name", label: "Friendly Name", type: "text", required: true },
            ]
          : [{ key: "friendly_name", label: "Department Name", type: "text", required: true }]
      }
      searchKeys={isAdmin ? ["code", "friendly_name"] : ["friendly_name"]}
      defaultSortKey="friendly_name"
    />
  );
}