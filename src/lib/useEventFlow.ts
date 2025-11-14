import { useContext } from 'react';
import { EventFlowContext } from './EventFlowProvider';
import type { EventFlowContextValue } from '../types';

/**
 * useEventFlow Hook - EventFlow Context를 사용하는 커스텀 훅
 * 
 * @throws {Error} EventFlowProvider 외부에서 사용 시 에러
 * @returns {EventFlowContextValue} EventFlow context 값
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { trackEvent, trackPageView } = useEventFlow();
 * 
 *   const handleClick = () => {
 *     trackEvent('button_click', {
 *       buttonId: 'submit',
 *       timestamp: Date.now()
 *     });
 *   };
 * 
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 */
export const useEventFlow = (): EventFlowContextValue => {
  const context = useContext(EventFlowContext);

  if (!context) {
    throw new Error('useEventFlow must be used within EventFlowProvider');
  }

  return context;
};
