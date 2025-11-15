// Main exports - Provider and Hooks
export { EventFlowProvider } from './lib/EventFlowProvider';
export { useEventFlow } from './lib/useEventFlow';

// Type exports
export type {
  EventData,
  BatchEventData,
  BatchedEvents,
  PageViewEvent,
  NavigationEvent,
  MouseMovingEvent,
  MouseClickEvent,
  ScrollEvent,
  ReferralEvent,
  EventCallback,
  EventFlowConfig,
  EventFlowContextValue,
} from './types';
