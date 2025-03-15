import { createContext, useContext, useEffect, useState } from 'react';

const TransitionContext = createContext({
  isTransitioning: false,
  startTransition: () => {},
  completeTransition: () => {}
});

export const TransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = () => {
    setIsTransitioning(true);
  };

  const completeTransition = () => {
    // Aggiungi un piccolo ritardo per garantire che le animazioni siano complete
    setTimeout(() => {
      setIsTransitioning(false);
    }, 100);
  };

  // Nuovo useEffect che si assicura che non ci siano overlay residui
  useEffect(() => {
    // Se isTransitioning diventa false, assicurati che non ci siano overlay residui
    if (!isTransitioning) {
      const overlays = document.querySelectorAll('.page-transition-overlay.active');
      overlays.forEach(overlay => {
        overlay.classList.remove('active');
      });
    }
  }, [isTransitioning]);

  return (
    <TransitionContext.Provider value={{ isTransitioning, startTransition, completeTransition }}>
      {children}
      {isTransitioning && (
        <div className="page-transition-overlay active"></div>
      )}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => useContext(TransitionContext);
