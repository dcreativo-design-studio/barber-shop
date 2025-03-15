import { useEffect, useState } from 'react';
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
        }, 100); // Ridotto da 50ms a 100ms
      }, 300); // Ridotto da 400ms a 300ms

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
