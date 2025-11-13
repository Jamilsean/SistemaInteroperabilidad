"use client"
import { useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function TopNav() {
  const { pathname } = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/")

  const handleNavClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50  bg-white backdrop-blur  border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/images/Logo3.png" alt="Logo" className=" w-20 rounded" />
        </Link>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-muted transition-colors hover:bg-muted/50"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
        >
          <svg
            className="h-6 w-6 transition-transform duration-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav
          className={`${
            isMenuOpen ? "block" : "hidden"
          } lg:block absolute lg:static top-14 left-0 w-full lg:w-auto bg-background lg:bg-transparent shadow-lg lg:shadow-none border-t lg:border-t-0 transition-all duration-300`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:gap-1 px-4 sm:px-6 md:px-0 py-2 md:py-0">
            <NavLink
              to=""
              onClick={handleNavClick}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("")
                  ? "bg-muted text-foreground"
                  : "text-foreground/70 hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              Inicios
            </NavLink>
            <NavLink
              to="/documentos"
              onClick={handleNavClick}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/documentos")
                  ? "bg-muted text-foreground"
                  : "text-foreground/70 hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              Documentos
            </NavLink>
            <NavLink
              to="/mapas"
              onClick={handleNavClick}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/mapas")
                  ? "bg-muted text-foreground"
                  : "text-foreground/70 hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              Mapas
            </NavLink>
            <NavLink
              to="/datasets"
              onClick={handleNavClick}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/datasets")
                  ? "bg-muted text-foreground"
                  : "text-foreground/70 hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              Datasets
            </NavLink>

            <Button asChild size="sm" className="mt-2 lg:mt-0 lg:ml-2 w-full lg:w-auto">
              <Link to="/login" onClick={handleNavClick}>
                Iniciar sesión
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
