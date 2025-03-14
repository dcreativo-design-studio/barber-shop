import { Award, Calendar, ChevronDown, Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Scissors, Star, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DCreativoFooterPromo from '../components/DCreativoFooterPromo';
import { useAuth } from '../context/AuthContext';

// CSS Aggiuntivo per il componente DCreativo
const dCreativoStyles = `
  .service-icon-wrapper {
    background: var(--accent);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .service-icon-wrapper .icon-white {
    color: white;
  }

  .service-card:hover .service-icon-wrapper {
    transform: scale(1.1);
  }

  .animate-pulse-slow {
    animation: pulse 3s infinite;
  }

  @keyframes pulse {
    0% { opacity: 0; }
    50% { opacity: 0.1; }
    100% { opacity: 0; }
  }

  /* Stili per la sezione DCreativo */
  .dcreativo-footer-promo {
    position: relative;
    overflow: hidden;
  }

  .dcreativo-footer-promo .bg-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .dcreativo-footer-promo .service-card {
    position: relative;
    z-index: 1;
  }

  .dcreativo-footer-promo .service-card::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0;
    background: var(--accent);
    opacity: 0.1;
    transition: height 0.3s ease;
    z-index: -1;
  }

  .dcreativo-footer-promo .service-card:hover::after {
    height: 100%;
  }
`;
const DCreativoPromoLink = ({ onClick }) => {
  return (
    <div className="mt-6 group cursor-pointer">
      <button
        onClick={onClick}
        className="relative py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 group"
        aria-label="Scopri il sistema di prenotazioni sviluppato da DCreativo"
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <span className="text-lg font-medium">✨ Sistema di prenotazioni sviluppato da DCreativo</span>
        <div className="flex items-center ml-2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </button>

      {/* Floating badges to attract attention */}
      <div className="absolute -mt-10 -mr-2 right-0 transform rotate-12 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse shadow-lg">
        Novità!
      </div>
      <div className="absolute -mt-10 ml-2 left-0 transform -rotate-12 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
        Scopri di più
      </div>
    </div>
  );
};
// Componente per visualizzare una singola card di servizio
const ServiceCard = ({ icon, title, description, price, user }) => {
  return (
    <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
      <div className="flex items-center mb-4">
        <div className="service-icon-wrapper">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="mb-4 text-[var(--text-primary)] text-opacity-80">{description}</p>
      <div className="flex justify-between items-center">
        <p className="text-[var(--accent)] font-bold">{price}</p>
        <Link to={user ? "/booking" : "/guest-booking"} className="text-sm text-[var(--accent)] hover:underline font-medium flex items-center">
          Prenota <ChevronDown className="w-4 h-4 ml-1 transform rotate-270" />
        </Link>
      </div>
    </div>
  );
};

const HomePage = React.memo(() => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState({});
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showDCreativoPromo, setShowDCreativoPromo] = useState(false);
  const sectionRefs = {
    hero: useRef(null),
    services: useRef(null),
    about: useRef(null),
    testimonials: useRef(null),
    contact: useRef(null)
  };



  // Scroll to section with smooth animation
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Set up intersection observer to trigger animations when scrolling
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    // Osserva anche la sezione DCreativo se esiste
    if (handleDCreativoSectionRef.current) {
      observer.observe(handleDCreativoSectionRef.current);
    }

    return () => {
      Object.values(sectionRefs).forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });

      if (handleDCreativoSectionRef.current) {
        observer.unobserve(handleDCreativoSectionRef.current);
      }
    };
  }, []);

  // Mostra la promozione DCreativo dopo 3 secondi dalla visualizzazione della pagina
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDCreativoPromo(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Animation classes based on visibility
  const getAnimationClass = (sectionId) => {
    return isVisible[sectionId] ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
  };

  // Aggiungi riferimento al componente da promuovere
  const handleDCreativoSectionRef = useRef(null);

  // Scroll to DCreativo section with proper positioning at the top
  const scrollToDCreativoSection = () => {
    setShowDCreativoPromo(true);
    setTimeout(() => {
      if (handleDCreativoSectionRef.current) {
        handleDCreativoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="home-page min-h-screen overflow-x-hidden">
      {/* Hero Section with Parallax Effect */}
      <section
        id="hero"
        ref={sectionRefs.hero}
        className="hero-section min-h-screen flex items-center justify-center relative py-20 px-4 overflow-hidden stabilize-render"
      >
        {/* Container per lo sfondo con parallax effect */}
        <div className="absolute inset-0 z-0 parallax-background">
          {/* Immagine di sfondo ad alta risoluzione con classe ottimizzata */}
          <div
            className="hero-image high-quality-image transition-transform duration-700"
            style={{
              backgroundImage: 'url("/shot-img2.png")',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              transform: isVisible.hero ? 'scale(1.05)' : 'scale(1)'
            }}
          ></div>

          {/* Overlay per tema scuro con classes ottimizzate */}
          <div className="hero-overlay-dark"></div>

          {/* Overlay per tema chiaro con classes ottimizzate */}
          <div className="hero-overlay-light"></div>

          {/* Effetto vignetta per migliorare la leggibilità sui bordi */}
          <div className="absolute inset-0 z-0 box-shadow-vignette opacity-60"></div>
        </div>

        {/* Contenuto della hero section con classi ottimizzate */}
        <div className="container mx-auto text-center max-w-5xl relative z-10">
          {/* Titolo con classe ottimizzata per l'effetto glow */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white animate-text-shadow-pulse tracking-wide">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[var(--accent)] to-white">
              Your Style Barber Studio
            </span>
          </h1>

          {/* Sottotitolo con classe ottimizzata per il testo */}
          <p className="text-xl md:text-2xl lg:text-3xl mb-10 animate-fade-in text-white font-medium tracking-wide">
            Il tuo stile, <span className="text-[var(--accent)]">la nostra passione</span>
          </p>

          <div className="mt-10 animate-slide-up">
            {user ? (
              <div className="space-y-6">
                <p className="text-xl text-white font-medium">
                  Bentornato, <span className="text-[var(--accent)]">{user.firstName}!</span>
                </p>
                <div>
                  {user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      className="button-enhanced group relative overflow-hidden bg-[var(--accent)] text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                      <span className="relative z-10">Dashboard Admin</span>
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                    </Link>
                  ) : user.role === 'barber' ? (
                    <Link
                      to="/barber"
                      className="button-enhanced group relative overflow-hidden bg-[var(--accent)] text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                      <span className="relative z-10">Pannello Barbiere</span>
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                    </Link>
                  ) : (
                    <Link
                      to="/booking"
                      className="button-enhanced group relative overflow-hidden bg-[var(--accent)] text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                      <span className="relative z-10">Prenota Ora</span>
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-xl mb-6 text-white font-medium">
                  Prenota il tuo appuntamento oggi stesso
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    to="/login"
                    className="button-enhanced group relative overflow-hidden bg-[var(--accent)] text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <User className="w-5 h-5" />
                      Accedi
                    </span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                  </Link>
                  <Link
                    to="/register"
                    className="group relative overflow-hidden bg-gray-700 text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <User className="w-5 h-5" />
                      Registrati
                    </span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                  </Link>
                  <Link
                    to="/guest-booking"
                    className="group relative overflow-hidden bg-gray-700 text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Prenota come ospite
                    </span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-16">
            <button
              onClick={() => scrollToSection('services')}
              className="text-white hover:text-[var(--accent)] transition-colors flex flex-col items-center gap-2 mx-auto font-medium"
              aria-label="Scorri verso il basso per scoprire i nostri servizi"
            >
              <span>Scopri di più</span>
              <ChevronDown className="w-8 h-8 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* Services Section with Card Animations */}
      <section
        id="services"
        ref={sectionRefs.services}
        className={`py-20 px-4 bg-[var(--bg-secondary)] transition-all duration-1000 ${getAnimationClass('services')}`}
      >
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[var(--accent)]">
            I Nostri Servizi
          </h2>
          <p className="text-center max-w-2xl mx-auto mb-12 text-[var(--text-primary)] opacity-80">
            Offriamo un'ampia gamma di servizi professionali per soddisfare ogni tua esigenza
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Taglio di Capelli */}
  <ServiceCard
    icon={<Scissors className="icon-white" />}
    title="Taglio di Capelli"
    description="Taglio professionale personalizzato in base alla forma del viso e alle preferenze personali."
    price="Da CHF 30"
    user={user}
  />

  {/* Barba */}
  <ServiceCard
    icon={
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-white">
        <path d="M3 3v18h18" />
        <path d="M16 3c0 6-4 10-10 10" />
        <path d="M8 15a2 2 0 0 0 4 0" />
        <path d="M18 3c0 9-4 14-10 14" />
      </svg>
    }
    title="Barba"
    description="Rifinitura e modellamento della barba, con trattamento rilassante e prodotti di qualità."
    price="Da CHF 25"
    user={user}
  />

  {/* Taglio + Barba */}
  <ServiceCard
    icon={
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-white">
        <path d="M16 2s-2 2-4 2-4-2-4-2"></path>
        <path d="M12 14c-3 0-4-3-4-3"></path>
        <path d="M16 14c-1 0-2-1-3-2"></path>
        <path d="M3 6v14"></path>
        <path d="M21 6v14"></path>
        <path d="M3 10h18"></path>
        <path d="M3 14h18"></path>
        <path d="M10 6a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1z"></path>
      </svg>
    }
    title="Taglio + Barba"
    description="Combinazione di taglio di capelli e rifinitura della barba per un look completo."
    price="Da CHF 45"
    user={user}
  />

  {/* Taglio Bambino */}
  <ServiceCard
    icon={
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-white">
        <circle cx="12" cy="9" r="5"></circle>
        <path d="M8 9h8"></path>
        <path d="M12 4v10"></path>
        <path d="M9 17l3 4 3-4"></path>
      </svg>
    }
    title="Taglio Bambino"
    description="Taglio speciale per i più piccoli in un ambiente confortevole e divertente."
    price="Da CHF 20"
    user={user}
  />

  {/* Trattamenti Speciali */}
  <ServiceCard
    icon={
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-white">
        <path d="M7 7h10v10H7z"></path>
        <path d="M3 10h4"></path>
        <path d="M17 10h4"></path>
        <path d="M10 3v4"></path>
        <path d="M10 17v4"></path>
        <path d="m16 16-2.5-2.5"></path>
        <path d="M16 8 8 16"></path>
        <path d="m14 14 6 6"></path>
      </svg>
    }
    title="Trattamenti Speciali"
    description="Trattamenti personalizzati per capelli e cuoio capelluto con prodotti professionali."
    price="Da CHF 35"
    user={user}
  />

  {/* CTA Card */}
  <div className="bg-[var(--accent)] p-6 rounded-lg shadow-lg text-white transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden cta-card">
    <div className="absolute inset-0 bg-white opacity-0 animate-pulse-slow"></div>
    <div className="relative z-10">
      <h3 className="text-xl font-bold mb-4 text-white">Prenota Ora</h3>
      <p className="mb-6 text-white">Scegli il servizio e prenota il tuo appuntamento in pochi click.</p>
      <Link
        to={user ? "/booking" : "/guest-booking"}
        className="inline-block bg-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all hover:shadow-md cta-button"
      >
        Prenota
      </Link>
    </div>
  </div>
</div>
        </div>
      </section>

      {/* About Section with Parallax and Image Reveal */}
      <section
        id="about"
        ref={sectionRefs.about}
        className={`py-20 px-4 bg-[var(--bg-primary)] transition-all duration-1000 ${getAnimationClass('about')}`}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <div className="relative mb-4">
                <div className="w-16 h-1 bg-[var(--accent)]"></div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--accent)]">
                Il Nostro Salone
              </h2>
              <p className="mb-4 text-lg text-[var(--text-primary)] text-opacity-80">
                Your Style Barber Studio è sinonimo di eleganza e professionalità.
              </p>
              <p className="mb-6 text-lg text-[var(--text-primary)] text-opacity-80">
                La nostra missione è offrire un'esperienza unica, combinando tecniche tradizionali con le ultime tendenze per garantire risultati impeccabili.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-[var(--bg-secondary)] p-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-[var(--accent)] mr-2" />
                    <span className="font-medium">Orari</span>
                  </div>
                  <p className="text-sm">Lunedì: 14:00-19:00</p>
                  <p className="text-sm">Mar-Sab: 9:00-19:00</p>
                </div>
                <div className="bg-[var(--bg-secondary)] p-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center mb-2">
                    <Award className="w-5 h-5 text-[var(--accent)] mr-2" />
                    <span className="font-medium">Qualità</span>
                  </div>
                  <p className="text-sm">Barbieri Certificati</p>
                  <p className="text-sm">Prodotti Premium</p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 rounded-lg overflow-hidden shadow-xl relative group">
              {/* Image wrapper with hover effect */}
              <div className="relative overflow-hidden transform transition-transform duration-700 hover:scale-105">
                <img
                  src="/barber-shop.jpg"
                  alt="Your Style Barber Studio"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              </div>
              {/* Decorative borders */}
              <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-[var(--accent)] opacity-70"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-[var(--accent)] opacity-70"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section with Modern Card Design */}
      <section
        id="testimonials"
        ref={sectionRefs.testimonials}
        className={`py-20 px-4 bg-[var(--bg-secondary)] transition-all duration-1000 ${getAnimationClass('testimonials')}`}
      >
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[var(--accent)]">
            Cosa Dicono i Clienti
          </h2>
          <p className="text-center max-w-2xl mx-auto mb-12 text-[var(--text-primary)] opacity-80">
            Le opinioni di chi ha scelto la nostra esperienza e professionalità
          </p>

          {/* Desktop Testimonials - Grid Layout */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative">
                <div className="absolute -top-2 -left-2 text-5xl text-[var(--accent)] opacity-20">"</div>
                <p className="italic relative z-10 mb-6 text-[var(--text-primary)] text-opacity-80">
                  "Santiago è assolutamente il miglior barbiere in città. Un ragazzo disponibile, simpatico ma soprattutto tanto professionale. Straconsiglio di provare un taglio da lui!"
                </p>
              </div>
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">MF</div>
                </div>
                <div>
                  <h3 className="font-bold">Marco Felaco</h3>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative">
                <div className="absolute -top-2 -left-2 text-5xl text-[var(--accent)] opacity-20">"</div>
                <p className="italic relative z-10 mb-6 text-[var(--text-primary)] text-opacity-80">
                  "Bravi! Mio figlio L. è sempre contento e anche i suoi amici si sono trovati bene."
                </p>
              </div>
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">RG</div>
                </div>
                <div>
                  <h3 className="font-bold">Rossana Galli</h3>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative">
                <div className="absolute -top-2 -left-2 text-5xl text-[var(--accent)] opacity-20">"</div>
                <p className="italic relative z-10 mb-6 text-[var(--text-primary)] text-opacity-80">
                  "Porto i ragazzi e sono sempre soddisfatti.
                  professionale e sempre gentile, luogo pulito."
                </p>
              </div>
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">RM</div>
                </div>
                <div>
                  <h3 className="font-bold">Rossano Mantegazzi</h3>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Testimonials - Carousel/Slider */}
          <div className="md:hidden">
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {/* Testimonial 1 */}
                <div className="w-full flex-shrink-0 p-2">
                  <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg">
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 text-5xl text-[var(--accent)] opacity-20">"</div>
                      <p className="italic relative z-10 mb-6 text-[var(--text-primary)] text-opacity-80">
                        "Santiago è assolutamente il miglior barbiere in città. Un ragazzo disponibile, simpatico ma soprattutto tanto professionale."
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">MF</div>
                      </div>
                      <div>
                        <h3 className="font-bold">Marco Felaco</h3>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="w-full flex-shrink-0 p-2">
                  <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg">
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 text-5xl text-[var(--accent)] opacity-20">"</div>
                      <p className="italic relative z-10 mb-6 text-[var(--text-primary)] text-opacity-80">
                        "Bravi! Mio figlio L. è sempre contento e anche i suoi amici si sono trovati bene."
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">RG</div>
                      </div>
                      <div>
                        <h3 className="font-bold">Rossana Galli</h3>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial 3 */}
                <div className="w-full flex-shrink-0 p-2">
                  <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg">
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 text-5xl text-[var(--accent)] opacity-20">"</div>
                      <p className="italic relative z-10 mb-6 text-[var(--text-primary)] text-opacity-80">
                        "Porto i ragazzi e sono sempre soddisfatti. Professionale e sempre gentile, luogo pulito."
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">RM</div>
                      </div>
                      <div>
                        <h3 className="font-bold">Rossano Mantegazzi</h3>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dots navigation for testimonials */}
            <div className="flex justify-center mt-6 space-x-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeTestimonial === index
                      ? 'bg-[var(--accent)]'
                      : 'bg-gray-400 opacity-50'
                  }`}
                  aria-label={`Testimonianza ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section with Map Animation */}
      <section
        id="contact"
        ref={sectionRefs.contact}
        className={`py-20 px-4 bg-[var(--bg-primary)] transition-all duration-1000 ${getAnimationClass('contact')}`}
      >
       <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[var(--accent)]">
          Dove Trovarci
        </h2>
        <p className="text-center max-w-2xl mx-auto mb-12 text-[var(--text-primary)] opacity-80">
          Siamo facilmente raggiungibili nel centro di Lugano
        </p>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/2">
            <div className="bg-[var(--bg-secondary)] p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold mb-6 text-[var(--accent)]">Contatti</h3>

              <div className="space-y-6">
                {/* Indirizzo */}
                <div className="flex items-start transform hover:translate-x-1 transition-transform duration-300">
                  <div className="service-icon-wrapper">
                    <MapPin
                      className="icon-white"
                      style={{
                        color: 'white',
                        fill: 'none',
                        stroke: 'white',
                        strokeWidth: 2.5
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Indirizzo</p>
                    <p className="text-[var(--text-primary)] text-opacity-80">Via Zurigo 2, 6900 Lugano</p>
                  </div>
                </div>

                {/* Orari */}
                <div className="flex items-start transform hover:translate-x-1 transition-transform duration-300">
                  <div className="service-icon-wrapper">
                    <Clock
                      className="icon-white"
                      style={{
                        color: 'white',
                        fill: 'none',
                        stroke: 'white',
                        strokeWidth: 2.5
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Orari</p>
                    <p className="text-[var(--text-primary)] text-opacity-80">Lunedì: 14:00 - 19:00</p>
                    <p className="text-[var(--text-primary)] text-opacity-80">Martedì - Sabato: 9:00 - 19:00</p>
                    <p className="text-[var(--text-primary)] text-opacity-80">Domenica: Chiuso</p>
                  </div>
                </div>

                {/* Telefono */}
                <div className="flex items-start transform hover:translate-x-1 transition-transform duration-300">
                  <div className="service-icon-wrapper">
                    <Phone
                      className="icon-white"
                      style={{
                        color: 'white',
                        fill: 'none',
                        stroke: 'white',
                        strokeWidth: 2.5
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Telefono</p>
                    <p className="text-[var(--text-primary)] text-opacity-80">+41 78 930 15 99</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start transform hover:translate-x-1 transition-transform duration-300">
                  <div className="service-icon-wrapper">
                    <Mail
                      className="icon-white"
                      style={{
                        color: 'white',
                        fill: 'none',
                        stroke: 'white',
                        strokeWidth: 2.5
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Email</p>
                    <p className="text-[var(--text-primary)] text-opacity-80">barbershopyourstyle@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to={user ? "/booking" : "/guest-booking"}
                  className="inline-block bg-[var(--accent)] text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-all hover:shadow-lg transform hover:-translate-y-1"
                >
                  Prenota Ora
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            {/* Google Maps iframe with hover effect */}
            <div className="w-full h-96 rounded-lg shadow-lg overflow-hidden relative group">
              <div className="absolute inset-0 border-2 border-[var(--accent)] border-opacity-0 group-hover:border-opacity-50 rounded-lg transition-all duration-500 z-10"></div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2769.1762082072193!2d8.956452376757941!3d46.01143121224133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478433f211495255%3A0x2b7199e7a5d952f!2sYour%20Style%20Barber%20Shop!5e0!3m2!1sen!2sit!4v1709978855831!5m2!1sen!2sit"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Your Style Barber Shop Location"
                className="group-hover:opacity-90 transition-opacity"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Modern Footer with Animation */}
      <footer className="bg-[var(--bg-secondary)] py-12 px-4 border-t border-[var(--accent)] border-opacity-20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h2 className="text-2xl font-bold text-[var(--accent)] hover:text-opacity-80 transition-colors duration-300">
                Your Style Barber Studio
              </h2>
              <p className="mt-2 text-[var(--text-primary)] opacity-80">Il tuo stile, la nostra passione</p>
            </div>

            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/yourstylelugano/?igsh=bzdocHJ5Y2dnbTJz#"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--bg-primary)] p-3 rounded-full hover:bg-[var(--accent)] hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--bg-primary)] p-3 rounded-full hover:bg-[var(--accent)] hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://wa.me/41789301599?text=Ciao!%20Vorrei%20richiedere%20un%27informazioni"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--bg-primary)] p-3 rounded-full hover:bg-[var(--accent)] hover:text-white transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-[var(--accent)]">Menu rapido</h3>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('services')} className="block hover:text-[var(--accent)] transition-colors">Servizi</button>
                <button onClick={() => scrollToSection('about')} className="block hover:text-[var(--accent)] transition-colors">Chi siamo</button>
                <button onClick={() => scrollToSection('testimonials')} className="block hover:text-[var(--accent)] transition-colors">Recensioni</button>
                <button onClick={() => scrollToSection('contact')} className="block hover:text-[var(--accent)] transition-colors">Contatti</button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 text-[var(--accent)]">Servizi</h3>
              <div className="space-y-2">
                <Link to={user ? "/booking" : "/guest-booking"} className="block hover:text-[var(--accent)] transition-colors">Taglio di Capelli</Link>
                <Link to={user ? "/booking" : "/guest-booking"} className="block hover:text-[var(--accent)] transition-colors">Barba</Link>
                <Link to={user ? "/booking" : "/guest-booking"} className="block hover:text-[var(--accent)] transition-colors">Taglio + Barba</Link>
                <Link to={user ? "/booking" : "/guest-booking"} className="block hover:text-[var(--accent)] transition-colors">Trattamenti Speciali</Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 text-[var(--accent)]">Orari di apertura</h3>
              <div className="space-y-2 text-[var(--text-primary)] opacity-80">
                <p>Lunedì: 14:00 - 19:00</p>
                <p>Martedì - Venerdì: 9:00 - 19:00</p>
                <p>Sabato: 9:00 - 19:00</p>
                <p>Domenica: Chiuso</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--text-primary)] border-opacity-10 pt-6 text-center">
  <p className="text-sm text-[var(--text-primary)] opacity-70">&copy; {new Date().getFullYear()} Your Style Barber Studio. Tutti i diritti riservati.</p>

  {/* Replace the old button with our new enhanced component */}
  <DCreativoPromoLink
    onClick={() => {
      setShowDCreativoPromo(true);
      scrollToDCreativoSection();
    }}
  />
</div>
</div>
</footer>

{/* DCreativo Footer Promo Section */}
<style dangerouslySetInnerHTML={{ __html: dCreativoStyles }} />
<div className={`transition-all duration-500 ${showDCreativoPromo ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
  <DCreativoFooterPromo ref={handleDCreativoSectionRef} />
</div>
</div>
);
});

export default HomePage;
