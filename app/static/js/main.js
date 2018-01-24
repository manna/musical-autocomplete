const MidiDebug = (function() {
  // constants
  const INPUT_NAME = 'Keystation 88 MIDI 1';
  const WORDS = [
    "the", "a", "destroy", "create", "i", "arman", "dinosaur", "ears", "listen", "music", "water",

    "energetic", "harmonious",

    "program", "study", "eat", "sleep", "play"
  ];
  const GOOD_WORDS = [
    "time", "person", "year", "way", "day", "thing", "man", "world", "life", "hand", "part", "child", "eye", "woman", "place", "work", "week", "case", "point", "government", "company", "number", "group", "problem", "fact", "be", "have", "do", "say", "get", "make", "go", "know", "take", "see", "come", "think", "look", "want", "give", "use", "find", "tell", "ask", "work", "seem", "feel", "try", "leave", "call", "good", "new", "first", "last", "long", "great", "little", "own", "other", "old", "right", "big", "high", "different", "small", "large", "next", "early", "young", "important", "few", "public", "bad", "same", "able", "to", "of", "in", "for", "on", "with", "at", "by", "from", "up", "about", "into", "over", "after", "the", "and", "a", "that", "I", "it", "not", "he", "as", "you", "this", "but", "his", "they", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their"
  ];
  const LOW_CHORD = 'D#Maj7';
  const HIGH_CHORD = 'G#Maj7';
  const CLEAR_CHORD = 'Gm7';
  let low = 0;
  let high = WORDS.length;
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

  function render(data) {
    const word_list = document.getElementById('word-list');
    word_list.innerHTML = '';
    data['next_words'].forEach(next_word => {
      const word_element = document.createElement('div');
      word_element.innerHTML = next_word;
      word_list.appendChild(word_element);
    });
  }

  return {
    init: initMidiDebug
  };
})();

window.addEventListener('DOMContentLoaded', MidiDebug.init);
