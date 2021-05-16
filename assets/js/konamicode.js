const konami = {
  pattern: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
  step: 0,

  keyHandler: function (event) {
    // console.log(event.key);
    // console.log(konami.pattern);
    // If the key isn't in the pattern, or isn't the step key in the pattern, reset
    if (konami.pattern.indexOf(event.key) < 0 || event.key !== konami.pattern[konami.step]) {
      konami.step = 0;
      return;
    }

    // Update how much of the pattern is complete
    konami.step++;

    // Completed konami code
    if (konami.pattern.length === konami.step) {
      konami.step = 0;
      console.info('Konami code completed');
      konami.completed();
    }
  },
  completed: function() {
    console.log('Overwrite window.konami.completed with your own function');
  },

  init: function() {
    // register listener for konami code
    document.addEventListener('keydown', this.keyHandler, false);
  }
};
