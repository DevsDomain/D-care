# bm25.py - Implementação simples de BM25Okapi (pura Python)
import math
from collections import Counter

class BM25:
    def __init__(self, documents, k1=1.5, b=0.75):
        """
        documents: lista de strings (textos)
        """
        self.docs = [self._tokenize(d) for d in documents]
        self.N = len(self.docs)
        self.avgdl = sum(len(d) for d in self.docs) / self.N if self.N > 0 else 0.0
        self.k1 = k1
        self.b = b

        # document frequency por termo
        self.df = {}
        for d in self.docs:
            for term in set(d):
                self.df[term] = self.df.get(term, 0) + 1

        # idf por termo (suavizado)
        self.idf = {}
        for term, freq in self.df.items():
            self.idf[term] = math.log(1 + (self.N - freq + 0.5) / (freq + 0.5))

        # frequências por documento (Counter)
        self.freqs = [Counter(d) for d in self.docs]

    def _tokenize(self, text):
        import re
        # normalização simples (mantém letras acentuadas)
        s = text.lower()
        s = re.sub(r'[^0-9a-zA-ZÀ-ÿ\s]', ' ', s)
        tokens = re.sub(r'\s+', ' ', s).strip().split(' ')
        return [t for t in tokens if len(t) > 0]

    def get_scores(self, query, top_n=None):
        q_terms = self._tokenize(query)
        scores = [0.0 for _ in range(self.N)]
        for idx in range(self.N):
            doc_len = len(self.docs[idx])
            for term in q_terms:
                if term not in self.freqs[idx]:
                    continue
                tf = self.freqs[idx][term]
                idf = self.idf.get(term, 0.0)
                denom = tf + self.k1 * (1 - self.b + self.b * doc_len / self.avgdl)
                score = idf * tf * (self.k1 + 1) / denom
                scores[idx] += score
        if top_n:
            ranked = sorted(range(self.N), key=lambda i: scores[i], reverse=True)[:top_n]
            return [(i, scores[i]) for i in ranked]
        return list(enumerate(scores))
