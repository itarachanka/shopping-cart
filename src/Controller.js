// Controller.
class Controller {
  constructor(options = {}) {
    this.cart = options.cart;
    this.view = options.view;

    this.cart.on('reset', cart => this.view.render(cart));
    this.cart.on('add', item => this.view.addRow(item));
    this.cart.on('remove', id => this.view.delRow(id));
    this.cart.on('invalid', errs => this.view.showErrors(errs));
    this.cart.on('calc', cart => this.view.renderFooter(cart));

    this.view.on('add', item => this.add(item));
    this.view.on('remove', id => this.remove(id));

    this.cart.fetch();
  }

  add(item) {
    this.cart.add(item, { parse: true });
  }

  remove(id) {
    this.cart.remove(id);
  }
}

export default Controller;
