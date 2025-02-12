import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

function Navbar({ onThemeToggle, isDark }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);


    useEffect(() => {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const mouseY = window.event?.clientY ?? 0;

        if (currentScrollY > lastScrollY && currentScrollY > 50 && mouseY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('mousemove', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleScroll);
      };
    }, [lastScrollY]);

    const handleLogout = () => {
      logout();
      navigate('/login');
    };

    return (
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="h-14 bg-[var(--bg-secondary)] backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-4 h-full">
            <div className="flex justify-between items-center h-full">
              <Link to="/" className="h-8">
                <img
                  src={logo}
                  alt="Your Style Barber Logo"
                  className="h-full object-contain hover:opacity-80 transition-opacity"
                />
              </Link>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-4">
                  {user && (
                    <>
                      <span className="text-[var(--accent)] text-sm">
                        Benvenuto, {user.firstName}!
                      </span>
                      <Link
                        to="/booking"
                        className="text-[var(--text-primary)] hover:text-[var(--accent)] text-sm transition-colors"
                      >
                        Prenota
                      </Link>
                      <Link
                        to="/waiting-list"
                        className="text-[var(--text-primary)] hover:text-[var(--accent)] text-sm transition-colors"
                      >
                        Lista d'attesa
                      </Link>
                      <Link
                        to="/profile"
                        className="text-[var(--text-primary)] hover:text-[var(--accent)] text-sm transition-colors"
                      >
                        Profilo
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded hover-glow"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>

                {/* Theme Switcher */}
                <button
                  onClick={onThemeToggle}
                  className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors"
                  aria-label="Toggle theme"
                >
                  {isDark ?
                    <span className="text-yellow-400 text-xl">☀️</span> :
                    <span className="text-gray-400 text-xl">🌙</span>
                  }
                </button>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <div className="space-y-1.5">
                    <span className={`block w-6 h-0.5 bg-[var(--text-primary)] transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-[var(--text-primary)] transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-[var(--text-primary)] transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden bg-[var(--bg-secondary)] backdrop-blur-sm transition-all duration-300 ${
          isMenuOpen ? 'max-h-48' : 'max-h-0'
        } overflow-hidden`}>
          <div className="px-4 py-2 space-y-2">
            {user && (
              <>
                <Link
                  to="/booking"
                  className="block py-2 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                >
                  Prenota
                </Link>
                <Link
                  to="/waiting-list"
                  className="block py-2 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                >
                  Lista d'attesa
                </Link>
                <Link
                  to="/profile"
                  className="block py-2 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                >
                  Profilo
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-500 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    );
}

export default Navbar;
