from munkres import Munkres, print_matrix

def cost((word, word_loglik), (notes, melody_loglik, midi_path)):
  surprisal_cost = abs(word_loglik-melody_loglik)
  prosodic_cost = abs(len(notes) - len(word))
  sentiment_cost = 0 # TODO

  return surprisal_cost + prosodic_cost + sentiment_cost

def assign(words, melodies):
  """
  Uses the O(n^3) Hungarian algorithm to assign words to melodies.

  @param words: [ [word, loglik], ... ]
  @param melodies: [ [notes, loglik, midi_path], ... ]
  @return {word : (notes, midi_path), ... }
  """
  matrix = [[cost(word, melody) 
             for melody in melodies]
             for word in words]
  m = Munkres()
  indices = m.compute(matrix) # word index to melody index
  return {words[row][0]:(melodies[col][0], melodies[col][2]) for (row,col) in indices}

"""
# Example usage:

>>> assign([ ['night', -3],
            ['morning', -4.5] ],
          [ [[{'pitch':61}, {'pitch':60}] , -8, 'path_1.midi'],  
            [[{'pitch':61}, {'pitch':65}] , -10, 'path_2.midi'] ])
{ 'morning': ([{'pitch': 61}, {'pitch': 65}], 'path_2.midi'), 
  'night'  : ([{'pitch': 61}, {'pitch': 60}], 'path_1.midi')  
  }
"""