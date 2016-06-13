class EventEmitter {
  // Listen on the given `event` with `fn`.
  on(event, fn) {
    this._events = this._events || {};
    (this._events['$' + event] = this._events['$' + event] || [])
      .push(fn);
    return this;
  }

  // Remove the given callback for `event` or all registered callbacks.
  off(event, fn) {
    this._events = this._events || {};

    // all
    if (0 == arguments.length) {
      this._events = {};
      return this;
    }

    // specific event
    const events = this._events['$' + event];
    if (!events) return this;

    // remove all handlers
    if (1 == arguments.length) {
      delete this._events['$' + event];
      return this;
    }

    // remove specific handler
    let cb;
    for (var i = 0; i < events.length; i++) {
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
    this._events = this._events || {};
    const args = [].slice.call(arguments, 1);
    const events = this._events['$' + event];

    if (events) {
      events.slice(0).forEach((event) => {
        event.apply(this, args);
      });
    }
    return this;
  }
}

export default EventEmitter;
