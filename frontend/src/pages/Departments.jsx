import { useEffect, useState } from 'react'
import supabase from '../supabaseClient'
import { colors } from '../theme'

export default function Departments() {
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    const loadDepartments = async () => {
      const { data, error } = await supabase.from('departments').select('*').order('code')
      if (error) console.error('Error:', error)
      else setDepartments(data)
    }
    loadDepartments()
  }, [])

  return (
    <div>
      <h1 style={{ color: colors.green, fontFamily: 'Merriweather' }}>Departments</h1>
      <ul>
        {departments.map((dept) => (
          <li key={dept.id}>
            <strong>{dept.code}</strong> – {dept.friendly_name}
          </li>
        ))}
      </ul>
    </div>
  )
}