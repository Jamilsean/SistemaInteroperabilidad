import { Button } from "@/components/ui/button"
import { Menu, LogIn } from "lucide-react"
import { Outlet } from "react-router-dom"
import { Footer } from "./footer"
import { nombre_sistema } from "@/config/env"

export function Header() {
  return (
    <div>


      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">

                <img src="public/images/Logo.png" alt="" />
              </div>
              <span className="font-bold text-xl text-foreground">INAIGEM</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/landingPage" className="text-gray-500 hover:text-foreground transition-colors">
                {nombre_sistema}
              </a>
             
            </nav>

            {/* Search and Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <a href="login" className="relative flex space-x-2 text-gray-500">
                  <LogIn /><span> Iniciar sesion</span>
                </a>
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
