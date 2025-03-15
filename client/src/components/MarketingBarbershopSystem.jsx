import { ArrowRight, BarChart2, Calendar, Check, Clock, DollarSign, Globe, Mail, Phone, ShieldCheck, User, Users } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '../config/api';
import { useTransition } from '../context/TransitionContext';

const MarketingBarbershopSystem = () => {
  const [activeTab, setActiveTab] = useState('features');
  const [activeFeature, setActiveFeature] = useState('booking');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    salonName: '',
    message: '',
    privacyAccepted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const location = useLocation();
  const { completeTransition } = useTransition();

  // Refs for sections to enable smooth scrolling
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const roiRef = useRef(null);
  const pricingRef = useRef(null);

  // Refs for entrance animations
  const staggeredRefs = useRef([]);
  const observerRef = useRef(null);

  // Animation state
  const [animationsLoaded, setAnimationsLoaded] = useState(false);

  // Scroll to top and setup animations on component mount
  useEffect(() => {
    window.scrollTo(0, 0);

    // Complete any transitions in progress
    if (completeTransition) {
      // Forzare la chiamata con un leggero ritardo per assicurarsi che venga eseguita dopo il render
      setTimeout(() => {
        completeTransition();
      }, 200);
    }

    // Setup entrance animations with a slight delay
    setTimeout(() => {
      setAnimationsLoaded(true);

      // Setup hero animations
      const heroElements = document.querySelectorAll('.hero-element');
      heroElements.forEach((el, index) => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(30px)';

        setTimeout(() => {
          el.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
          el.style.opacity = 1;
          el.style.transform = 'translateY(0)';
        }, 300 + (index * 200));
      });

      // Setup intersection observer for staggered entrances
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
              // Add a staggered delay based on the element's position
              setTimeout(() => {
                entry.target.classList.add('staggered-entrance-visible');
              }, idx * 100);

              // Unobserve after animation is triggered
              observerRef.current.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      // Observe all staggered elements
      document.querySelectorAll('.staggered-entrance').forEach((el) => {
        if (observerRef.current) {
          observerRef.current.observe(el);
        }
      });
    }, 100);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [completeTransition]);

  // Handle URL hash navigation
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['features', 'benefits', 'roi', 'testimonials', 'pricing'].includes(hash)) {
      setActiveTab(hash);

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const sectionRefs = {
          features: featuresRef,
          benefits: benefitsRef,
          roi: roiRef,
          pricing: pricingRef
        };

        if (sectionRefs[hash]?.current) {
          sectionRefs[hash].current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 300);
    }
  }, [location]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isContactFormOpen) {
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          salonName: '',
          message: '',
          privacyAccepted: false
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
  }, [isContactFormOpen]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Funzione per gestire l'invio del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Usa l'istanza axios già configurata
      const response = await apiRequest.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        interest: 'booking-demo',
        message: `Nome salone: ${formData.salonName || 'Non specificato'}\n\n${formData.message}`
      });

      setSubmitStatus('success');
      // Chiudi form dopo un breve timeout in caso di successo
      setTimeout(() => {
        setIsContactFormOpen(false);
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      console.error('Errore invio email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tab navigation with smooth scrolling
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);

    const sectionRefs = {
      features: featuresRef,
      benefits: benefitsRef,
      roi: roiRef,
      pricing: pricingRef
    };

    if (sectionRefs[tabId]?.current) {
      sectionRefs[tabId].current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Array di funzionalità
  const features = [
    {
      id: 'booking',
      title: 'Sistema di Prenotazione Intelligente',
      description: 'Calcolo automatico degli slot disponibili basato sulla durata dei servizi, orari di lavoro e pause programmate.',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      id: 'notifications',
      title: 'Notifiche Automatiche',
      description: 'Invio automatico di conferme, promemoria e aggiornamenti via email, SMS e WhatsApp.',
      icon: <Clock className="w-6 h-6" />
    },
    {
      id: 'analytics',
      title: 'Statistiche e Analytics',
      description: 'Dashboard completa con metriche chiave e grafici per analizzare le performance del salone.',
      icon: <BarChart2 className="w-6 h-6" />
    },
    {
      id: 'management',
      title: 'Gestione Multi-livello',
      description: 'Pannelli dedicati per amministratori, barbieri e clienti con funzionalità specifiche.',
      icon: <Users className="w-6 h-6" />
    },
    {
      id: 'security',
      title: 'Protezione dei Dati',
      description: 'Sistema sicuro con protezione dei dati personali in conformità con le normative sulla privacy.',
      icon: <ShieldCheck className="w-6 h-6" />
    }
  ];

  // Array di testimonial
  const testimonials = [
    {
      name: 'Santiago',
      role: 'Proprietario - Your Style Barber Studio',
      quote: '(Aggiungere recensione di Santiago',
      image: '/barber-testimonial-1.jpg'
    },
  ];

  // Calcolo ROI
  const roiData = [
    { label: 'Prenotazioni mensili', before: 132, after: 158, increase: '20%' },
    { label: 'Ricavo mensile (CHF)', before: 5280, after: 6320, increase: '20%' },
    { label: 'No-show', before: '15%', after: '3%', decrease: '80%' },
    { label: 'Tempo risparmiato (ore/mese)', before: 0, after: 20, value: '20h' }
  ];

  return (
    <div className="marketing-barbershop-system bg-gray-50 text-gray-800">
      {/* Hero Section with enhanced animations */}
      <section ref={heroRef} id="hero" className="relative py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-800 text-white overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-white opacity-5 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-[40%] right-[10%] w-40 h-40 bg-blue-300 opacity-10 rounded-full blur-3xl animate-float-medium"></div>
          <div className="absolute bottom-[15%] left-[15%] w-24 h-24 bg-indigo-200 opacity-10 rounded-full blur-2xl animate-float-fast"></div>
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 hero-element">
                Sistema di Prenotazioni Online per Barber Shop
              </h1>
              <p className="text-xl mb-8 text-blue-100 hero-element">
                Automatizza la gestione degli appuntamenti, riduci i no-show e aumenta i tuoi profitti.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 hero-element">
                <button
                  onClick={() => setIsContactFormOpen(true)}
                  className="py-3 px-6 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center pulse-on-hover"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Richiedi una Demo
                </button>
                <a
                  href="https://barbershop.dcreativo.ch/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-6 bg-blue-500 bg-opacity-30 text-white font-bold rounded-lg border border-white border-opacity-30 hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center pulse-on-hover"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Vedi Demo Live
                </a>
              </div>
            </div>
            <div className="md:w-1/2 hero-element">
              <div className="relative transform transition-all duration-700 hover:scale-105">
                <div className="rounded-lg shadow-2xl overflow-hidden border-4 border-white border-opacity-20 relative">
                  {/* Shine effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-1500 transform -translate-x-full hover:translate-x-full"></div>
                  <img
                    src="/shot-14.png"
                    alt="Sistema di Prenotazioni per Barber Shop"
                    className="w-full h-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg width='600' height='400' viewBox='0 0 600 400' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='600' height='400' fill='%23718096'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='24' fill='white'%3EPreview dell'applicazione%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce-subtle">
                  ROI in 3-5 mesi!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nav Tabs - Enhanced sticky navigation */}
      <section id="nav-tabs" className="bg-white shadow sticky top-0 z-30 transition-all duration-300">
        <div className="container mx-auto max-w-5xl">
          <div className="flex overflow-x-auto py-4 px-4">
            <button
              id="features"
              onClick={() => handleTabClick('features')}
              className={`py-2 px-4 font-medium rounded-lg mr-2 whitespace-nowrap transition-all duration-300 relative ${
                activeTab === 'features'
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Funzionalità
              {activeTab === 'features' && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-b-lg animate-pulse-subtle"></span>
              )}
            </button>
            <button
              id="benefits"
              onClick={() => handleTabClick('benefits')}
              className={`py-2 px-4 font-medium rounded-lg mr-2 whitespace-nowrap transition-all duration-300 relative ${
                activeTab === 'benefits'
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Vantaggi
              {activeTab === 'benefits' && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-b-lg animate-pulse-subtle"></span>
              )}
            </button>
            <button
              id="roi"
              onClick={() => handleTabClick('roi')}
              className={`py-2 px-4 font-medium rounded-lg mr-2 whitespace-nowrap transition-all duration-300 relative ${
                activeTab === 'roi'
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              ROI
              {activeTab === 'roi' && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-b-lg animate-pulse-subtle"></span>
              )}
            </button>
            <button
              id="pricing"
              onClick={() => handleTabClick('pricing')}
              className={`py-2 px-4 font-medium rounded-lg whitespace-nowrap transition-all duration-300 relative ${
                activeTab === 'pricing'
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Preventivo
              {activeTab === 'pricing' && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-b-lg animate-pulse-subtle"></span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Features Tab */}
          {activeTab === 'features' && (
            <div ref={featuresRef} id="features-content" className="features-section tab-transition-enter-active">
              <h2 className="text-3xl font-bold text-center mb-6 staggered-entrance">Funzionalità Principali</h2>
              <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10 staggered-entrance">
                Il nostro sistema di prenotazioni è stato progettato specificamente per barber shop e saloni, con funzionalità avanzate che ottimizzano la gestione degli appuntamenti.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 staggered-entrance">
                {/* Feature Navigation Sidebar */}
                <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl">
                  <h3 className="text-xl font-bold mb-4 text-blue-600">Esplora le Funzionalità</h3>
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <button
                        key={feature.id}
                        onClick={() => setActiveFeature(feature.id)}
                        className={`w-full flex items-center p-3 rounded-lg transition-all duration-300 ${
                          activeFeature === feature.id
                            ? 'bg-blue-600 text-white transform scale-105 shadow-md'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className={`mr-3 transition-colors duration-300 ${activeFeature === feature.id ? 'text-white' : 'text-blue-600'}`}>
                          {feature.icon}
                        </div>
                        <span className="text-left">{feature.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feature Content with enhanced animations */}
                <div className="md:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
                  {features.map(feature => (
                    <div
                      key={feature.id}
                      className={`h-full transition-all duration-500 ${
                        activeFeature === feature.id
                          ? 'block opacity-100 transform scale-100'
                          : 'hidden opacity-0 transform scale-95'
                      }`}
                    >
                      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center p-6 overflow-hidden">
                        {/* Background patterns */}
                        <div className="absolute inset-0">
                          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
                          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-indigo-300 opacity-15 rounded-full blur-lg"></div>
                        </div>

                        <div className="bg-white bg-opacity-20 rounded-full p-6 transform transition-transform duration-700 hover:rotate-12 hover:scale-110">
                          <div className="text-white text-3xl">
                            {feature.icon}
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-4 text-blue-600">{feature.title}</h3>
                        <p className="text-gray-700 mb-6">{feature.description}</p>

                        {/* Feature-specific content with animations */}
                        {feature.id === 'booking' && (
                          <div className="space-y-3">
                            {[
                              "Prenotazioni 24/7 senza intervento manuale",
                              "Selezione barbiere, servizio, data e orario in pochi click",
                              "Gestione intelligente degli slot disponibili",
                              "Prenotazione come utente registrato o ospite"
                            ].map((text, index) => (
                              <div key={index} className="flex items-start transform transition-all duration-300 hover:-translate-y-1 hover:shadow-sm p-2 rounded-lg">
                                <Check className="text-green-500 w-5 h-5 mt-1 mr-2 flex-shrink-0" />
                                <p>{text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {feature.id === 'notifications' && (
                          <div className="space-y-3">
                            {[
                              "Conferme istantanee via email",
                              "Promemoria automatici 24 ore prima dell'appuntamento",
                              "Notifiche via SMS e WhatsApp (opzionale)",
                              "Avvisi per modifiche e cancellazioni"
                            ].map((text, index) => (
                              <div key={index} className="flex items-start transform transition-all duration-300 hover:-translate-y-1 hover:shadow-sm p-2 rounded-lg">
                                <Check className="text-green-500 w-5 h-5 mt-1 mr-2 flex-shrink-0" />
                                <p>{text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {feature.id === 'analytics' && (
                          <div className="space-y-3">
                            {[
                              "Dashboard con metriche chiave del business",
                              "Analisi dei servizi più richiesti",
                              "Identificazione delle fasce orarie più popolari",
                              "Report mensili e confronto con periodi precedenti"
                            ].map((text, index) => (
                              <div key={index} className="flex items-start transform transition-all duration-300 hover:-translate-y-1 hover:shadow-sm p-2 rounded-lg">
                                <Check className="text-green-500 w-5 h-5 mt-1 mr-2 flex-shrink-0" />
                                <p>{text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {feature.id === 'management' && (
                          <div className="space-y-3">
                            {[
                              "Pannello amministratore per il controllo completo",
                              "Pannello barbiere per gestire appuntamenti e orari",
                              "Area cliente per prenotazioni e storico appuntamenti",
                              "Gestione di servizi, prezzi e durate"
                            ].map((text, index) => (
                              <div key={index} className="flex items-start transform transition-all duration-300 hover:-translate-y-1 hover:shadow-sm p-2 rounded-lg">
                                <Check className="text-green-500 w-5 h-5 mt-1 mr-2 flex-shrink-0" />
                                <p>{text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {feature.id === 'security' && (
                          <div className="space-y-3">
                            {[
                              "Sistema conforme al GDPR",
                              "Backup automatici dei dati",
                              "Accesso sicuro con autenticazione",
                              "Hosting su server affidabili e sicuri"
                            ].map((text, index) => (
                              <div key={index} className="flex items-start transform transition-all duration-300 hover:-translate-y-1 hover:shadow-sm p-2 rounded-lg">
                                <Check className="text-green-500 w-5 h-5 mt-1 mr-2 flex-shrink-0" />
                                <p>{text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center mt-12 staggered-entrance">
                <button
                  onClick={() => setIsContactFormOpen(true)}
                  className="py-3 px-8 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto pulse-on-hover"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Richiedi una Demo Personalizzata
                </button>
              </div>
            </div>
          )}

          {/* Benefits Tab */}
          {activeTab === 'benefits' && (
            <div ref={benefitsRef} id="benefits-content" className="benefits-section tab-transition-enter-active">
              <h2 className="text-3xl font-bold text-center mb-12 staggered-entrance">Vantaggi per il Tuo Business</h2>
              <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10 staggered-entrance">
                Scopri come il nostro sistema di prenotazioni può trasformare il tuo barber shop, migliorando l'efficienza e aumentando i profitti.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {/* Growth Benefit - Enhanced with animations */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-600 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 staggered-entrance">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 transform transition-all duration-500 hover:rotate-12 hover:scale-110">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold">Crescita del Business</h3>
                  </div>
                  <ul className="space-y-2">
                    {[
                      "Incremento del 15-20% delle prenotazioni",
                      "Ottimizzazione dell'agenda con più appuntamenti",
                      "Riduzione dell'80% dei no-show"
                    ].map((text, index) => (
                      <li key={index} className="flex items-start transform transition-all duration-300 hover:translate-x-1 p-1 rounded-lg">
                        <Check className="text-green-500 w-5 h-5 mt-1 mr-2 flex-shrink-0" />
                        <p>{text}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Time Saving Benefit */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-600 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 staggered-entrance">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 transform transition-all duration-500 hover:rotate-12 hover:scale-110">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold">Risparmio di Tempo</h3>
                  </div>
                  <ul className="space-y-2">
                    {[
                      "Riduzione del 70% delle chiamate telefoniche",
                      "5-10 ore settimanali risparmiate",
                      "Nessuna interruzione durante i servizi"
                    ].map((text, index) => (
                      <li key={index} className="flex items-start transform transition-all duration-300 hover:translate-x-1 p-1 rounded-lg">
                        <Check className="text-green-500 w-5 h-5 mt-1 mr-2 flex-shrink-0" />
                        <p>{text}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Customer Experience Benefit */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-600 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 staggered-entrance">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 transform transition-all duration-500 hover:rotate-12 hover:scale-110">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold">Esperienza Cliente</h3>
                  </div>
                  <ul className="space-y-2">
                    {[
                     "Prenotazione semplice da qualsiasi dispositivo",
                      "Conferma immediata dell'appuntamento",
                      "Promemoria utili per evitare dimenticanze"
                    ].map((text, index) => (
                      <li key={index} className="flex items-start transform transition-all duration-300 hover:translate-x-1 p-1 rounded-lg">
                        <Check className="text-green-500 w-5 h-5 mt-1 mr-2 flex-shrink-0" />
                        <p>{text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-center mt-8 staggered-entrance">
                <a
                  href="https://barbershop.dcreativo.ch/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-8 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center pulse-on-hover"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Prova la Demo Live
                </a>
              </div>
            </div>
          )}

          {/* ROI Tab */}
          {activeTab === 'roi' && (
            <div ref={roiRef} id="roi-content" className="roi-section tab-transition-enter-active">
              <h2 className="text-3xl font-bold text-center mb-12 staggered-entrance">Ritorno sull'Investimento</h2>
              <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10 staggered-entrance">
                Il nostro sistema di prenotazioni si ripaga in soli 3-5 mesi grazie all'incremento delle prenotazioni e alla riduzione dei costi.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 staggered-entrance">
                {/* ROI Data Table - Enhanced with animations */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
                  <div className="bg-blue-600 text-white p-4">
                    <h3 className="text-xl font-bold">Analisi del ROI</h3>
                    <p className="text-sm text-blue-100">Esempio basato su un barbiere con 6 appuntamenti al giorno</p>
                  </div>
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-2">Metrica</th>
                          <th className="text-center py-2">Senza Sistema</th>
                          <th className="text-center py-2">Con Sistema</th>
                          <th className="text-center py-2">Differenza</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roiData.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-300">
                            <td className="py-3 font-medium">{item.label}</td>
                            <td className="py-3 text-center">{item.before}</td>
                            <td className="py-3 text-center text-blue-600 font-bold">{item.after}</td>
                            <td className="py-3 text-center text-green-600">
                              {item.increase ? `+${item.increase}` : ''}
                              {item.decrease ? `-${item.decrease}` : ''}
                              {item.value ? item.value : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="font-bold">Investimento iniziale: CHF 3,900</p>
                      <p className="text-sm text-gray-600 mt-1">Recupero stimato: 3-5 mesi</p>
                    </div>
                  </div>
                </div>

                {/* ROI Benefits */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                  <h3 className="text-xl font-bold mb-4 text-blue-600">Aumento delle Prenotazioni</h3>
                    <p className="mb-4">La possibilità per i clienti di prenotare 24/7 porta a un incremento del 15-20% delle prenotazioni, in particolare fuori orario di lavoro.</p>
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 transform origin-left animate-grow-width" style={{ width: '20%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-sm">
                      <span>+0%</span>
                      <span>+20%</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    <h3 className="text-xl font-bold mb-4 text-blue-600">Riduzione No-Show</h3>
                    <p className="mb-4">I promemoria automatici riducono i mancati appuntamenti dell'80%, ottimizzando il calendario e massimizzando i profitti.</p>
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 transform origin-left animate-grow-width" style={{ width: '80%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-sm">
                      <span>+0%</span>
                      <span>+80%</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    <h3 className="text-xl font-bold mb-4 text-blue-600">Risparmio di Tempo</h3>
                    <p className="mb-4">Risparmia 5-10 ore settimanali eliminando la gestione manuale degli appuntamenti, per concentrarti sul tuo lavoro.</p>
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 transform origin-left animate-grow-width" style={{ width: '60%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-sm">
                      <span>+0%</span>
                      <span>+60%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-10 staggered-entrance">
                <button
                  onClick={() => setIsContactFormOpen(true)}
                  className="py-3 px-8 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto pulse-on-hover"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Richiedi un Preventivo Personalizzato
                </button>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div ref={pricingRef} id="pricing-content" className="pricing-section tab-transition-enter-active">
              <h2 className="text-3xl font-bold text-center mb-6 staggered-entrance">Investimento e Valore</h2>
              <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10 staggered-entrance">
                Un sistema di prenotazioni efficiente non è un costo, ma un investimento che si ripaga in pochi mesi.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12 staggered-entrance">
                {/* Pricing Card with enhanced animations */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                  <div className="bg-blue-600 p-6 text-white relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full opacity-20 transform translate-x-1/2 -translate-y-1/2 blur-xl"></div>

                    <h3 className="text-2xl font-bold relative z-10">Soluzione Premium</h3>
                    <div className="flex items-end mt-4 relative z-10">
                      <span className="text-4xl font-bold">CHF 3,900</span>
                      <span className="text-blue-200 ml-2">una tantum</span>
                    </div>
                    <p className="text-blue-200 mt-2 relative z-10">
                      <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-bold animate-pulse-subtle">Sconto 10%</span>
                      {' '}Prezzo scontato: CHF 3,510
                    </p>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-4">Il pacchetto include:</h4>
                    <ul className="space-y-3">
                      {[
                        {
                          title: "Applicazione Web Completa",
                          desc: "Frontend responsive, dashboard amministratore, portale barbieri, interfaccia cliente"
                        },
                        {
                          title: "Funzionalità Avanzate",
                          desc: "Sistema di prenotazione automatizzato, gestione servizi, calendario dinamico, notifiche"
                        },
                        {
                          title: "Personalizzazione",
                          desc: "Branding personalizzato, configurazione su misura, multilingua"
                        },
                        {
                          title: "Setup e Formazione",
                          desc: "Configurazione con i tuoi dati, training per amministratori e staff"
                        }
                      ].map((item, index) => (
                        <li key={index} className="flex items-start hover:bg-blue-50 p-2 rounded-lg transition-colors duration-300">
                          <Check className="text-green-500 w-5 h-5 mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <span className="font-medium">{item.title}</span>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Costi Ricorrenti with enhanced animations */}
                <div className="flex flex-col">
                  <div className="bg-white rounded-lg shadow-lg p-6 mb-6 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                    <h3 className="text-xl font-bold mb-4">Costi Ricorrenti (Opzionali)</h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Hosting su Vercel",
                          desc: "Performance ottimizzate e alta disponibilità",
                          price: "CHF 240",
                          period: "annuale"
                        },
                        {
                          title: "Dominio Personalizzato",
                          desc: "Il tuo nome a scelta (es. tuosalone.ch)",
                          price: "CHF 15",
                          period: "annuale"
                        },
                        {
                          title: "Servizio SMS/WhatsApp",
                          desc: "Per l'invio di notifiche via SMS e WhatsApp",
                          price: "CHF 25-50*",
                          period: "mensile"
                        },
                        {
                          title: "Manutenzione e Supporto",
                          desc: "Assistenza continua e aggiornamenti",
                          price: "CHF 100",
                          period: "mensile"
                        }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 hover:bg-blue-50 p-2 rounded-lg transition-colors duration-300">
                          <div>
                            <span className="font-medium">{item.title}</span>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold">{item.price}</span>
                            <p className="text-sm text-gray-600">{item.period}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">*Dipende dal volume di notifiche</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 transform transition-all duration-500 hover:shadow-lg hover:-translate-y-2">
                    <h3 className="font-bold text-blue-800 mb-2">Tempistiche di Implementazione</h3>
                    <p className="text-sm mb-4">
                      Dalla firma del contratto alla messa online del sistema:
                    </p>
                    <div className="space-y-2">
                      {[
                        { phase: "Demo e Analisi", time: "1 settimana" },
                        { phase: "Personalizzazione", time: "1-2 settimane" },
                        { phase: "Implementazione", time: "1 settimana" },
                        { phase: "Formazione", time: "2-3 giorni" },
                        { phase: "Tempo totale", time: "4-6 settimane", isBold: true }
                      ].map((item, index) => (
                        <div key={index} className={`flex justify-between text-sm ${item.isBold ? 'font-bold' : ''} hover:bg-blue-100 p-2 rounded-lg transition-colors duration-300`}>
                          <span>{item.phase}</span>
                          <span className={item.isBold ? 'font-bold' : 'font-medium'}>{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center staggered-entrance">
                <button
                  onClick={() => setIsContactFormOpen(true)}
                  className="py-3 px-8 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto pulse-on-hover"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Richiedi un Preventivo Personalizzato
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Contact Form Modal with animations and feedback */}
      {isContactFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative p-6">
              {/* Animated background decoration - pulse effect */}
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-blue-600 rounded-full opacity-10 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-16 h-16 bg-blue-400 rounded-full opacity-10 animate-pulse delay-300"></div>

              <div className="relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-blue-600">Richiedi una Demo</h3>
                  <button
                    onClick={() => setIsContactFormOpen(false)}
                    className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all duration-200 transform hover:rotate-90"
                    aria-label="Chiudi"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                {/* Form content - conditional rendering based on submit status */}
                {submitStatus === 'success' ? (
                  <div className="py-10 px-6 text-center animate-fadeIn">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce-subtle">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Richiesta inviata con successo!</h4>
                    <p className="text-gray-600 mb-6">
                      Grazie per il tuo interesse! Ti contatteremo al più presto per organizzare una demo personalizzata.
                    </p>
                    <p className="text-sm text-gray-500">
                      Controlla la tua email per una copia della richiesta.
                    </p>
                    <button
                      onClick={() => setIsContactFormOpen(false)}
                      className="mt-6 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105 active:scale-95"
                    >
                      Chiudi
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="relative group">
                        <label className="block text-sm font-medium mb-1 text-gray-700 transition-all duration-300 group-focus-within:text-blue-600">Nome e Cognome</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Inserisci il tuo nome"
                          required
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-sm font-medium mb-1 text-gray-700 transition-all duration-300 group-focus-within:text-blue-600">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="La tua email"
                          required
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-sm font-medium mb-1 text-gray-700 transition-all duration-300 group-focus-within:text-blue-600">Telefono</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Il tuo numero di telefono"
                          required
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-sm font-medium mb-1 text-gray-700 transition-all duration-300 group-focus-within:text-blue-600">Nome del tuo salone</label>
                        <input
                          type="text"
                          name="salonName"
                          value={formData.salonName}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Nome del tuo Barber Shop"
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-sm font-medium mb-1 text-gray-700 transition-all duration-300 group-focus-within:text-blue-600">Messaggio</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px]"
                          placeholder="Descrivi brevemente le tue esigenze o domande"
                          rows={4}
                        ></textarea>
                      </div>
                    </div>

                    {/* Status messages */}
                    {submitStatus === 'error' && (
                      <div className="p-3 bg-red-100 text-red-800 rounded-md animate-fadeIn flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p>Si è verificato un errore durante l'invio. Riprova o contattaci direttamente via email o telefono.</p>
                      </div>
                    )}

                    <div className="flex items-start mt-4">
                      <input
                        type="checkbox"
                        id="privacy"
                        name="privacyAccepted"
                        checked={formData.privacyAccepted}
                        onChange={handleInputChange}
                        className="mt-1 mr-2"
                        required
                      />
                      <label htmlFor="privacy" className="text-sm text-gray-600">
                        Ho letto e accetto la <a href="#" className="text-blue-600 hover:underline">privacy policy</a>. I miei dati saranno trattati solo per rispondere alla mia richiesta.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 px-4 rounded-md font-bold transition-all duration-300 flex items-center justify-center ${
                        isSubmitting
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5 mr-2" />
                          Richiedi Demo Gratuita
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section with enhanced animations */}
      <footer className="bg-gray-100 py-12 px-4 border-t border-gray-200">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-6 md:mb-0 text-center md:text-left staggered-entrance">
              <h2 className="text-2xl font-bold text-blue-600">DCreativo Solutions</h2>
              <p className="text-gray-600 mt-1">Sviluppo Web & App Personalizzati</p>
            </div>

            <div className="flex space-x-4 staggered-entrance">
              {[
                { href: "mailto:info@dcreativo.ch", icon: <Mail className="w-6 h-6" /> },
                { href: "tel:+41767810194", icon: <Phone className="w-6 h-6" /> },
                { href: "https://www.dcreativo.ch", icon: <Globe className="w-6 h-6" />, isExternal: true }
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  className="text-gray-600 hover:text-blue-600 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-blue-50"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 text-center staggered-entrance">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} DCreativo Web & App Solutions. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default MarketingBarbershopSystem;
