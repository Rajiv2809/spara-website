import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div class="min-h-screen bg-gray-100">

        <nav class="bg-blue-600 text-white p-4 shadow">
          <h1 class="text-xl font-bold">My App</h1>
        </nav>


        <div class="p-6">
          <h2 class="text-2xl font-semibold mb-4">Dashboard</h2>

          <div class="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm">
            <h3 class="text-lg font-bold mb-2">Welcome 👋</h3>
            <p class="text-gray-600 mb-4">
              Ini contoh tampilan sederhana menggunakan Tailwind CSS.
            </p>
            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Klik Saya
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
