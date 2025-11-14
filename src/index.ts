// Main exports - Provider and Hooks
export { EventFlowProvider } from './lib/EventFlowProvider';
export { useEventFlow } from './lib/useEventFlow';

// Type exports
export type {
  EventData,
  PageViewEvent,
  NavigationEvent,
  MouseMovingEvent,
  MouseClickEvent,
  ScrollEvent,
  EventCallback,
  EventFlowConfig,
  EventFlowContextValue,
} from './types';
