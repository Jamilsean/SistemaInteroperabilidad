
export function HeroSection() {
  return (
    <section className="relative py-2 lg:py-2 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
            Repositorio Académico de <span className="text-blue-600">Investigación</span>
          </h1>

          <p className="text-xl text-gray-500 mb-8 text-pretty max-w-2xl mx-auto">
            Accede a documentos de investigación, datos geoespaciales y datasets interconectados. Una plataforma
            integral para la comunidad científica y académica.
          </p>
        </div>
      </div>
    </section>
  )
}
