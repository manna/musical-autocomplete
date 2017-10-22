// musicevents.js
// ==
// @author Anthony Liu
// @date 2017-10-22

class MusicEvents {
  constructor(midiInput) {
    this.STEP = 25; // in ms
    this.EMPTY = 'EMPTY'; // magic number

    this.input = midiInput;
    this.queue = [];
    this.listeners = {};
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
      const notes = this.queue.slice(0, i).filter(a => a !== this.EMPTY);
      if (notes.length !== 0) this.notify('group', notes);

      // clear everything up to and including the double break from the queue
      this.queue = this.queue.slice(i);
    }
  }

  notify(type, data) {
    if (this.listeners.hasOwnProperty(type)) {
      this.listeners[type].forEach(f => f(data));
    }
  }
}
