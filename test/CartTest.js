import Cart from '../src/Cart';
import CartItem from '../src/CartItem';

describe('Cart', () => {
  it('local import should exist', () => {
    expect(Cart).not.toBe(null);
  });

  describe('events', () => {
    let cart;
    let callback;

    beforeEach(() => {
      cart = new Cart([], {
        model: CartItem
      });
      callback = jasmine.createSpy('event callback');
    });

    it('reset cart', () => {
      cart.on('reset', callback);
      cart.reset([]);

      expect(callback).toHaveBeenCalled();
    });

    it('add valid item', () => {
      cart.on('add', callback);
      cart.add({
        name: 'name',
        type: 'Book',
        desc: '',
        price: 100,
        discount: 5
      }, { parse: true });

      expect(callback).toHaveBeenCalled();
    });

    it('add invalid item', () => {
      cart.on('invalid', callback);
      cart.add({
        name: null,
        type: 'Book',
        desc: '',
        price: 100,
        discount: 5
      }, { parse: true });

      expect(callback).toHaveBeenCalled();
    });

    it('remove item', () => {
      cart.on('remove', callback);
      const item = cart.add({
        name: 'name',
        type: 'Book',
        desc: '',
        price: 100,
        discount: 5
      }, { parse: true });
      cart.remove(item.id);

      expect(callback).toHaveBeenCalled();
    });

    it('recalc sum', () => {
      cart.on('calc', callback);
      cart.add({
        name: 'name',
        type: 'Book',
        desc: '',
        price: 100,
        discount: 5
      }, { parse: true });

      expect(callback).toHaveBeenCalled();
    });
  });
});
