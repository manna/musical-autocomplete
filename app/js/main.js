const MidiDebug = (function() {
  // constants
  const INPUT_NAME = 'Keystation 88 MIDI 1';
  const WORDS = [
    "the",
    "a",
    "destroy",
    "create",
    "i",
    "arman",
    "dinosaur",
    "ears",
    "listen",
    "music",
    "water",

    "energetic",
    "harmonious",

    "program",
    "study",
    "eat",
    "sleep",
    "play"
  ];
  const LOW_CHORD = 'D#Maj7';
  const HIGH_CHORD = 'G#Maj7';
  const CLEAR_CHORD = 'Gm7';
  let low = 0;
  let high = WORDS.length;
  const message = [];

  // work functions
  function initMidiDebug() {
    render();

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
            handleChord(data);
            render();
          }
        });
      }
    });
  }

  function handleChord(data) {
    const mid = Math.floor((low + high) / 2);
    if (data.chord === LOW_CHORD) {
      high = mid;
    } else if (data.chord === HIGH_CHORD) {
      low = mid;
    } else if (data.chord === CLEAR_CHORD) {
      low = 0;
      high = WORDS.length;
    }

    if (low === high - 1) {
      message.push(WORDS[low]);
      low = 0;
      high = WORDS.length;
    }
  }

  function render() {
    const mid = Math.floor((low + high) / 2);
    const lowWords = WORDS.slice(low, mid);
    const highWords = WORDS.slice(mid, high);
    document.getElementById('low').innerHTML = lowWords.join(', ');
    document.getElementById('high').innerHTML = highWords.join(', ');
    document.getElementById('content').innerHTML = message.join(' ');
  }

  return {
    init: initMidiDebug
  };
})();

window.addEventListener('DOMContentLoaded', MidiDebug.init);
