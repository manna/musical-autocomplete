const MidiDebug = (function() {
  // constants
  const message = [];
  let prev_length = 0;
  let previous_state = {};
  let AJAX_LOCK = false;

  // work functions
  function initMidiDebug() {
    // get initial state
    $.post('/state', function success(data) {
      render(data);
      prev_length = previous_state.note_history.length;
    });

    // set up the glue for the emulated (or real) midi device
    Drivers.real(
      function success() { // let users type in individual keys
        window.addEventListener('keyup', (e) => {
          if (!AJAX_LOCK && e.key !== 'Shift') {
            // optimistic update
            document.getElementById('text').innerHTML += e.key;
            toggleLoadingOn();
            AJAX_LOCK = true;

            choose_word(e.key, () => {
              toggleLoadingOff();
              AJAX_LOCK = false;
            });
          }
        })
      },
      Drivers.keyboard
    );

    // misc event listeners
    const musicEvents = new MusicEvents(Tonal.Note.midi("C3"));
    musicEvents.addEventListener('group', data => {
      // add the notes to the history
      Array.prototype.push.apply(
        previous_state.note_history,
        data.notes.map(n => Tonal.Note.midi(n))
      );

      // check suffix against melodies
      // TODO: this function is fat af abstract #dat #shit
      for (let i = 0; i < previous_state['melodies'].length; i++) {
        const melody = previous_state['melodies'][i];
        let different = false;
        const num_new_notes = previous_state.note_history.length - prev_length;
        if (melody.length > num_new_notes) continue;

        for (let j = 1; j <= melody.length; j++) {
          const prev_note_chroma = Tonal.Note.chroma(Tonal.Note.fromMidi(
            previous_state.note_history[previous_state.note_history.length - j]
          ));
          const melody_note_chroma = Tonal.Note.chroma(Tonal.Note.fromMidi(
            melody[melody.length - j]
          ));
          if (prev_note_chroma !== melody_note_chroma) different = true;
        }
        if (!different && !AJAX_LOCK) {
          // update prev length state to avoid counting these notes again
          prev_length = previous_state.note_history.length;

          // select word i
          const selected_word = previous_state['next_words'][i]
          AJAX_LOCK = true;

          // optimistic update
          document.getElementById('text').innerHTML += ' ' + selected_word;
          toggleLoadingOn();

          choose_word(selected_word + ' ', () => {
            toggleLoadingOff();
            AJAX_LOCK = false;
          });
          break;
        }
      }

      // logging stuff
      if (data.type === musicEvents.NOTES) {
        console.log(data.notes.map(n => `${n}(${Tonal.Note.midi(n)})`).join(','));
      } else {
        handleChord(data);
      }
    });

    document.getElementById('refresh').addEventListener('click', () => {
      toggleLoadingOn();
      $.post('/refresh', function success(data) {
        toggleLoadingOff();
        render(data);
      });
    });
  }

  function toggleLoadingOn() {
    document.getElementById('action-container').style.display = 'none';
    document.getElementById('loading-container').style.display = 'block';
  }

  function toggleLoadingOff() {
    document.getElementById('action-container').style.display = 'block';
    document.getElementById('loading-container').style.display = 'none';
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
    const last_char_index = previous_state.prefix.length - 1;
    const last_char_space = previous_state.prefix.charAt(last_char_index) === ' ';
    const last_space = previous_state.prefix.lastIndexOf(' ');
    const unfinished_prefix = previous_state.prefix.substring(last_space);
    const render_prefix = '<span style="color: #FAB02F">' +
      (last_char_space ? '' : unfinished_prefix) +
      '</span>';
    data['next_words'].forEach((next_word, i) => {
      const next_melody = data['melodies'][i]
        .map(n => Tonal.Note.fromMidi(n))
        .map(n => n.substring(0, n.length - 1));
      const word_element = document.createElement('div');
      word_element.className = 'word-element';
      word_element.innerHTML = render_prefix + next_word +
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
            toggleLoadingOn();
            
            return choose_word(next_word_closure + ' ', () => {
              toggleLoadingOff();
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
