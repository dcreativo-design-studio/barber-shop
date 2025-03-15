import { createContext, useContext, useState } from 'react';

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
    setIsTransitioning(false);
  };

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
