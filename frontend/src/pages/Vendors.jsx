import DataManager from "../components/ui/DataManager";

export default function Vendors() {
  return (
    <DataManager
      title="Vendors"
      table="vendors"
      idField="id"
      columns={[
        { key: "name", label: "Vendor Name", type: "text", required: true },
      ]}
      searchKeys={["name"]}
      defaultSortKey="name"
    />
  );
}