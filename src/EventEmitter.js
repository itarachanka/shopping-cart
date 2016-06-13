class EventEmitter {
  // Listen on the given `event` with `fn`.
  on(event, fn) {
    this.events = this.events || {};
    (this.events['$' + event] = this.events['$' + event] || [])
      .push(fn);
    return this;
  }

  // Remove the given callback for `event` or all registered callbacks.
  off(event, fn) {
    this.events = this.events || {};

    // all
    if (0 == arguments.length) {
      this.events = {};
      return this;
    }

    // specific event
    const events = this.events['$' + event];
    if (!events) return this;

    // remove all handlers
    if (1 == arguments.length) {
      delete this.events['$' + event];
      return this;
    }

    // remove specific handler
    let cb;
    for (let i = 0; i < events.length; i++) {
      cb = events[i];
      if (cb === fn || cb.fn === fn) {
        events.splice(i, 1);
        break;
      }
    }
    return this;
  }

  // Trigger `event` with the given args.
  trigger(event) {
    this.events = this.events || {};
    const args = [].slice.call(arguments, 1);
    const callbacks = this.events['$' + event];

    if (callbacks) {
      callbacks.slice(0).forEach((cb) => {
        cb.apply(this, args);
      });
    }
    return this;
  }
}

export default EventEmitter;
