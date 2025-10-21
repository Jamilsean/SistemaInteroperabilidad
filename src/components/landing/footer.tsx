import { Button } from "@/components/ui/button"
import { abreviatura_institucio, nombre_sistema } from "@/config/env"
import { BookOpen, Map, Database, Facebook, Instagram, Youtube } from "lucide-react"
 import { Link } from "react-router-dom"
 
   
export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-40 bg-white p-1  flex items-center justify-center">
               <img className="" src="/images/Logo3.png" alt="" />
              </div>
              
            </div>
            <p className="text-primary-foreground/80 text-sm text-pretty">
              {nombre_sistema}
            </p>
            <div className="flex space-x-3">
               <a href="https://www.facebook.com/InaigemPeru/">
              <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground">
                <Facebook className="h-4 w-4" />
              </Button>
              </a>
              <a href="https://www.instagram.com/inaigem.peru/?hl=es">
              <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground">
                <Instagram className="h-4 w-4" />
              </Button>
              </a>
               <a href="https://www.youtube.com/channel/UCs3FthuZRD8n3QkHU8_rYxg">
              <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground">
                <Youtube className="h-4 w-4" />
              </Button>
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://repositorio.inaigem.gob.pe/home"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentos de Investigación
                </a>
              </li>
              <li>
                <a
                  href="https://geoportal.inaigem.gob.pe/"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Datos Geoespaciales
                </a>
              </li>
              <li>
                <a
                  href="https://datacocha.inaigem.gob.pe/"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Datasets
                </a>
              </li>
              {/* <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  API de Acceso
                </a>
              </li> */}
            </ul>
          </div>

          {/* Support
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Guía de Usuario
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Términos de Uso
                </a>
              </li>
            </ul>
          </div> */}

          {/* Newsletter */}
          <div className="space-y-4 px-10">
            <h3 className="font-semibold text-lg">Mantente Informado</h3>
            <p className="text-primary-foreground/80 text-sm">
              {nombre_sistema}
            </p>
            <div className="space-y-2">
              {/* <Input
                placeholder="Tu email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              /> */}
               <Link to="/login">
                
              <Button variant="secondary" className="w-full">
                
                Ingresar
              </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/80 text-sm">© 2025 {abreviatura_institucio}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
