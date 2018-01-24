// musicevents.js
// ==
// @author Anthony Liu
// @date 2017-10-22

class MusicEvents {
  constructor(midiInput) {
    const self = this;
    this.STEP = 25; // in ms
    this.NOTES = 'NOTES'; // magic numbers
    this.CHORD = 'CHORD';
    this.EMPTY = 'EMPTY';

    this.input = midiInput;
    this.queue = [];
    this.listeners = {};
    this.chordDict = {};
    Tonal.Dictionary.chord.names().forEach(name => {
      self.chordDict[Tonal.Dictionary.chord(name).join(' ')] = name;
    });
    this.init();
  }

  init() {
    const self = this;

    // this helps keep track of note groups
    setInterval(() => {
      self.queue.push(self.EMPTY);
      self.processQueue();
    }, this.STEP);

    this.input.addListener('noteon', 'all', e => {
      const note = e.note.name + e.note.octave;
      self.queue.push(note);
    });
  }

  addEventListener(type, f) {
    if (!this.listeners.hasOwnProperty(type)) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(f);
  }

  processQueue() {
    // read entire queue until the first double break
    let prev = '';
    for (var i = 0; i < this.queue.length; i++) {
      const note = this.queue[i];
      if (prev === this.EMPTY && note === this.EMPTY) break;
      else prev = note;
    }

    if (i !== this.queue.length) {
      // output all of the notes before the first double break as a group
      const notes = Tonal.Array
        .sort(this.queue.slice(0, i).filter(a => a !== this.EMPTY))
        .filter(note => {
          return Tonal.Note.midi(note) > 48;
        });
      if (notes.length !== 0) this.notify('group', this.classify(notes));

      // clear everything up to and including the double break from the queue
      this.queue = this.queue.slice(i);
    }
  }

  // assumes notes is sorted and notes.length > 0
  classify(notes) {
    if (notes.length <= 2) {
      return {type: this.NOTES, notes};
    } else {
      for (let i = 0; i < notes.length; i++) {
        const currNotes = notes
          .slice(i, notes.length)
          .concat(notes.slice(0, i).map(note => {
            return Tonal.Distance.transpose(note, '8P');
          }));
        const rootName = Tonal.Note.pc(currNotes[0]);
        const intervals = currNotes.map(note => {
          return Tonal.Interval.fromSemitones(
            Tonal.Distance.semitones(currNotes[0], note)
          );
        });
        const chordType = this.chordDict[intervals.join(' ')];
        if (chordType) {
          const chord = rootName + chordType;
          const inversions = (notes.length - i) % notes.length;
          return {type: this.CHORD, notes, chord, inversions};
        }
      }
      return {type: this.CHORD, notes, chord: 'unknown'};
    }
  }

  notify(type, data) {
    if (this.listeners.hasOwnProperty(type)) {
      this.listeners[type].forEach(f => f(data));
    }
  }
}
