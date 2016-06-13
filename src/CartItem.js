import EventEmitter from './EventEmitter';

let idCounter = 0;

// Cart item.
// Implements:
//  set/get - mutators
//  toJSON - serialize to json
//  parse - parses raw data
class CartItem extends EventEmitter {
  constructor(props = {}, options = {}) {
    super();
    this.props = {};
    if (options.parse) {
      // parse/transform attributes
      this.props = this.parse(props);
    }
    this.props.discountSum = Number(props.price) * Number(props.discount) / 100;
    this.set(props);
  }

  set(values = {}, options = {}) {
    if (options.parse) {
      values = this.parse(values);
    }
    if (this.validate(values)) {
      Object.assign(this.props, values);
      this.props.discountSum = Number(values.price) * (1 - Number(values.discount) / 100);
      this.trigger('change', this, options);
    }
  }

  get(prop) {
    return this.props[prop];
  }

  toJSON() {
    return Object.assign({}, this.props);
  }

  validate(props) {
    const validationError = [];
    let valid = true;
    this.validationError = null;

    if (!props.name) {
      validationError.push('Please enter name.');
    }
    if (validationError.length) {
      valid = false;
      this.validationError = validationError;
    }
    return valid;
  }

  parse(resp) {
    resp.price = Number(resp.price);
    resp.discount = Number(resp.discount);
    return resp;
  }
}

export default CartItem;
