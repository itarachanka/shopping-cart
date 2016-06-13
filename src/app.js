import Cart from './Cart';
import CartItem from './CartItem';
import View from './View';
import Controller from './Controller';

((d) => {
  const cart = new Cart([], {
    model: CartItem
  });
  const view = new View({
    name: d.getElementById('name'),
    type: d.getElementById('type'),
    desc: d.getElementById('description'),
    price: d.getElementById('price'),
    discount: d.getElementById('discount'),
    add: d.getElementById('add'),
    $el: d.querySelector('tbody'),
    errors: d.querySelector('div.errors'),
    footer: d.querySelector('tfoot tr')
  });
  new Controller({
    cart,
    view
  });
})(document);
