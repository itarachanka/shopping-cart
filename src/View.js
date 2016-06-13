import EventEmitter from './EventEmitter';
import NumberInput from './components/NumberInput';

const NAME = 1;
const PRICE = 4;
const DISCOUNTPRICE = 6;

// View.
class View extends EventEmitter {
  constructor(options = {}) {
    super();
    this.name = options.name;
    this.type = options.type;
    this.desc = options.desc;
    this.price = new NumberInput(options.price);
    this.discount = new NumberInput(options.discount, true);
    this.add = options.add;
    this.$el = options.$el;
    this.errors = options.errors;
    this.footer = options.footer;
    this.handleClick = this.handleClick.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);

    this.add.addEventListener('click', this.handleClick);
  }

  handleClick() {
    this.delErrors();
    this.trigger('add', {
      name: this.name.value,
      type: this.type.value,
      desc: this.desc.value,
      price: this.price.value(),
      discount: this.discount.value()
    });
  }

  off() {
    this.add.removeEventListener('click', this.handleClick);
  }

  handleRowClick(event) {
    this.trigger('remove', event.target.getAttribute('data-id'));
  }

  delRow(id) {
    const tr = this.$el.querySelector(`tr[data-id='${id}']`);
    const button = tr.querySelector(`button[data-id='${id}']`);

    button.removeEventListener('click', this.handleRowClick);
    tr.parentNode.removeChild(tr);
  }

  addRow(item) {
    const id = item.get('id');
    const row = document.createElement('tr');
    const actions = document.createElement('td');
    const button = document.createElement('button');

    row.setAttribute('data-id', id);
    button.type = 'button';
    button.className = 'btn btn-sm';
    button.setAttribute('data-id', id);
    button.addEventListener('click', this.handleRowClick);

    button.appendChild(document.createTextNode('X'));
    actions.appendChild(button);
    row.appendChild(this.createTD(id));
    row.appendChild(this.createTD(item.get('name')));
    row.appendChild(this.createTD(item.get('type')));
    row.appendChild(this.createTD(item.get('desc')));
    row.appendChild(this.createTD(item.get('price')));
    row.appendChild(this.createTD(`${item.get('discount')}%`));
    row.appendChild(this.createTD(item.get('discountSum').toFixed(2)));
    row.appendChild(actions);
    this.$el.appendChild(row);
  }

  createTD(text) {
    const row = document.createElement('td');
    const textnode = document.createTextNode(text);

    row.appendChild(textnode);
    return row;
  }

  delErrors() {
    this.errors.innerHTML = '';
  }

  showErrors(errs) {
    errs.forEach(err => {
      const el = document.createElement('p');
      const textnode = document.createTextNode(err);

      el.className = 'bg-danger';
      el.appendChild(textnode);
      this.errors.appendChild(el);
    });
  }

  render(cart) {
    this.$el.innerHTML = '';
    cart.items.forEach(item => {
      this.addRow(item);
    });
  }

  renderFooter(cart) {
    const cells = this.footer.cells;

    cells[NAME].innerText = cart.items.length;
    cells[PRICE].innerText = cart.sum;
    cells[DISCOUNTPRICE].innerText = cart.discountSum.toFixed(2);
  }
}

export default View;
