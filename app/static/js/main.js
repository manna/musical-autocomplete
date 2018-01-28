const MidiDebug = (function() {
  // constants
  const INPUT_NAME = 'Keystation 88 MIDI 1';
  const message = [];
  let previous_state = {};
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
      // add the notes to the history
      Array.prototype.push.apply(previous_state.note_history, data.notes);

      // check suffix against melodies
      // TODO: this function is fat af abstract #dat #shit
      for (let i = 0; i < previous_state['melodies'].length; i++) {
        const melody = previous_state['melodies'][i];
        let different = false;
        if (melody.length > previous_state.note_history.length) continue;

        for (let j = 1; j <= melody.length; j++) {
          const note = previous_state.note_history[
            previous_state.note_history.length - j
          ].charAt(0);
          if (note !== melody[melody.length - j]) {
            different = true;
          }
        }
        if (!different) {
          // select word i
          const selected_word = previous_state['next_words'][i]
          AJAX_LOCK = true;

          // optimistic update
          document.getElementById('text').innerHTML += ' ' + selected_word;

          choose_word(selected_word, () => {
            AJAX_LOCK = false;
          });
          break;
        }
      }

      // logging stuff
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
    // update the state
    previous_state = data;

    // update the UI
    const text = document.getElementById('text');
    const word_list = document.getElementById('word-list');
    text.innerHTML = data['prefix'];
    word_list.innerHTML = '';

    // add events to all of the next word options
    data['next_words'].forEach((next_word, i) => {
      const next_melody = data['melodies'][i];
      const word_element = document.createElement('div');
      word_element.className = 'word-element';
      word_element.innerHTML = next_word +
        '<span style="color: #cdcdcd"> --- </span>' +
        '<code>' + next_melody.join(',') + '</code>';
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
    console.log(previous_state.note_history);
    $.post('/consume', {
      chosen_word: word,
      note_history: JSON.stringify(previous_state.note_history)
    }, function success(data) {
      render(data);
      next();
    });
  }

  return {
    init: initMidiDebug
  };
})();

window.addEventListener('DOMContentLoaded', MidiDebug.init);
