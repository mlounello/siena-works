import { useEffect, useState } from "react"
import supabase from "../supabaseClient"
import { colors } from "../theme"

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadAccounts = async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("code")
      if (error) console.error("Error:", error)
      else setAccounts(data)
    }
    loadAccounts()
  }, [])

  const filtered = accounts.filter(a =>
    a.friendly_name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toString().includes(search)
  )

  return (
    <div>
      <h1 style={{ color: colors.green, fontFamily: "Merriweather" }}>Account Codes</h1>
      <input
        type="text"
        placeholder="Search accounts..."
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
        {filtered.map(acc => (
          <li key={acc.id}>
            <strong>{acc.code}</strong> – {acc.friendly_name}
          </li>
        ))}
      </ul>
    </div>
  )
}