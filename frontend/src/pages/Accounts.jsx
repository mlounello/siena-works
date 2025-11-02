import DataManager from "../components/ui/DataManager";

export default function Accounts() {
  return (
    <DataManager
      title="Accounts"
      table="accounts"
      idField="id"
      columns={[
        { key: "code", label: "Account Code", type: "text", required: true },
        { key: "friendly_name", label: "Friendly Name", type: "text", required: true },
      ]}
      searchKeys={["code", "friendly_name"]}
      defaultSortKey="friendly_name"
    />
  );
}