## Ideia

Trate cada palavra como um vértice, com aresta entre palavras que diferem em uma letra. O menor número de passos num grafo sem pesos sai de uma busca em largura (BFS) a partir de `begin_word`, contando as palavras do caminho.

Para achar os vizinhos sem comparar todos os pares, troque cada posição da palavra por cada letra de `a` a `z` e veja se o resultado está num conjunto com a lista de palavras. Cada palavra visitada é removida do conjunto para não ser processada de novo. Se `end_word` não está na lista, a resposta é 0.

## Complexidade

Tempo O(N * L * 26), com `N` palavras de tamanho `L` (mais o custo de montar as strings). Espaço O(N * L).

## Python

```python
from collections import deque

def ladder_length(begin_word, end_word, word_list):
    restantes = set(word_list)
    if end_word not in restantes:
        return 0
    fila = deque([(begin_word, 1)])
    restantes.discard(begin_word)
    while fila:
        palavra, passos = fila.popleft()
        if palavra == end_word:
            return passos
        for i in range(len(palavra)):
            for c in "abcdefghijklmnopqrstuvwxyz":
                if c == palavra[i]:
                    continue
                vizinha = palavra[:i] + c + palavra[i + 1:]
                if vizinha in restantes:
                    restantes.remove(vizinha)
                    fila.append((vizinha, passos + 1))
    return 0
```

## JavaScript

```javascript
function ladderLength(beginWord, endWord, wordList) {
  const restantes = new Set(wordList);
  if (!restantes.has(endWord)) return 0;
  restantes.delete(beginWord);
  const fila = [[beginWord, 1]];
  for (let k = 0; k < fila.length; k++) {
    const [palavra, passos] = fila[k];
    if (palavra === endWord) return passos;
    for (let i = 0; i < palavra.length; i++) {
      for (let c = 97; c <= 122; c++) {
        const letra = String.fromCharCode(c);
        if (letra === palavra[i]) continue;
        const vizinha = palavra.slice(0, i) + letra + palavra.slice(i + 1);
        if (restantes.has(vizinha)) {
          restantes.delete(vizinha);
          fila.push([vizinha, passos + 1]);
        }
      }
    }
  }
  return 0;
}
```

## TypeScript

```typescript
function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const restantes = new Set<string>(wordList);
  if (!restantes.has(endWord)) return 0;
  restantes.delete(beginWord);
  const fila: [string, number][] = [[beginWord, 1]];
  for (let k = 0; k < fila.length; k++) {
    const [palavra, passos] = fila[k];
    if (palavra === endWord) return passos;
    for (let i = 0; i < palavra.length; i++) {
      for (let c = 97; c <= 122; c++) {
        const letra = String.fromCharCode(c);
        if (letra === palavra[i]) continue;
        const vizinha = palavra.slice(0, i) + letra + palavra.slice(i + 1);
        if (restantes.has(vizinha)) {
          restantes.delete(vizinha);
          fila.push([vizinha, passos + 1]);
        }
      }
    }
  }
  return 0;
}
```

## Java

```java
class Solution {
    public int ladderLength(String beginWord, String endWord, String[] wordList) {
        Set<String> restantes = new HashSet<>(Arrays.asList(wordList));
        if (!restantes.contains(endWord)) return 0;
        restantes.remove(beginWord);
        Deque<String> fila = new ArrayDeque<>();
        fila.add(beginWord);
        int passos = 1;
        while (!fila.isEmpty()) {
            for (int tam = fila.size(); tam > 0; tam--) {
                String palavra = fila.poll();
                if (palavra.equals(endWord)) return passos;
                char[] letras = palavra.toCharArray();
                for (int i = 0; i < letras.length; i++) {
                    char original = letras[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        if (c == original) continue;
                        letras[i] = c;
                        String vizinha = new String(letras);
                        if (restantes.remove(vizinha)) fila.add(vizinha);
                    }
                    letras[i] = original;
                }
            }
            passos++;
        }
        return 0;
    }
}
```

## C++

```cpp
class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> restantes(wordList.begin(), wordList.end());
        if (!restantes.count(endWord)) return 0;
        restantes.erase(beginWord);
        queue<string> fila;
        fila.push(beginWord);
        int passos = 1;
        while (!fila.empty()) {
            for (int tam = fila.size(); tam > 0; tam--) {
                string palavra = fila.front();
                fila.pop();
                if (palavra == endWord) return passos;
                for (size_t i = 0; i < palavra.size(); i++) {
                    char original = palavra[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        if (c == original) continue;
                        palavra[i] = c;
                        if (restantes.erase(palavra)) fila.push(palavra);
                    }
                    palavra[i] = original;
                }
            }
            passos++;
        }
        return 0;
    }
};
```

## C#

```csharp
public class Solution {
    public int LadderLength(string beginWord, string endWord, string[] wordList) {
        var restantes = new HashSet<string>(wordList);
        if (!restantes.Contains(endWord)) return 0;
        restantes.Remove(beginWord);
        var fila = new Queue<string>();
        fila.Enqueue(beginWord);
        int passos = 1;
        while (fila.Count > 0) {
            for (int tam = fila.Count; tam > 0; tam--) {
                string palavra = fila.Dequeue();
                if (palavra == endWord) return passos;
                var letras = palavra.ToCharArray();
                for (int i = 0; i < letras.Length; i++) {
                    char original = letras[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        if (c == original) continue;
                        letras[i] = c;
                        string vizinha = new string(letras);
                        if (restantes.Remove(vizinha)) fila.Enqueue(vizinha);
                    }
                    letras[i] = original;
                }
            }
            passos++;
        }
        return 0;
    }
}
```

## Go

```go
func ladderLength(beginWord string, endWord string, wordList []string) int {
	restantes := make(map[string]bool, len(wordList))
	for _, w := range wordList {
		restantes[w] = true
	}
	if !restantes[endWord] {
		return 0
	}
	delete(restantes, beginWord)
	fila := []string{beginWord}
	passos := 1
	for len(fila) > 0 {
		proximos := []string{}
		for _, palavra := range fila {
			if palavra == endWord {
				return passos
			}
			letras := []byte(palavra)
			for i := range letras {
				original := letras[i]
				for c := byte('a'); c <= 'z'; c++ {
					if c == original {
						continue
					}
					letras[i] = c
					vizinha := string(letras)
					if restantes[vizinha] {
						delete(restantes, vizinha)
						proximos = append(proximos, vizinha)
					}
				}
				letras[i] = original
			}
		}
		fila = proximos
		passos++
	}
	return 0
}
```
