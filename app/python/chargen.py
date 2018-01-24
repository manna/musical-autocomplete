from mytextgenrnn import textgenrnn

textgen = textgenrnn()

print '\n'

def get_next_words(prefix, n=5):
    words = []
    temp = 0.2
    while len(words) < n:
        print 'data'
        raw_word = textgen.generate_word(
            n=1, prefix=prefix, temperature=temp, return_as_list=True
        )[0]
        word = raw_word[1+len(prefix):]
        if word not in words:
            words.append(word)
        else:
            temp *= 1.05
    return words

print get_next_words('Hello my name is')
