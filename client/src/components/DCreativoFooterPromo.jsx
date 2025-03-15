import { ArrowRight, Award, CheckCircle, Code, ExternalLink, Rocket, Zap } from 'lucide-react';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../config/api';
import { useTransition } from '../context/TransitionContext';

// Enhanced DCreativo Footer Promo Component
const DCreativoFooterPromo = forwardRef((props, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'booking',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { startTransition } = useTransition();

  // Animation state and refs
  const [animationsLoaded, setAnimationsLoaded] = useState(false);
  const animatedElements = useRef([]);
  const observerRef = useRef(null);

  // Initialize animations
  useEffect(() => {
    setTimeout(() => {
      setAnimationsLoaded(true);

      // Setup intersection observer for staggered entrances
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add('footer-elem-visible');
              }, idx * 100);
              observerRef.current.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      // Observe all staggered elements
      document.querySelectorAll('.footer-elem').forEach((el) => {
        if (observerRef.current) {
          observerRef.current.observe(el);
        }
      });
    }, 300);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Reset form and status when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      // Reset after modal closes
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          interest: 'booking',
          message: ''
        });
        setSubmitStatus(null);
      }, 300);
    } else {
      // Add body class to prevent scrolling when modal is open
      document.body.classList.add('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isModalOpen]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Usa l'istanza axios già configurata con i giusti headers e baseURL
      const response = await apiRequest.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        interest: formData.interest,
        message: formData.message
      });

      setSubmitStatus('success');
      // Chiudi il modal dopo 3 secondi in caso di successo
      setTimeout(() => {
        setIsModalOpen(false);
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      console.error('Errore invio email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle navigation to marketing page with transition effects
  const handleNavigateToMarketing = () => {
    // Trigger transition animation
    if (startTransition) {
      startTransition();
    }

    // Add a visual cue for the transition
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay active';
    document.body.appendChild(overlay);

    // Delay navigation slightly to allow for visual transition
    setTimeout(() => {
      // If we're already on the marketing page, just scroll to top with animation
      if (location.pathname === '/marketing-barber-system') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        // Remove the overlay after scrolling
        setTimeout(() => {
          overlay.remove();
        }, 600);
      } else {
        // Otherwise navigate to the marketing page
        navigate('/marketing-barber-system');

        // The overlay will be removed by the destination component
        // after it completes loading and transitions in
      }
    }, 300);
  };

  return (
    <div ref={ref} className="dcreativo-footer-promo border-t border-[var(--accent)] border-opacity-20 py-8 px-4 bg-[var(--bg-secondary)]">
      <div className="container mx-auto max-w-6xl relative overflow-hidden">
        {/* Floating background elements for visual interest */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full opacity-5 blur-3xl animate-float-slow pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500 rounded-full opacity-5 blur-3xl animate-float-medium pointer-events-none"></div>

        {/* DCreativo Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-[var(--text-primary)] border-opacity-10 relative">
          <div className="mb-6 md:mb-0 text-center md:text-left footer-elem">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <div
                className="w-12 h-12 mr-3 rounded-full overflow-hidden flex items-center justify-center bg-gray-900 p-0.5 transform transition-all duration-500 hover:scale-110"
                style={{
                  background: "linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)",
                }}
              >
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                  <img
                    src="/dcreativo-logo.png"
                    alt="DCreativo Logo"
                    className="w-[90%] h-[90%] object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='50' fill='%23222'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='40' text-anchor='middle' fill='%2300CCFF'%3ED%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-[var(--accent)] to-purple-400">
                DCreativo Solutions
              </h3>
            </div>
            <p className="text-[var(--text-primary)] opacity-80 max-w-md">
              Trasformiamo le tue idee in applicazioni web professionali, offrendo soluzioni personalizzate per la tua attività.
            </p>
          </div>

          <div className="footer-elem">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative overflow-hidden bg-[var(--accent)] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center"
            >
              <span className="relative z-10 flex items-center">
                <Rocket className="w-5 h-5 mr-2" />
                Richiedi Informazioni
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
            </button>
          </div>
        </div>

        {/* Enhanced call-to-action with improved animations */}
        <div className="mt-8 mb-12 footer-elem">
          <button
            onClick={handleNavigateToMarketing}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-500 shadow-xl hover:shadow-2xl flex items-center mx-auto transform hover:scale-105 active:scale-95"
            style={{
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
            }}
          >
            <span className="relative z-10 flex items-center">
              <Zap className="w-6 h-6 mr-3 animate-pulse-subtle" />
              <span className="text-xl">Scopri il sistema di prenotazioni</span>
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-500" />
            </span>
            {/* Visual effects for enhanced UI */}
            <span className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
            <span className="absolute inset-0 border-2 border-blue-300 rounded-lg opacity-50 animate-pulse-subtle"></span>
            {/* Shine effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></span>
          </button>

          {/* Visual indicator for direction */}
          <div className="flex justify-center mt-4 opacity-60">
            <ArrowRight className="w-4 h-4 animate-bounce-subtle" />
          </div>
        </div>

        {/* Services Highlights with improved animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Sviluppo Web",
              desc: "Siti web responsive e applicazioni ottimizzate per tutte le piattaforme.",
              icon: <Code className="icon-white w-5 h-5" />
            },
            {
              title: "Sistemi di Prenotazione",
              desc: "Soluzioni avanzate per la gestione degli appuntamenti per il tuo business.",
              icon: <Zap className="icon-white w-5 h-5" />
            },
            {
              title: "Design Personalizzato",
              desc: "Interfacce intuitive e accattivanti su misura per il tuo brand.",
              icon: <Award className="icon-white w-5 h-5" />
            },
            {
              title: "Supporto Continuo",
              desc: "Assistenza tecnica e aggiornamenti per mantenere la tua applicazione sempre efficiente.",
              icon: <CheckCircle className="icon-white w-5 h-5" />
            }
          ].map((service, index) => (
            <div
              key={index}
              className="service-card group p-4 rounded-lg bg-[var(--bg-primary)] hover:shadow-md transition-all duration-500 transform hover:-translate-y-2 footer-elem"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center mb-3">
                <div className="service-icon-wrapper mr-3 bg-blue-600 bg-opacity-20 p-2 rounded-full transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                  {service.icon}
                </div>
                <h4 className="font-bold">{service.title}</h4>
              </div>
              <p className="text-sm text-[var(--text-primary)] text-opacity-80">
                {service.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Info with animations */}
        <div className="text-center footer-elem">
          <p className="text-[var(--text-primary)] opacity-80 mb-4">
            Vuoi saperne di più sui nostri servizi di sviluppo web?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="mailto:info@dcreativo.ch"
              className="flex items-center hover:text-[var(--accent)] transition-colors transform transition-transform hover:scale-105"
            >
              <span>info@dcreativo.ch</span>
            </a>
            <span className="hidden sm:block text-[var(--text-primary)] opacity-40">|</span>
            <a
              href="tel:+41767810194"
              className="flex items-center hover:text-[var(--accent)] transition-colors transform transition-transform hover:scale-105"
            >
              <span>+41 76 781 01 94</span>
            </a>
            <span className="hidden sm:block text-[var(--text-primary)] opacity-40">|</span>
            <a
              href="https://www.dcreativo.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-[var(--accent)] transition-colors transform transition-transform hover:scale-105"
            >
              <span>www.dcreativo.ch</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <a
              href="https://barbershop.dcreativo.ch/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[var(--accent)] hover:underline text-sm flex items-center font-medium transform hover:translate-x-1 transition-transform"
            >
              <span>Vedi la demo del sistema di prenotazioni</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </a>
            <span className="hidden sm:block text-[var(--text-primary)] opacity-40">|</span>
            <button
              onClick={handleNavigateToMarketing}
              className="inline-block text-[var(--accent)] hover:underline text-sm flex items-center font-medium transform hover:translate-x-1 transition-transform"
            >
              <span>Scopri tutti i vantaggi del sistema</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>

        {/* Info Request Modal with enhanced animations */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div
              className="bg-[var(--bg-primary)] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full opacity-5 transform translate-x-1/3 -translate-y-1/3 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full opacity-5 transform -translate-x-1/3 translate-y-1/3 blur-2xl"></div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[var(--accent)]">Richiedi Informazioni</h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors bg-[var(--bg-secondary)] hover:bg-opacity-80 p-2 rounded-full transform hover:rotate-90 transition-transform"
                      aria-label="Chiudi"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Form with success state */}
                  {submitStatus === 'success' ? (
                    <div className="py-10 px-6 text-center animate-fadeIn">
                      <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce-subtle">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold mb-2">Richiesta inviata con successo!</h4>
                      <p className="text-[var(--text-primary)] opacity-80 mb-6">
                        Ti contatteremo al più presto per discutere del tuo progetto.
                      </p>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="mt-2 bg-[var(--accent)] text-white font-medium py-2 px-4 rounded-lg transition-all hover:bg-opacity-90 transform hover:scale-105 active:scale-95"
                      >
                        Chiudi
                      </button>
                    </div>
                  ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          {
                            label: "Nome e Cognome",
                            type: "text",
                            name: "name",
                            placeholder: "Inserisci il tuo nome",
                            required: true
                          },
                          {
                            label: "Email",
                            type: "email",
                            name: "email",
                            placeholder: "La tua email",
                            required: true
                          },
                          {
                            label: "Telefono",
                            type: "tel",
                            name: "phone",
                            placeholder: "Il tuo numero di telefono",
                            required: true
                          }
                        ].map((field, index) => (
                          <div key={index} className="relative group">
                            <label className="block text-sm font-medium mb-1 group-focus-within:text-[var(--accent)] transition-colors">
                              {field.label}
                            </label>
                            <input
                              type={field.type}
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleInputChange}
                              className="w-full p-2 border border-gray-300 rounded-md bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                              placeholder={field.placeholder}
                              required={field.required}
                            />
                          </div>
                        ))}

                        <div>
                          <label className="block text-sm font-medium mb-1">Sono interessato a</label>
                          <select
                            name="interest"
                            value={formData.interest}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                          >
                            <option value="booking">Sistema di Prenotazioni</option>
                            <option value="website">Sito Web</option>
                            <option value="webapp">Applicazione Web</option>
                            <option value="ecommerce">E-commerce</option>
                            <option value="other">Altro</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Messaggio</label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-[var(--bg-secondary)] min-h-20 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                            placeholder="Descrivi brevemente le tue esigenze"
                            required
                          ></textarea>
                        </div>
                      </div>

                      {/* Status messages */}
                      {submitStatus === 'error' && (
                        <div className="p-3 bg-red-100 text-red-800 rounded-md animate-fadeIn">
                          <p className="flex items-start">
                            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Si è verificato un errore. Riprova o contattaci direttamente via email.
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-[var(--accent)] text-white font-bold py-2 px-4 rounded-md transition-all duration-300 ${
                          isSubmitting
                            ? 'opacity-70 cursor-not-allowed'
                            : 'hover:bg-opacity-90 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Invio in corso...
                          </div>
                        ) : 'Invia Richiesta'}
                      </button>
                    </form>
                  )}

                  <p className="mt-4 text-xs text-[var(--text-primary)] opacity-60 text-center">
                    I tuoi dati saranno trattati nel rispetto della privacy e utilizzati solo per rispondere alla tua richiesta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});


export default DCreativoFooterPromo;
