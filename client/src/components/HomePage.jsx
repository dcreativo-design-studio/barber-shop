import { Award, Clock, Facebook, Instagram, MapPin, MessageCircle, Scissors, Star } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = React.memo(() => {
  const { user } = useAuth();

  // Scroll to section
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page min-h-screen">
    {/* Hero Section Ottimizzata */}
<section className="hero-section min-h-screen flex items-center justify-center relative py-20 px-4 overflow-hidden stabilize-render">
  {/* Container per lo sfondo con nuove classi */}
  <div className="absolute inset-0 z-0">
    {/* Immagine di sfondo ad alta risoluzione con classe ottimizzata */}
    <div
      className="hero-image high-quality-image"
      style={{
        backgroundImage: 'url("/shot-img2.png")',
        backgroundPosition: 'left center',
      }}
    ></div>

    {/* Overlay per tema scuro con classi ottimizzate */}
    <div className="hero-overlay-dark"></div>

    {/* Overlay per tema chiaro con classi ottimizzate */}
    <div className="hero-overlay-light"></div>

    {/* Effetto vignetta per migliorare la leggibilità sui bordi */}
    <div className="absolute inset-0 z-0 box-shadow-vignette opacity-60"></div>
  </div>

  {/* Contenuto della hero section con classi ottimizzate */}
  <div className="container mx-auto text-center max-w-5xl relative z-10">
    {/* Titolo con classe ottimizzata per l'effetto glow */}
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-accent-glow animate-fade-in hover-scale">
      Your Style Barber Studio
    </h1>

    {/* Sottotitolo con classe ottimizzata per il testo */}
    <p className="text-xl md:text-2xl mb-10 animate-fade-in text-enhanced font-medium">
      Il tuo stile, la nostra passione
    </p>

    <div className="mt-10 animate-slide-in">
      {user ? (
        <div className="space-y-6">
          <p className="text-xl text-accent-glow font-medium">
            Bentornato, {user.firstName}!
          </p>
          <div>
            {user.role === 'admin' ? (
              <Link
                to="/admin"
                className="button-enhanced"
              >
                Dashboard Admin
              </Link>
            ) : user.role === 'barber' ? (
              <Link
                to="/barber"
                className="button-enhanced"
              >
                Pannello Barbiere
              </Link>
            ) : (
              <Link
                to="/booking"
                className="button-enhanced"
              >
                Prenota Ora
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-xl mb-6 text-enhanced font-medium">
            Prenota il tuo appuntamento oggi stesso
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="button-enhanced"
            >
              Accedi
            </Link>
            <Link
              to="/register"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Registrati
            </Link>
            <Link
              to="/guest-booking"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Prenota come ospite
            </Link>
          </div>
        </div>
      )}
    </div>

    <div className="mt-12">
      <button
        onClick={() => scrollToSection('services')}
        className="text-accent-glow hover:text-white transition-colors flex items-center gap-2 mx-auto font-medium"
      >
        Scopri di più
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce-custom">
          <path d="M7 13l5 5 5-5"></path>
          <path d="M7 6l5 5 5-5"></path>
        </svg>
      </button>
    </div>
  </div>
</section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 bg-[var(--bg-secondary)]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[var(--accent)]">
            I Nostri Servizi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg hover-scale">
              <div className="flex items-center mb-4">
                <Scissors className="w-8 h-8 text-[var(--accent)] mr-3" />
                <h3 className="text-xl font-bold">Taglio di Capelli</h3>
              </div>
              <p className="mb-4">Taglio professionale personalizzato in base alla forma del viso e alle preferenze personali.</p>
              <p className="text-[var(--accent)] font-bold">Da CHF 30</p>
            </div>

            {/* Service 2 */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg hover-scale">
              <div className="flex items-center mb-4">
                <Scissors className="w-8 h-8 text-[var(--accent)] mr-3" />
                <h3 className="text-xl font-bold">Barba</h3>
              </div>
              <p className="mb-4">Rifinitura e modellamento della barba, con trattamento rilassante e prodotti di qualità.</p>
              <p className="text-[var(--accent)] font-bold">Da CHF 25</p>
            </div>

            {/* Service 3 */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg hover-scale">
              <div className="flex items-center mb-4">
                <Scissors className="w-8 h-8 text-[var(--accent)] mr-3" />
                <h3 className="text-xl font-bold">Taglio + Barba</h3>
              </div>
              <p className="mb-4">Combinazione di taglio di capelli e rifinitura della barba per un look completo.</p>
              <p className="text-[var(--accent)] font-bold">Da CHF 50</p>
            </div>

            {/* Service 4 */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg hover-scale">
              <div className="flex items-center mb-4">
                <Scissors className="w-8 h-8 text-[var(--accent)] mr-3" />
                <h3 className="text-xl font-bold">Taglio Bambino</h3>
              </div>
              <p className="mb-4">Taglio speciale per i più piccoli in un ambiente confortevole e divertente.</p>
              <p className="text-[var(--accent)] font-bold">Da CHF 20</p>
            </div>

            {/* Service 5 */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg hover-scale">
              <div className="flex items-center mb-4">
                <Scissors className="w-8 h-8 text-[var(--accent)] mr-3" />
                <h3 className="text-xl font-bold">Trattamenti Speciali</h3>
              </div>
              <p className="mb-4">Trattamenti personalizzati per capelli e cuoio capelluto con prodotti professionali.</p>
              <p className="text-[var(--accent)] font-bold">Da CHF 35</p>
            </div>

            {/* CTA Card */}
            <div className="bg-[var(--accent)] p-6 rounded-lg shadow-lg text-white hover-scale">
              <h3 className="text-xl font-bold mb-4">Prenota Ora</h3>
              <p className="mb-6">Scegli il servizio e prenota il tuo appuntamento in pochi click.</p>
              <Link
                to={user ? "/booking" : "/guest-booking"}
                className="inline-block bg-white text-[var(--accent)] font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Prenota
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 bg-[var(--bg-primary)]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--accent)]">
                Il Nostro Salone
              </h2>
              <p className="mb-4 text-lg">
                Your Style Barber Studio è sinonimo di eleganza e professionalità.
              </p>
              <p className="mb-6 text-lg">
                La nostra missione è offrire un'esperienza unica, combinando tecniche tradizionali con le ultime tendenze per garantire risultati impeccabili.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-[var(--accent)] mr-2" />
                  <span>Lun-Sab: 9:00-19:00</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-[var(--accent)] mr-2" />
                  <span>Barbieri Certificati</span>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 rounded-lg overflow-hidden shadow-xl">
              {/* Actual barber shop image */}
              <img
                src="/barber-shop.jpg"
                alt="Your Style Barber Studio"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-4 bg-[var(--bg-secondary)]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[var(--accent)]">
            Cosa Dicono i Clienti
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-gray-500"></div>
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
              <p className="italic">
                "Santiago è assolutamente il miglior barbiere in città. Un ragazzo disponibile, simpatico ma soprattutto tanto professionale. Straconsiglio di provare un taglio da lui!"
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-gray-500"></div>
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
              <p className="italic">
                "Bravi! Mio figlio L. è sempre contento e anche i suoi amici si sono trovati bene."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-gray-500"></div>
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
              <p className="italic">
                "Porto i ragazzi e sono sempre soddisfatti.
                professionale e sempre gentile, luogo pulito."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-[var(--bg-primary)]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[var(--accent)]">
            Dove Trovarci
          </h2>

          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Contatti</h3>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-[var(--accent)] mr-3 mt-1" />
                    <div>
                      <p className="font-bold">Indirizzo</p>
                      <p>Via Zurigo 2, 6900 Lugano</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-[var(--accent)] mr-3 mt-1" />
                    <div>
                      <p className="font-bold">Orari</p>
                      <p>Lunedì: 14:00 - 19:00</p>
                      <p>Martedì - Sabato: 9:00 - 19:00</p>
                      <p>Domenica: Chiuso</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MessageCircle className="w-5 h-5 text-[var(--accent)] mr-3 mt-1" />
                    <div>
                      <p className="font-bold">Contattaci</p>
                      <p>Tel: +41 78 930 15 99</p>
                      <p>Email: barbershopyourstyle@gmail.com</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to={user ? "/booking" : "/guest-booking"}
                    className="inline-block bg-[var(--accent)] text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-all"
                  >
                    Prenota Ora
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              {/* Google Maps iframe */}
              <div className="w-full h-80 rounded-lg shadow-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2769.1762082072193!2d8.956452376757941!3d46.01143121224133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478433f211495255%3A0x2b7199e7a5d952f!2sYour%20Style%20Barber%20Shop!5e0!3m2!1sen!2sit!4v1709978855831!5m2!1sen!2sit"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Your Style Barber Shop Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--bg-secondary)] py-8 px-4 border-t border-[var(--accent)] border-opacity-20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-[var(--accent)]">Your Style Barber Studio</h2>
              <p className="mt-2">Il tuo stile, la nostra passione</p>
            </div>

            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/yourstylelugano/?igsh=bzdocHJ5Y2dnbTJz#"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--bg-primary)] p-2 rounded-full hover:bg-[var(--accent)] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--bg-primary)] p-2 rounded-full hover:bg-[var(--accent)] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://wa.me/41789301599?text=Ciao!%20Vorrei%20richiedere%20un%27informazioni"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--bg-primary)] p-2 rounded-full hover:bg-[var(--accent)] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--text-primary)] border-opacity-10 text-center">
            <p>&copy; 2025 Your Style Barber Studio. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
});

export default HomePage;
