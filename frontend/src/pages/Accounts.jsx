import DataManager from "../components/ui/DataManager";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function Accounts() {
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
      title="Accounts"
      table="accounts"
      idField="id"
      columns={
        isAdmin
          ? [
              { key: "code", label: "Account Code", type: "text", required: true },
              { key: "friendly_name", label: "Friendly Name", type: "text", required: true },
            ]
          : [{ key: "friendly_name", label: "Account Name", type: "text", required: true }]
      }
      searchKeys={isAdmin ? ["code", "friendly_name"] : ["friendly_name"]}
      defaultSortKey="friendly_name"
    />
  );
}