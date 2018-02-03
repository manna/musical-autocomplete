from munkres import Munkres, print_matrix
from textblob import TextBlob
import numpy as np

surprisal_cost_sample_mean = 21.17
surprisal_cost_sample_std = 8.50
prosodic_cost_sample_mean = 2.77
prosodic_cost_sample_std = 1.97

def cost((word, word_loglik), (notes, melody_loglik, midi_path)):
  surprisal_cost = abs(word_loglik-melody_loglik)
  prosodic_cost = float(abs(len(notes) - len(word)))
  # word_polarity = TextBlob(word).sentences[0].polarity
  # notes_polarity = ?? # TODO

  # Normalize
  surprisal_cost = (surprisal_cost-surprisal_cost_sample_mean)/surprisal_cost_sample_std
  prosodic_cost = (prosodic_cost-prosodic_cost_sample_mean)/prosodic_cost_sample_std
  
  sentiment_cost = 0 

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