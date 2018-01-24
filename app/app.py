from flask import Flask, render_template, jsonify
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
initial_prefix = 'if you love something then let it'
state = { 'prefix': initial_prefix }

# helpers
# ==
# get next words according to the language model
def get_next_words(prefix, n=5):
    words = []
    temp = 0.2
    while len(words) < n:
        raw_word = textgen.generate_word(
            n=1, prefix=prefix, temperature=temp, return_as_list=True
        )[0]
        word = raw_word[1+len(prefix):]
        print word
        if word not in words:
            words.append(word)
        else:
            temp *= 1.05
    return words


# convenience method to update next words and the version
def update_next_words():
    state['next_words'] = get_next_words(state['prefix'], n=8)
    state['version'] = hash(' '.join(state['prefix']))

# init state
update_next_words()


# routes
# ==
@app.route('/')
def main():
    return render_template('main.html')


@app.route('/state', methods=['POST'])
def retrieve_state():
    if state['version'] != hash(' '.join(state['prefix'])):
        update_next_words()

    return jsonify(state)
