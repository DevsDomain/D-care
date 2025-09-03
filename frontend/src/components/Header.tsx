import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="dcare-gradient shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">D-Care</h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-white hover:text-gray-200 transition-colors">Home</a>
            <a href="#" className="text-white hover:text-gray-200 transition-colors">Sobre</a>
            <a href="#" className="text-white hover:text-gray-200 transition-colors">Cuidadores</a>
            <a href="#" className="text-white hover:text-gray-200 transition-colors">Contato</a>
            <a href="#" className="text-white hover:text-gray-200 transition-colors">Login</a>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header

