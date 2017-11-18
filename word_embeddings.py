import gzip
import numpy as np

EMBEDDINGS_PATH = 'data/word_embeddings/vectors_pruned.200.txt.gz'
EMBEDDINGS_DIM = 200

class Vectorizer():
    _VECTORS = None
    UNK = [0.]*200

    @staticmethod
    def load_pretrained_vectors():
        if Vectorizer._VECTORS is not None:
            return Vectorizer._VECTORS
        
        Vectorizer._VECTORS = {}
        
        with gzip.open(EMBEDDINGS_PATH) as f:
            lines = f.readlines()
        for line in lines:
            line = line.split()
            Vectorizer._VECTORS[line[0]] = np.array(map(float, line[1:]))
        return Vectorizer

    @staticmethod
    def vectorize_word(w):
        """Returns the 200 dim word vector of w"""
        return Vectorizer._VECTORS.get(w, Vectorizer.UNK)

    @staticmethod
    def vectorize_sentence(s):
        """
        Returns a list of vectors of the words in the sentence 
        """
        return [Vectorizer.vectorize_word(w) for w in s.split()] # + [Vectorizer.vectorize_word('<eos>')]

Vectorizer.load_pretrained_vectors()


# Example usage
print(Vectorizer.vectorize_word('box'))
print(Vectorizer.vectorize_sentence('blue box'))