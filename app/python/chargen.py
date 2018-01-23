from mytextgenrnn import textgenrnn

textgen = textgenrnn()

print '\n'

def strip_after_space(word):
    index = word.find(' ')
    if index == -1:
        return word
    else:
        return word[:index]

def get_next_words(prefix, n=5):
    words = []
    temp = 0.3
    while len(words) < n:
      sentence = textgen.generate(
          n=1, prefix=prefix, temperature=temp, return_as_list=True
      )[0]
      next_word = strip_after_space(sentence[(len(prefix)+1):])
      if next_word not in words:
          words.append(next_word)
      else:
          temp *= 1.09
    return words

print get_next_words('Hello my name is')
