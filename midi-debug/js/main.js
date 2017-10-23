const MidiDebug = (function() {
  // constants
  const INPUT_NAME = 'Keystation 88 MIDI 1';
  let count = 0;

  // work functions
  function initMidiDebug() {
    WebMidi.enable(err => {
      if (err) {
        console.log('WebMidi could not be enabled.', err);
      } else if (WebMidi.inputs.length < 1) {
        console.log('No input devices found.');
      } else {
        console.log('WebMidi enabled!');
        const input = WebMidi.getInputByName(INPUT_NAME);
        const musicEvents = new MusicEvents(input);
        musicEvents.addEventListener('group', data => {
          if (data.type === musicEvents.NOTES) {
            console.log(data.notes.join(','));
          } else {
            console.log(data.chord + ':' + data.inversions);
          }
        });
      }
    });
  }

  return {
    init: initMidiDebug
  };
})();

window.addEventListener('DOMContentLoaded', MidiDebug.init);
