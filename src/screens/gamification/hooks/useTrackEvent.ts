// src/gamification/hooks/useTrackEvent.ts

import { useCallback } from 'react';
import { eventTracker } from '../services/EventTracker';
import { GamificationEvent } from '../engine/events';

/**
 * A hook that provides a stable function to track gamification events.
 * This is the primary interface for UI components to interact with the
 * gamification engine's event system.
 *
 * @returns A function `trackEvent(type, metadata)`
 */
export function useTrackEvent() {
  const trackEvent = useCallback(
    (type: GamificationEvent, metadata?: Record<string, any>) => {
      eventTracker.track(type, metadata);
    },
    []
  );

  return trackEvent;
}