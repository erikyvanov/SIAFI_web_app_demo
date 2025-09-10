import SiafiLogoPng from "../../assets/SIAFI_logo.png";

export function RecruitmentEnded() {
  return (
    <div className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col items-center justify-center min-h-screen py-16 px-4 overflow-hidden">
      {/* Dynamic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large circles */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-siafi-primary opacity-5 rounded-full animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-siafi-accent opacity-5 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-20 left-20 w-32 h-32 bg-siafi-secondary opacity-5 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Medium floating circles */}
        <div
          className="absolute top-1/3 right-1/4 w-24 h-24 bg-siafi-primary opacity-4 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-siafi-accent opacity-6 rounded-full animate-float"
          style={{ animationDelay: "3.5s" }}
        ></div>
        <div
          className="absolute top-3/4 right-1/3 w-16 h-16 bg-siafi-secondary opacity-4 rounded-full animate-float"
          style={{ animationDelay: "1.8s" }}
        ></div>

        {/* Small scattered circles */}
        <div
          className="absolute top-1/4 left-1/2 w-8 h-8 bg-siafi-primary opacity-8 rounded-full animate-bounce-slow"
          style={{ animationDelay: "0.3s" }}
        ></div>
        <div
          className="absolute top-2/3 right-1/6 w-6 h-6 bg-siafi-accent opacity-10 rounded-full animate-bounce-slow"
          style={{ animationDelay: "2.2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/6 w-10 h-10 bg-siafi-secondary opacity-6 rounded-full animate-bounce-slow"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-1/6 right-2/3 w-4 h-4 bg-siafi-primary opacity-12 rounded-full animate-bounce-slow"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Geometric shapes */}
        <div
          className="absolute top-1/2 left-1/12 w-12 h-12 bg-siafi-accent opacity-4 transform rotate-45 animate-rotate-slow"
          style={{ animationDelay: "2.8s" }}
        ></div>
        <div
          className="absolute bottom-1/6 right-1/12 w-8 h-8 bg-siafi-primary opacity-6 transform rotate-45 animate-rotate-slow"
          style={{ animationDelay: "1.2s" }}
        ></div>
        <div
          className="absolute top-1/12 left-1/3 w-6 h-6 bg-siafi-secondary opacity-8 transform rotate-45 animate-rotate-slow"
          style={{ animationDelay: "3.2s" }}
        ></div>

        {/* Triangular elements */}
        <div
          className="absolute top-1/3 left-1/12 w-0 h-0 border-l-8 border-r-8 border-b-14 border-l-transparent border-r-transparent border-b-siafi-primary opacity-6 animate-float"
          style={{ animationDelay: "2.5s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/12 w-0 h-0 border-l-6 border-r-6 border-b-10 border-l-transparent border-r-transparent border-b-siafi-accent opacity-8 animate-float"
          style={{ animationDelay: "1.7s" }}
        ></div>

        {/* Additional tech elements */}
        <div
          className="absolute top-2/3 left-2/3 w-14 h-1 bg-gradient-to-r from-siafi-primary to-transparent opacity-8 animate-pulse"
          style={{ animationDelay: "3.8s" }}
        ></div>
        <div
          className="absolute top-1/4 right-1/8 w-1 h-16 bg-gradient-to-b from-siafi-accent to-transparent opacity-6 animate-pulse"
          style={{ animationDelay: "2.3s" }}
        ></div>
        <div
          className="absolute bottom-1/2 left-1/8 w-12 h-1 bg-gradient-to-r from-siafi-secondary to-transparent opacity-8 animate-pulse"
          style={{ animationDelay: "4.2s" }}
        ></div>

        {/* Micro points */}
        <div
          className="absolute top-1/5 left-3/4 w-2 h-2 bg-siafi-primary opacity-15 rounded-full animate-twinkle"
          style={{ animationDelay: "0.8s" }}
        ></div>
        <div
          className="absolute top-3/5 right-3/4 w-1 h-1 bg-siafi-accent opacity-20 rounded-full animate-twinkle"
          style={{ animationDelay: "1.9s" }}
        ></div>
        <div
          className="absolute bottom-1/5 left-2/3 w-3 h-3 bg-siafi-secondary opacity-12 rounded-full animate-twinkle"
          style={{ animationDelay: "3.1s" }}
        ></div>
        <div
          className="absolute top-4/5 right-1/4 w-1 h-1 bg-siafi-primary opacity-25 rounded-full animate-twinkle"
          style={{ animationDelay: "2.7s" }}
        ></div>
        <div
          className="absolute top-1/8 left-1/8 w-2 h-2 bg-siafi-accent opacity-18 rounded-full animate-twinkle"
          style={{ animationDelay: "4.5s" }}
        ></div>

        {/* Additional tech elements */}
        <div
          className="absolute top-1/3 right-1/6 w-16 h-16 border-2 border-siafi-primary opacity-4 rounded-full animate-float"
          style={{ animationDelay: "3.3s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/5 w-12 h-12 border border-siafi-accent opacity-6 animate-rotate-slow"
          style={{ animationDelay: "2.1s" }}
        ></div>
        <div
          className="absolute top-1/6 left-2/3 w-8 h-8 border-2 border-siafi-secondary opacity-5 transform rotate-45 animate-pulse"
          style={{ animationDelay: "1.4s" }}
        ></div>

        {/* Connection elements */}
        <div
          className="absolute top-1/2 left-1/4 w-20 h-0.5 bg-gradient-to-r from-transparent via-siafi-primary to-transparent opacity-6 animate-pulse"
          style={{ animationDelay: "2.9s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-0.5 h-24 bg-gradient-to-b from-transparent via-siafi-accent to-transparent opacity-4 animate-pulse"
          style={{ animationDelay: "1.6s" }}
        ></div>

        {/* More scattered points */}
        <div
          className="absolute top-1/12 right-1/3 w-1 h-1 bg-siafi-primary opacity-30 rounded-full animate-twinkle"
          style={{ animationDelay: "0.4s" }}
        ></div>
        <div
          className="absolute top-5/6 left-1/4 w-2 h-2 bg-siafi-accent opacity-20 rounded-full animate-twinkle"
          style={{ animationDelay: "3.7s" }}
        ></div>
        <div
          className="absolute bottom-1/12 right-2/3 w-1 h-1 bg-siafi-secondary opacity-35 rounded-full animate-twinkle"
          style={{ animationDelay: "2.4s" }}
        ></div>
        <div
          className="absolute top-2/5 left-1/6 w-1 h-1 bg-siafi-primary opacity-40 rounded-full animate-twinkle"
          style={{ animationDelay: "4.1s" }}
        ></div>

        {/* Hexagonal elements */}
        <div
          className="absolute top-1/4 left-3/4 w-6 h-6 bg-siafi-accent opacity-5 transform rotate-12 animate-rotate-slow hexagon"
          style={{ animationDelay: "3.6s" }}
        ></div>
        <div
          className="absolute bottom-1/2 right-1/5 w-4 h-4 bg-siafi-primary opacity-7 transform -rotate-12 animate-rotate-slow hexagon"
          style={{ animationDelay: "1.3s" }}
        ></div>
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Logo with improved effects */}
        <div className="mb-12 transform">
          <div className="relative flex justify-center">
            <div className="relative bg-white rounded-full p-4 shadow-xl border border-gray-100">
              <img
                src={SiafiLogoPng}
                alt="Logo de SIAFI"
                className="w-80 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Phrases with animation */}
        <div className="h-20 flex items-center justify-center mb-8">
          <div className="relative">
            <p
              className="text-2xl text-gray-800 font-semibold px-6 py-3 rounded-lg bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg animate-fade-in"
            >
                El registro ha finalizado. Por favor, revisa tu correo electrónico para ver tus resultados.
            </p>
            {/* Phrase progress indicator */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-siafi-primary to-siafi-accent rounded-full"></div>
          </div>
        </div>

        {/* Subtle message */}
        <div className="text-gray-500 text-sm font-light">
          Configurando tu experiencia personalizada...
        </div>
      </div>
    </div>
  );
}
