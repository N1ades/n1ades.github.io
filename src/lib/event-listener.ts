// Generic event listener class for handling custom events

export class EventListener<EventTypes extends string> {
    private eventListeners: Record<string, Function[]> = {};

    /**
     * Add an event listener
     */
    on(eventType: EventTypes, listener: Function): void {
        if (!this.eventListeners[eventType]) {
            this.eventListeners[eventType] = [];
        }
        this.eventListeners[eventType].push(listener);
    }

    /**
     * Add a one-time event listener
     */
    once(eventType: EventTypes, listener: Function): void {
        const onceWrapper = (...args: any[]) => {
            listener(...args);
            this.off(eventType, onceWrapper);
        };
        this.on(eventType, onceWrapper);
    }

    /**
     * Remove an event listener
     */
    off(eventType: EventTypes, listener?: Function): void {
        if (!this.eventListeners[eventType]) return;

        if (!listener) {
            // Remove all listeners for this event type
            delete this.eventListeners[eventType];
            return;
        }

        const index = this.eventListeners[eventType].indexOf(listener);
        if (index > -1) {
            this.eventListeners[eventType].splice(index, 1);
        }

        // Clean up if no listeners remain
        if (this.eventListeners[eventType].length === 0) {
            delete this.eventListeners[eventType];
        }
    }

    /**
     * Emit an event to all listeners
     */
    protected _callEventListeners(eventType: EventTypes, ...args: any[]): void {
        if (!this.eventListeners[eventType]) return;

        // Create a copy of the listeners array to avoid issues if listeners are modified during execution
        const listeners = [...this.eventListeners[eventType]];
        listeners.forEach(listener => {
            try {
                listener(...args);
            } catch (error) {
                console.error(`Error in event listener for '${eventType}':`, error);
            }
        });
    }

    /**
     * Remove all event listeners
     */
    removeAllListeners(): void {
        this.eventListeners = {};
    }

    /**
     * Get the number of listeners for an event type
     */
    listenerCount(eventType: EventTypes): number {
        return this.eventListeners[eventType]?.length || 0;
    }
}
