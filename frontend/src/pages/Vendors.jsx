import { useEffect, useState } from "react"
import supabase from "../supabaseClient"
import { colors } from "../theme"

export default function Vendors() {
  const [vendors, setVendors] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadVendors = async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("name")
      if (error) console.error("Error:", error)
      else setVendors(data)
    }
    loadVendors()
  }, [])

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 style={{ color: colors.green, fontFamily: "Merriweather" }}>Vendors</h1>
      <input
        type="text"
        placeholder="Search vendors..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          padding: "0.5rem",
          margin: "1rem 0",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "6px",
          border: "1px solid #ccc"
        }}
      />
      <ul>
        {filtered.map(vendor => (
          <li key={vendor.id}>
            <strong>{vendor.name}</strong>{vendor.contact ? ` – ${vendor.contact}` : ""}
          </li>
        ))}
      </ul>
    </div>
  )
}