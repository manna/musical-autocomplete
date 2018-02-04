// preconditions: the invoked drivers determine their own preconditions
// postconditions: window object dispatches emulatednoteon events
const Drivers = (() => {
  function initRealDriver(success, fail) { // pass-through
    success = success || (() => true);
    fail = fail || (() => true);

    WebMidi.enable(err => {
      if (err) {
        console.log('WebMidi could not be enabled.', err);
      } else if (WebMidi.inputs.length < 1) {
        console.log('No input devices found.');
      } else {
        const input = WebMidi.getInputByName(WebMidi.inputs[0].name);
        if (input) {
          input.addListener('noteon', 'all', e => {
            window.dispatchEvent(new CustomEvent('emulatednoteon', {detail: e}));
          });
          console.log('WebMidi enabled!');
          return success();
        } else {
          console.log('Error setting up listeners.');
        }
      }

      return fail();
    });
  }

  // precondition: there is a keyboard that can dispatch events
  function initKeyboardDriver() {
    const notes = ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'];
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
