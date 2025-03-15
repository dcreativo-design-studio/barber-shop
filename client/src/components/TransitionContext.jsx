import React, { createContext, useContext, useState } from 'react';

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

// PageTransition.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTransition } from './TransitionContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isTransitioning, startTransition, completeTransition } = useTransition();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('page-transition-enter');

  useEffect(() => {
    if (location !== displayLocation) {
      startTransition();
      setTransitionStage('page-transition-exit-active');

      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('page-transition-enter');

        // Scroll to top after changing location
        window.scrollTo(0, 0);

        const enterTimeout = setTimeout(() => {
          setTransitionStage('page-transition-enter-active');
          completeTransition();
          clearTimeout(enterTimeout);
        }, 50);
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation, startTransition, completeTransition]);

  return (
    <div className={`page-transition ${transitionStage}`}>
      {children}
    </div>
  );
};

export default PageTransition;
