const MidiDebug = (function() {
  // constants
  const INPUT_NAME = 'Keystation 88 MIDI 1';
  const message = [];
  let AJAX_LOCK = false;

  // work functions
  function initMidiDebug() {
    // get initial state
    $.post('/state', function success(data) {
      render(data);
    });

    // set up the glue for the emulated (or real) midi device
    Drivers.keyboard();

    // misc event listeners
    const musicEvents = new MusicEvents();
    musicEvents.addEventListener('group', data => {
      if (data.type === musicEvents.NOTES) {
        console.log(data.notes.join(','));
      } else {
        handleChord(data);
      }
    });

    document.getElementById('refresh').addEventListener('click', () => {
      $.post('/refresh', function success(data) {
        render(data);
      });
    });
  }

  function handleChord(data) {
    console.log(data.chord + ':' + data.inversions);
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
      word_element.className = 'word-element';
      word_element.innerHTML = next_word;
      word_element.addEventListener('click', (next_word_closure => {
        return (e) => {
          if (!AJAX_LOCK) {
            AJAX_LOCK = true;

            // update the selected element's color
            e.target.style.color = '#FAB02F';
            e.target.style.background = '#FAB02F';

            // optimistic update
            document.getElementById('text').innerHTML += ' ' + next_word_closure;
            
            return choose_word(next_word_closure, () => {
              AJAX_LOCK = false;
            });
          }
        }
      })(next_word));
      word_list.appendChild(word_element);
    });
  }

  function choose_word(word, next) {
    $.post('/consume', {chosen_word: word}, function success(data) {
      render(data);
      next();
    });
  }

  return {
    init: initMidiDebug
  };
})();

window.addEventListener('DOMContentLoaded', MidiDebug.init);
