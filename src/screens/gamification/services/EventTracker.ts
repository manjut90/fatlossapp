// src/gamification/services/EventTracker.ts

import { GamificationEvent } from '../engine/events';

/**
 * Represents a single tracked event before it's sent to the backend.
 */
interface TrackedEvent {
  type: GamificationEvent;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * The EventTracker service manages a queue of gamification events
 * and sends them to the backend API. This is a singleton class.
 */
class EventTracker {
  private static instance: EventTracker;
  private eventQueue: TrackedEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private isFlushing = false;

  private constructor() {
    // Private constructor to enforce singleton pattern
    this.start();
  }

  /**
   * Gets the singleton instance of the EventTracker.
   */
  public static getInstance(): EventTracker {
    if (!EventTracker.instance) {
      EventTracker.instance = new EventTracker();
    }
    return EventTracker.instance;
  }

  /**
   * Adds an event to the processing queue.
   * @param type The type of the event from the GamificationEvent enum.
   * @param metadata Optional data associated with the event.
   */
  public track(type: GamificationEvent, metadata?: Record<string, any>) {
    console.log(`[Gamification] Tracking event: ${type}`, metadata);
    this.eventQueue.push({
      type,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Starts the periodic flushing of the event queue.
   */
  public start() {
    if (this.flushInterval) return;
    // Flush the queue every 15 seconds
    this.flushInterval = setInterval(() => this.flushQueue(), 15000);
  }

  /**
   * Stops the periodic flushing.
   */
  public stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Processes the queue and sends events to the backend.
   */
  private async flushQueue() {
    if (this.isFlushing || this.eventQueue.length === 0) {
      return;
    }

    this.isFlushing = true;
    const eventsToSend = [...this.eventQueue];
    this.eventQueue = []; // Clear queue immediately (optimistic)

    try {
      console.log(`[Gamification] Flushing ${eventsToSend.length} events...`);
      // This is where we'll call our backend API.
      // const response = await api.post('/gamification/events', { events: eventsToSend });
      
      // For now, we'll just simulate a successful API call.
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('[Gamification] Flush successful.');

    } catch (error) {
      console.error('[Gamification] Failed to flush event queue:', error);
      // If the API call fails, add the events back to the front of the queue.
      // This is a simple form of offline support.
      this.eventQueue.unshift(...eventsToSend);
    } finally {
      this.isFlushing = false;
    }
  }
}

export const eventTracker = EventTracker.getInstance();