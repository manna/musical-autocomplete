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
    const notes = ['A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3'];
    window.addEventListener('keydown', e => {
      if (e.keyCode >= 65 && e.keyCode <= 71) {
        const value = notes[e.keyCode - 65];
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
