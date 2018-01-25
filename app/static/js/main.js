const MidiDebug = (function() {
  // constants
  const INPUT_NAME = 'Keystation 88 MIDI 1';
  const message = [];

  // work functions
  function initMidiDebug() {
    $.post('/state', function success(data) {
      render(data);
    });

    /*
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
            const chordVec = getChordVec(data.notes);
            console.log(
              data.chord + ':' + data.inversions + JSON.stringify()
            );
            handleChord(data);
            render();
          }
        });
      }
    });
    */
  }

  function getChordVec(notes) {
    // vec 
    return notes;
  }

  function render(data) {
    // update the UI
    const text = document.getElementById('text');
    const word_list = document.getElementById('word-list');
    text.innerHTML = data['prefix'];
    word_list.innerHTML = '';

    // add events to all of the next word options
    data['next_words'].forEach(next_word => {
      const word_element = document.createElement('div');
      word_element.innerHTML = next_word;
      word_element.addEventListener('click', (next_word_closure => {
        return () => {
          return choose_word(next_word_closure);
        }
      })(next_word));
      word_list.appendChild(word_element);
    });
  }

  function choose_word(word) {
    $.post('/consume', {chosen_word: word}, function success(data) {
      render(data);
    });
  }

  return {
    init: initMidiDebug
  };
})();

window.addEventListener('DOMContentLoaded', MidiDebug.init);
