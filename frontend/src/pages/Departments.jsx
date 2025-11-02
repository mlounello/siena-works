import DataManager from "../components/ui/DataManager";

export default function Departments() {
  return (
    <DataManager
      title="Departments"
      table="departments"
      idField="id"
      columns={[
        { key: "code", label: "Department Code", type: "text", required: true },
        { key: "friendly_name", label: "Friendly Name", type: "text", required: true },
      ]}
      searchKeys={["code", "friendly_name"]}
      defaultSortKey="friendly_name"
    />
  );
}