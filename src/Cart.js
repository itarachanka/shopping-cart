import EventEmitter from './EventEmitter';

let idCounter = 0;
const APP = 'shopping-cart';

function uniquiId() {
  return ++idCounter;
}

function localstorage() {
  try {
    localStorage.setItem(APP, APP);
    localStorage.removeItem(APP);
    return localStorage;
  } catch (e) {
    return null;
  }
}

// Cart.
class Cart extends EventEmitter {
  constructor(options = {}) {
    super();
    if (options.model) this.model = options.model;
    this.localstorage = localstorage();
    this.items = [];
  }

  calc() {
    this.sum = 0;
    this.discountSum = 0;

    this.items.forEach(item => {
      this.sum += item.get('price');
      this.discountSum += item.get('discountSum');
    });
    this.trigger('calc', this);
  }

  add(items = [], options = {}) {
    if (items == null) return;

    const singular = !Array.isArray(items);
    const toAdd = [];
    items = singular ? [items] : items.slice();

    items.forEach(item => {
      item.id = uniquiId();
      item = new this.model(item, options);
      if (item.validationError) {
        this.trigger('invalid', item.validationError);
      } else {
        toAdd.push(item);
        this.items.push(item);
      }
    });
    if (!options.silent) {
      this.trigger('add', singular ? toAdd[0] : toAdd);
    }
    if (toAdd.length) {
      this.calc();
      this.save();
    }
    return singular ? items[0] : items;
  }

  remove(id) {
    const removed = [];

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.get('id') == id) {
        this.items.splice(i, 1);
        this.trigger('remove', id);
        removed.push(item);
        this.calc();
        this.save();
        break;
      }
    }
    return removed;
  }

  fetch() {
    let items = [];
    if (this.localstorage) {
      items = JSON.parse(this.localstorage.getItem(APP) || '{}').items || [];
    }
    idCounter = items.length;
    this.reset(items);
  }

  reset(items) {
    this.items = [];

    items = this.add(items, { silent: true, parse: true });
    this.trigger('reset', this);
    return items;
  }

  save() {
    if (this.localstorage) {
      const toSave = [];

      this.items.forEach(model => {
        toSave.push(model.toJSON());
      });
      this.localstorage.setItem(APP, JSON.stringify({
        items: toSave
      }));
    }
  }
}

export default Cart;
