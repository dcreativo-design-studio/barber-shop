import { ChevronLeft, Clock, Instagram, MapPin, MessageCircle, Phone, Scissors, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const DigitalBusinessCard = ({ user, onClose }) => {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'services'
  const [animationClass, setAnimationClass] = useState('');
  const bookingUrl = "https://yourstyle.dcreativo.ch/";

  useEffect(() => {
    // Animazione all'entrata
    setAnimationClass('animate-fade-in');
  }, []);

  // Gestisci transizione tra viste
  const handleViewChange = (view) => {
    setAnimationClass('animate-fade-out');

    setTimeout(() => {
      setCurrentView(view);
      setAnimationClass('animate-fade-in');
    }, 300);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div
        className={`w-full max-w-md relative rounded-2xl shadow-2xl overflow-hidden ${animationClass}`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Pulsante di chiusura in alto a destra */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-[var(--accent)] transition-all duration-300 shadow-lg"
          aria-label="Chiudi"
        >
          <X size={18} />
        </button>

        {/* Background con effetto gradiente */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black">
            <img
              src="/images/card-background.svg"
              alt=""
              className="w-full h-full object-cover opacity-50 mix-blend-overlay"
            />
          </div>
        </div>

        {/* Contenuto principale */}
        <div className="relative z-10 h-full overflow-auto">
          {currentView === 'main' && (
            <div className="p-6 text-white">
              {/* Header con logo e brand */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-[var(--accent)] rounded-full flex items-center justify-center mr-3 shadow-lg">
                    <Scissors className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-2xl tracking-tight">Your Style</h2>
                    <p className="text-gray-300">Barber Shop</p>
                  </div>
                </div>
                <div className="text-xs font-thin opacity-50">LVGA</div>
              </div>

              {/* Separatore */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent my-6"></div>

              {/* Informazioni di contatto */}
              <div className="space-y-5 mb-8">
                <div className="flex items-start transform transition-all hover:translate-x-1">
                  <MapPin className="w-5 h-5 text-[var(--accent)] mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Via Zurigo, 2</p>
                    <p className="text-sm text-gray-300">CH-6900 Lugano</p>
                  </div>
                </div>

                <div className="flex items-start transform transition-all hover:translate-x-1">
                  <Phone className="w-5 h-5 text-[var(--accent)] mr-3 mt-1 flex-shrink-0" />
                  <p>+41 78 930 15 99</p>
                </div>

                <div className="flex items-start transform transition-all hover:translate-x-1">
                  <Clock className="w-5 h-5 text-[var(--accent)] mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p>Lun: 14:00-19:00</p>
                    <p>Mar-Sab: 9:00-19:00</p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-black bg-opacity-50 rounded-xl p-5 text-center backdrop-blur-sm shadow-inner mb-6">
                <p className="text-sm mb-3 font-medium">Prenota Online</p>
                <div className="bg-white rounded-xl p-3 inline-block shadow-lg">
                  <QRCodeSVG
                    value={bookingUrl}
                    size={120}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs mt-3 text-blue-300">{bookingUrl}</p>
              </div>

              {/* Pulsanti d'azione */}
              <div className="grid grid-cols-2 gap-4">
                {/* Pulsante Servizi */}
                <button
                  onClick={() => handleViewChange('services')}
                  className="bg-[var(--accent)] text-white py-3 px-4 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <span>Servizi</span>
                </button>

                {/* Pulsante Prenota */}
                <Link
                  to={user ? "/booking" : "/guest-booking"}
                  className="bg-white text-black py-3 px-4 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  Prenota
                </Link>
              </div>

              {/* Social media */}
              <div className="flex justify-center space-x-5 mt-6">

                <a
                  href="https://www.instagram.com/yourstylelugano/?igsh=bzdocHJ5Y2dnbTJz#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 p-2 rounded-full hover:bg-[var(--accent)] transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://api.whatsapp.com/send/?phone=41789301599&text=Ciao%21+Vorrei+richiedere+un%27informazioni&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 p-2 rounded-full hover:bg-[var(--accent)] transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href="https://g.co/kgs/4d1zMGZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 p-2 rounded-full hover:bg-[var(--accent)] transition-all"
                >
                  <MapPin className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}


        {currentView === 'services' && (
            <div className="p-6 text-white">
              {/* Header con pulsante indietro */}
              <div className="flex items-center mb-6">
                <button
                  onClick={() => handleViewChange('main')}
                  className="bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-[var(--accent)] transition-all shadow-md hover:shadow-lg flex items-center mr-4"
                  aria-label="Torna indietro"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold">I Nostri Servizi</h2>
              </div>

              {/* Lista servizi con animazioni */}
              <div className="space-y-4 mb-8">
                {[
                  { name: "Taglio Capelli", price: "CHF 30" },
                  { name: "High Definition", price: "CHF 35" },
                  { name: "Barba Modellata", price: "CHF 25" },
                  { name: "Taglio + Barba", price: "CHF 45" },
                  { name: "Barba Lunga", price: "CHF 30" },
                  { name: "Barba Express", price: "CHF 15" },
                  { name: "Taglio Bambino", price: "CHF 20" },
                  { name: "Universitari", price: "CHF 25" }
                ].map((service, index) => (
                  <div
                    key={index}
                    className="bg-black bg-opacity-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:translate-x-2 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-[var(--accent)] font-bold">{service.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pulsante di prenotazione */}
              <Link
                to={user ? "/booking" : "/guest-booking"}
                className="block w-full bg-[var(--accent)] text-white text-center py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                Prenota Ora
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Gestore della visualizzazione del biglietto da visita digitale
const DigitalCardModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return <DigitalBusinessCard user={user} onClose={onClose} />;
};

export { DigitalBusinessCard, DigitalCardModal };
