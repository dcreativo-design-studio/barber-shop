import { ChevronDown, Clock, Instagram, MapPin, MessageCircle, Phone, Scissors } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const DigitalBusinessCard = ({ user }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const bookingUrl = "https://yourstyle.dcreativo.ch/";

  useEffect(() => {
    // Aggiungi classe di animazione dopo un breve ritardo per garantire la renderizzazione iniziale
    setTimeout(() => {
      setAnimationClass('animate-fade-in');
    }, 100);
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`w-full max-w-md mx-auto my-6 ${animationClass} relative`}>
      {/* Background SVG */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
        <img
          src="/images/card-background.svg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card Container con effetto 3D */}
      <div className="relative perspective z-10">
        <div
          className={`transition-all duration-500 transform-gpu preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          } ${isExpanded ? 'scale-100' : 'scale-95 hover:scale-97'}`}
          style={{ maxHeight: '85vh', overflowY: 'auto' }}
        >
          {/* Front of the card */}
          <div
            className={`bg-gradient-to-br from-gray-900 to-black text-white rounded-xl shadow-2xl p-6 backface-hidden ${
              isFlipped ? 'hidden' : 'block'
            }`}
          >
            {/* Header with logo and brand */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center mr-3 shadow-lg">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl">Your Style</h2>
                  <p className="text-sm text-gray-300">Barber Shop</p>
                </div>
              </div>
              <div className="text-xs font-thin opacity-50">LVGA</div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent my-4"></div>

            {/* Main content */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-[var(--accent)] mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Via Zurigo, 2</p>
                  <p className="text-sm text-gray-300">CH-6900 Lugano</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-5 h-5 text-[var(--accent)] mr-3 mt-1 flex-shrink-0" />
                <p>+41 78 930 15 99</p>
              </div>

              <div className="flex items-start">
                <Clock className="w-5 h-5 text-[var(--accent)] mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p>Lun: 14:00-19:00</p>
                  <p>Mar-Sab: 9:00-19:00</p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-gray-800 rounded-lg p-4 text-center shadow-inner">
              <p className="text-sm mb-2 font-medium">Prenota Online</p>
              <div className="bg-white rounded-lg p-2 inline-block shadow-lg hover:shadow-xl transition-all">
                <QRCodeSVG
                  value={bookingUrl}
                  size={120}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs mt-2 text-blue-300">{bookingUrl}</p>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleFlip}
                className="text-sm flex items-center bg-gray-800 hover:bg-[var(--accent)] px-3 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="Vedi i nostri servizi"
              >
                <span>Servizi</span>
                <ChevronDown className="w-4 h-4 ml-1 transform rotate-90" />
              </button>

              <div className="flex space-x-3">
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
          </div>

          {/* Back of the card (Services) */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-gray-900 to-black text-white rounded-xl shadow-2xl p-6 backface-hidden transform-gpu rotate-y-180 ${
              isFlipped ? 'block' : 'hidden'
            }`}
            style={{ maxHeight: '100%', overflowY: 'auto' }}
          >
            {/* Header con pulsante per tornare indietro */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleFlip}
                className="text-sm flex items-center bg-gray-800 hover:bg-[var(--accent)] px-3 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="Torna al fronte del biglietto"
              >
                <ChevronDown className="w-4 h-4 mr-1 transform -rotate-90" />
                <span>Indietro</span>
              </button>

              <h3 className="text-lg font-bold text-[var(--accent)]">I Nostri Servizi</h3>

              <div className="w-8 h-8 opacity-0">
                {/* Elemento vuoto per bilanciare il layout */}
              </div>
            </div>

            {/* Lista servizi */}
            <div className="mt-6 space-y-3">
              <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:translate-x-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Taglio Capelli</span>
                  <span className="text-[var(--accent)] font-bold">CHF 30</span>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:translate-x-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">High Definition</span>
                  <span className="text-[var(--accent)] font-bold">CHF 35</span>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:translate-x-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Barba Modellata</span>
                  <span className="text-[var(--accent)] font-bold">CHF 25</span>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:translate-x-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Taglio + Barba</span>
                  <span className="text-[var(--accent)] font-bold">CHF 45</span>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:translate-x-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Barba Lunga</span>
                  <span className="text-[var(--accent)] font-bold">CHF 30</span>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:translate-x-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Barba Express</span>
                  <span className="text-[var(--accent)] font-bold">CHF 15</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-6">
              <Link
                to={user ? "/booking" : "/guest-booking"}
                className="block w-full bg-[var(--accent)] text-white text-center py-4 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Prenota Ora
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Expand/collapse button */}
      <div className="text-center mt-4 relative z-10">
        <button
          onClick={handleExpand}
          className="bg-gray-800 text-white hover:bg-gray-700 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all text-sm flex items-center mx-auto"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="w-4 h-4 mr-1 transform rotate-180" />
              <span>Riduci</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              <span>Espandi</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DigitalBusinessCard;
