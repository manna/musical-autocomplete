// preconditions: the invoked drivers determine their own preconditions
// postconditions: window object dispatches emulatednoteon events
const Drivers = (() => {
  // precondition: there is a midi device named input_name
  function initRealDriver(input_name) { // pass-through
    WebMidi.enable(err => {
      if (err) {
        console.log('WebMidi could not be enabled.', err);
      } else if (WebMidi.inputs.length < 1) {
        console.log('No input devices found.');
      } else {
        const input = WebMidi.getInputByName(input_name);
        if (input) {
          input.addListener('noteon', 'all', e => {
            window.dispatchEvent(new CustomEvent('emulatednoteon', {detail: e}));
          });
          console.log('WebMidi enabled!');
        } else {
          console.log('Error setting up listeners.');
        }
      }
    });
  }

  // precondition: there is a keyboard that can dispatch events
  function initKeyboardDriver() {
    const notes = ['B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'A4', 'B4', 'C4', 'D4'];
    const order = {
      65: 0, 83: 1, 68: 2, 70: 3,
      71: 4, 72: 5, 74: 6, 75: 7,
      76: 8, 186: 9
    };
    window.addEventListener('keydown', e => {
      if (order[e.keyCode] || order[e.keyCode] === 0) {
        const value = notes[order[e.keyCode]];
        window.dispatchEvent(new CustomEvent('emulatednoteon', {
          detail: {
            note: {
              name: value.charAt(0),
              octave: value.substring(1)
            }
          }
        }));
      }
    });
    console.log('Emulated MIDI controller with keyboard driver.');
  }

  return {
    real: initRealDriver,
    keyboard: initKeyboardDriver
  };
})();
