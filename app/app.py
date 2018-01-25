from flask import Flask, render_template, jsonify, request
from mytextgenrnn import textgenrnn
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
state = { 'prefix': initial_prefix }

# helpers
# ==
# get next words according to the language model
def get_next_words(prefix, n=5, max_attempts=100):
    words = []
    temp = 0.2
    attempts = 0
    while len(words) < n and attempts < max_attempts:
        attempts += 1
        raw_word = textgen.generate_word(
            n=1, prefix=prefix, temperature=temp, return_as_list=True,
            max_gen_length=1000
        )[0]
        print raw_word
        word = raw_word[len(prefix):]
        if word not in words:
            words.append(word)
        else:
            temp *= 1.05
    return words


# convenience method to update next words and the version
def update_next_words():
    state['next_words'] = get_next_words(state['prefix'], n=10)
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
    state['prefix'] += chosen_word + ' '
    update_next_words()
    return jsonify(state)


# roll the dice again to get new top 10 next word predictions
@app.route('/refresh', methods=['POST'])
def refresh_next_words():
    update_next_words()
    return jsonify(state)
