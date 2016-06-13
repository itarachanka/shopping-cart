const SLOW_MODE_DELAY = 20;
const keys = {
  BACKSPACE: 8,
  COMMA: 188,
  DELETE: 46,
  DOWN: 40,
  END: 35,
  ENTER: 13,
  ESCAPE: 27,
  HOME: 36,
  LEFT: 37,
  PAGE_DOWN: 34,
  PAGE_UP: 33,
  PERIOD: 190,
  RIGHT: 39,
  SPACE: 32,
  TAB: 9,
  UP: 38
};
const NUMBER_DELIMETRS = [',', '.', ' '];
const numberFormat = {
  decimals: 2,
  ',': ' ',
  '.': ',',
  groupSize: [3]
};

function getSelection(input) {
  let selection = { start: 0, end: 0};

  if ('selectionStart' in input) {
    selection = {
      start: input.selectionStart,
      end: input.selectionEnd
    };
  }

  return selection;
}

function setSelection(input, offsets) {
  const start = offsets.start;
  const end = offsets.end || start;

  if ('selectionStart' in input) {
    input.selectionStart = start;
    input.selectionEnd = Math.min(end, input.value.length);
  }
}

function strRepeat(str, qty) {
  if (qty < 1) return '';
  let result = '';

  while (qty > 0) {
    if (qty & 1) result += str;
    qty >>= 1;
    str += str;
  }
  return result;
}

// Masked number input widget.
class NumberInput {
  constructor(el, integer, max) {
    this.$el = el;
    this.integer = integer;
    this.max = max;
    const group = numberFormat[','] === ' ' ? 's' : numberFormat[','];
    const decimals = numberFormat['.'];
    this.trimLeadingZerosRegExp = new RegExp(`^[0\\${group}]+(?!\\${decimals}|$)`);
    this.queue = {
      timeout: null,
      fromCaret: 0
    };

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);

    this.$el.addEventListener('keydown', this.handleKeydown);
    this.$el.addEventListener('keypress', this.handleKeypress);
  }

  mask(value) {
    if (!value) {
      return '';
    }
    value = value + '';

    const maxIntegerPositions = this.max ? this.max.toString().length : Infinity;
    const maxFractionPositions = this.integer ? 0 : numberFormat.decimals;
    const fraction = [];
    let integer = [];
    let inputIdx;
    let outputIdx;
    let input;
    let hasFractional = false;
    let integerPart;
    let fractionalPart;

    value = [value];
    NUMBER_DELIMETRS.forEach((jumpChar) => {
      let valueArray = [];
      value.forEach((chunk) => {
        chunk = String(chunk);
        valueArray = valueArray.concat(chunk.split(jumpChar));
      });
      value = valueArray;
    });
    integerPart = value.shift() || '';
    fractionalPart = value;
    value = [integerPart];
    if (fractionalPart.length > 0) {
      value.push(fractionalPart.join(''));
    }

    if (maxFractionPositions && value.length > 1) {
      hasFractional = true;
    }

    if (value.length > 2) {
      value[1] = value[1] + value.slice(2).join('');
    }

    inputIdx = 0;
    outputIdx = 0;
    input = value[0];
    while (outputIdx < maxIntegerPositions && inputIdx < input.length) {
      let inputChar = input.charAt(inputIdx);
      if (/^\d$/.test(inputChar)) {
        integer.push(inputChar);
        outputIdx += 1;
      }
      inputIdx += 1;
    }

    inputIdx = 0;
    outputIdx = 0;
    input = (value[1] || '');
    while (outputIdx < maxFractionPositions && inputIdx < input.length) {
      let inputChar = input.charAt(inputIdx);
      if (/^\d$/.test(inputChar)) {
        fraction.push(inputChar);
        outputIdx += 1;
      }
      inputIdx += 1;
    }

    value = '';
    integer = integer.reverse();
    // support different digit groups sizes.
    if (numberFormat.groupSize.length === 1) {
      while (integer.length > 0) {
        value = integer.splice(0, numberFormat.groupSize[0]).reverse().join('') + value;

        if (integer.length > 0) {
          value = numberFormat[','] + value;
        }
      }
    } else {
      value = integer.splice(0, numberFormat.groupSize[0]).reverse().join('');
      while (integer.length > 0) {
        value = numberFormat[','] + value;
        value = integer.splice(0, numberFormat.groupSize[1]).reverse().join('') + value;
      }
    }

    if (hasFractional) {
      value = value + numberFormat['.'] + fraction.join('');
    }

    return value;
  }

  unmask(value) {
    if (!value) {
      return '';
    }

    return (value + '').trim()
            .split(numberFormat[','])
            .join('')
            .split(numberFormat['.'])
            .join('.');
  }

  value() {
    const value = this.unmask(this.$el.value);

    return (value === '' || isNaN(value)) ? null : Number(value);
  }

  // Splits input value by selection position.
  splitValue() {
    const element = this.$el;
    const value = element.value;
    const selection = getSelection(element);
    const start = selection.start;
    const end = selection.end;
    const prependix = this.unmask(value.substring(0, start));
    const appendixStart = end > 0 ? value.substring(0, end).length : 0;
    const appendix = this.unmask(value.substring(end), appendixStart);

    return {
      start,
      end,
      prependix,
      appendixStart,
      appendix
    };
  }

  off() {
    this.$el.removeEventListener('keydown', this.handleKeydown);
    this.$el.removeEventListener('keypress', this.handleKeypress);
  }

  // Updates input.
  updateInput(value, selection) {
    const element = this.$el;

    element.value = this.mask(value);
    if (selection) {
      setSelection(element, { start: selection });
    }
  }

  // Handles keydown event.
  handleKeydown(e) {
    const key = e.keyCode;
    const element = e.target;
    let value = element.value;
    let step = 1;

    if (key === keys.BACKSPACE || key === keys.DELETE) {
      let { start, end, prependix, appendix } = this.splitValue();

      if (key === keys.BACKSPACE && start === end) {
        prependix = prependix.slice(0, -1);
        step = -1;
        start -= 1;
      }

      if (key === keys.DELETE && start === end) {
        appendix = appendix.substring(1);
      }

      this.updateInput(prependix + appendix);
      value = element.value;
      setSelection(element, { start: value.length });
      e.preventDefault();
    }
  }

  // Handles keypress event.
  handleKeypress(e) {
    if (e.which === 0 || e.metaKey || e.ctrlKey || e.keyCode === keys.ENTER) {
      return;
    }

    const element = e.target;
    const queue = this.queue;
    let value = element.value;
    const { start, end, prependix, appendix } = this.splitValue();

    clearTimeout(queue.timeout);
    if (!queue.prependix) {
      queue.prependix = prependix;
      queue.maskedPrependix = value.substring(0, start);
      queue.appendix = appendix;
      queue.maskedAppendix = value.substring(end);
    }

    queue.timeout = setTimeout(() => {
      value = element.value;
      const len = queue.maskedAppendix.length ? -queue.maskedAppendix.length : value.length;
      const input = value.slice(queue.maskedPrependix.length, len);
      const selectionStart = this.mask(`${queue.prependix}${input}`).length;
      this.updateInput(`${queue.prependix}${input}${queue.appendix}`, selectionStart);
      queue.prependix = false;
      queue.appendix = false;
    }, SLOW_MODE_DELAY);
  }
}

export default NumberInput;
