type EventCallback = (...args: any[]) => void;

export type EventUnsubscribe = () => void;

export class EventEmitter {
  private readonly events = new Map<string, Set<EventCallback>>();

  on(event: string, callback: EventCallback): EventUnsubscribe {
    let callbacks = this.events.get(event);
    if (!callbacks) {
      callbacks = new Set();
      this.events.set(event, callbacks);
    }
    callbacks.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback?: EventCallback): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;
    if (!callback) this.events.delete(event);
    else if (callbacks.delete(callback) && callbacks.size === 0) this.events.delete(event);
  }

  clear(): void {
    this.events.clear();
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;
    for (const callback of [...callbacks]) callback(...args);
  }
}
