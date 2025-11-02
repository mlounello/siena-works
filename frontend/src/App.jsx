import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Select } from "./components/ui/select"
import { Card } from "./components/ui/card"

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-offwhite p-6 text-darkgreen">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-serif mb-4 text-sienagreen">SienaWorks UI Test</h1>
        <Input placeholder="Sample Input" />
        <Select className="w-full mt-3">
          <option>Option A</option>
          <option>Option B</option>
        </Select>
        <div className="flex gap-3 mt-4">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </Card>
    </div>
  )
}