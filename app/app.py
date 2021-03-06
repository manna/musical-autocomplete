from flask import Flask, render_template, jsonify, request
from mytextgenrnn import textgenrnn
from word2melody_assigner import assign
import random
import json
import simplejson
import requests
app = Flask(__name__)
textgen = textgenrnn()

# Prototype
# ==
#
# Stores app's state, such as the current words typed so far
# Shortcomings:
# - does not persist across server reloads
# - would not function as expected when running on multiple machines
# - does not support multiple concurrent clients
# Justification:
# - this server is run locally, so there will only ever be 1 server & 1 client
# - the data is not sensitve, so persistence isn't necessary
initial_prefix = ''
state = { 'prefix': initial_prefix, 'note_history': [] }

# helpers
# ==
# get next words according to the language model
def get_next_words(prefix, n=5, max_attempts=100):
    words = {}
    temp = 0.2
    attempts = 0
    while len(words) < n and attempts < max_attempts:
        attempts += 1
        raw_word, likelihood = textgen.generate_word(
            n=1, prefix=prefix, temperature=temp, return_as_list=True,
            max_gen_length=1000
        )[0]
        word = raw_word[len(prefix):]
        if word not in words:
            words[word] = likelihood
        else:
            temp *= 1.05
    return words.items()


def melodies_are_same(a, b):
    if len(a) != len(b): return False
    for pair in zip(a, b):
        if pair[0] != pair[1]: return False
    return True


def get_random_melody(melody_size):
    return [
        random.choice([60, 62, 63, 65, 66, 67, 70]) for _ in range(melody_size)
    ]


def get_random_melodies(note_history, n, melody_size):
    melodies = []
    while len(melodies) < n:
        random_melody = get_random_melody(melody_size)
        for melody in melodies:
            if melodies_are_same(melody, random_melody): continue
        melodies.append(random_melody)
    return melodies

def get_melodies(note_history, n, melody_size):
    """
    melody_size : # of 16ths in the melody's total playing time

    Returns:
        - [(notes, loglik, midi_file), ...] such that each `notes` begins with
        `note_history`
    """
    r = requests.post("http://localhost:5001",
        data=json.dumps({
            'num_outputs': n,
            'primer_melody': note_history[-8:],
            'num_steps':melody_size
            }),
        headers={'Content-Type': 'application/json'}
        )
    melodies = simplejson.loads(str(r.text).splitlines()[-1])
    max_melody_len = 4
    melodies = map(
        lambda (notes, loglik, midi_path):
        (notes[len(note_history):len(note_history)+max_melody_len],
        loglik, midi_path),
        melodies
    )
    return melodies
    # for notes, loglik, midi_file in melodies:
    #     yield map(lambda note:note['pitch'], notes)

# convenience method to update next words and the version
def update_next_words():
    sample_count = 10
    melody_size = min(len(state['note_history']), 12)*3 + 24
    words_and_likelihoods = get_next_words(state['prefix'], n=sample_count)
    melodies_and_likelihoods = get_melodies(
        state['note_history'][-12:],
        sample_count,
        melody_size
        )
    assignment = assign(words_and_likelihoods, melodies_and_likelihoods)
    # `assignment` looks like `{word : (notes, midi_path), ... }`
    words, notes_and_midi_paths = zip(*assignment.items())
    state['next_words'] = words
    state['melodies'] = map(
        lambda (notes, midi_path):
        map(lambda note:note['pitch'],notes),
        notes_and_midi_paths
    )
    state['version'] = hash(state['prefix'])

# init state
update_next_words()


# routes
# ==
# home page
@app.route('/')
def main():
    return render_template('main.html')


# get a dictionary of the app's current state
@app.route('/state', methods=['POST'])
def retrieve_state():
    if state['version'] != hash(state['prefix']):
        update_next_words()

    return jsonify(state)


# observe a selected word from the client and update state, return new state
@app.route('/consume', methods=['POST'])
def consume_word():
    chosen_word = request.form['chosen_word']
    note_history = request.form['note_history']
    state['note_history'] = json.loads(note_history)
    if chosen_word == '.':
        state['prefix'] = state['prefix'].rstrip() + '. '
    elif chosen_word == '?':
        state['prefix'] = state['prefix'].rstrip() + '? '
    elif chosen_word == '!':
        state['prefix'] = state['prefix'].rstrip() + '! '
    else:
        state['prefix'] += chosen_word
    update_next_words()
    return jsonify(state)


# roll the dice again to get new top 10 next word predictions
@app.route('/refresh', methods=['POST'])
def refresh_next_words():
    update_next_words()
    return jsonify(state)
