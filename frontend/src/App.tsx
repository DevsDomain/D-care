import React from 'react'
import './App.css'
import ElderlyForm from './components/ElderlyForm'
import Header from './components/Header'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ElderlyForm />
      </main>
      <Toaster />
    </div>
  )
}

export default App
