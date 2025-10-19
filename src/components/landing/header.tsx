import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Link, Outlet } from "react-router-dom"
import { Footer } from "./footer"
import { nombre_sistema } from "@/config/env"
import { useState } from "react"

export function Header() {
    const [, setIsMenuOpen] = useState(false)

   const handleNavClick = () => {
    setIsMenuOpen(false)
  }
  return (
    <div>


      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-25 rounded-lg bg-secondary flex items-center justify-center">
                <img src="/images/Logo3.png" alt="" />
              </div>
              {/* <span className="font-bold text-xl text-foreground">{abreviatura_institucio}</span> */}
            </div>
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
             <Link to="/landingpage" className="text-gray-500 hover:text-foreground transition-colors">
            {nombre_sistema}
          </Link>
            </nav>

            {/* Search and Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                 <Button asChild size="sm" className="mt-2 lg:mt-0 lg:ml-2 w-full lg:w-auto">
              <Link to="/login" onClick={handleNavClick}>
                Iniciar sesión
              </Link>
            </Button>
              </div>
              <Button variant="outline" size="icon" className="md:hidden bg-transparent">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main>
        
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
