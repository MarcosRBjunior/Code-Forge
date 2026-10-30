## Ideia

Guardamos todas as raízes numa trie, marcando o nó onde cada raiz termina. Para cada palavra da frase, descemos pela trie letra a letra: ao encontrar o primeiro nó marcado, temos a menor raiz que é prefixo da palavra, e a palavra é trocada por esse prefixo. Se a trie acabar antes de achar uma marca, ou a palavra terminar, ela fica como está.

Como paramos no primeiro nó marcado, a raiz escolhida é automaticamente a mais curta.

## Complexidade

Tempo O(D + S), onde D é a soma dos tamanhos das raízes e S o tamanho da frase, pois cada palavra anda no máximo o seu comprimento na trie. Espaço O(D) para a trie.

## Python

```python
def replace_words(dictionary, sentence):
    raiz = {}
    for palavra in dictionary:
        no = raiz
        for c in palavra:
            no = no.setdefault(c, {})
        no["$"] = True

    def encurtar(palavra):
        no = raiz
        for i, c in enumerate(palavra):
            if c not in no:
                return palavra
            no = no[c]
            if "$" in no:
                return palavra[:i + 1]
        return palavra

    return " ".join(encurtar(p) for p in sentence.split(" "))
```

## JavaScript

```javascript
function replaceWords(dictionary, sentence) {
  const raiz = {};
  for (const palavra of dictionary) {
    let no = raiz;
    for (const c of palavra) {
      if (!no[c]) no[c] = {};
      no = no[c];
    }
    no.fim = true;
  }
  const encurtar = (palavra) => {
    let no = raiz;
    for (let i = 0; i < palavra.length; i++) {
      no = no[palavra[i]];
      if (!no) return palavra;
      if (no.fim) return palavra.slice(0, i + 1);
    }
    return palavra;
  };
  return sentence.split(" ").map(encurtar).join(" ");
}
```

## TypeScript

```typescript
interface NoTrie {
  filhos: Map<string, NoTrie>;
  fim: boolean;
}

function replaceWords(dictionary: string[], sentence: string): string {
  const novoNo = (): NoTrie => ({ filhos: new Map(), fim: false });
  const raiz = novoNo();
  for (const palavra of dictionary) {
    let no = raiz;
    for (const c of palavra) {
      let prox = no.filhos.get(c);
      if (!prox) {
        prox = novoNo();
        no.filhos.set(c, prox);
      }
      no = prox;
    }
    no.fim = true;
  }
  const encurtar = (palavra: string): string => {
    let no = raiz;
    for (let i = 0; i < palavra.length; i++) {
      const prox = no.filhos.get(palavra[i]);
      if (!prox) return palavra;
      no = prox;
      if (no.fim) return palavra.slice(0, i + 1);
    }
    return palavra;
  };
  return sentence.split(" ").map(encurtar).join(" ");
}
```

## Java

```java
class Solution {
    static class No {
        No[] filhos = new No[26];
        boolean fim;
    }

    public String replaceWords(String[] dictionary, String sentence) {
        No raiz = new No();
        for (String palavra : dictionary) {
            No no = raiz;
            for (char c : palavra.toCharArray()) {
                if (no.filhos[c - 'a'] == null) no.filhos[c - 'a'] = new No();
                no = no.filhos[c - 'a'];
            }
            no.fim = true;
        }
        StringBuilder sb = new StringBuilder();
        for (String palavra : sentence.split(" ")) {
            if (sb.length() > 0) sb.append(' ');
            No no = raiz;
            int corte = palavra.length();
            for (int i = 0; i < palavra.length(); i++) {
                no = no.filhos[palavra.charAt(i) - 'a'];
                if (no == null) break;
                if (no.fim) {
                    corte = i + 1;
                    break;
                }
            }
            sb.append(palavra, 0, corte);
        }
        return sb.toString();
    }
}
```

## C++

```cpp
class Solution {
    struct No {
        No* filhos[26] = {};
        bool fim = false;
    };

public:
    string replaceWords(vector<string>& dictionary, string sentence) {
        vector<unique_ptr<No>> pool;
        pool.push_back(make_unique<No>());
        No* raiz = pool[0].get();
        for (const string& palavra : dictionary) {
            No* no = raiz;
            for (char c : palavra) {
                if (!no->filhos[c - 'a']) {
                    pool.push_back(make_unique<No>());
                    no->filhos[c - 'a'] = pool.back().get();
                }
                no = no->filhos[c - 'a'];
            }
            no->fim = true;
        }
        string resultado;
        istringstream in(sentence);
        string palavra;
        while (in >> palavra) {
            if (!resultado.empty()) resultado += ' ';
            No* no = raiz;
            size_t corte = palavra.size();
            for (size_t i = 0; i < palavra.size(); i++) {
                no = no->filhos[palavra[i] - 'a'];
                if (!no) break;
                if (no->fim) {
                    corte = i + 1;
                    break;
                }
            }
            resultado += palavra.substr(0, corte);
        }
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    class No {
        public No[] Filhos = new No[26];
        public bool Fim;
    }

    public string ReplaceWords(string[] dictionary, string sentence) {
        var raiz = new No();
        foreach (var palavra in dictionary) {
            var no = raiz;
            foreach (char c in palavra) {
                if (no.Filhos[c - 'a'] == null) no.Filhos[c - 'a'] = new No();
                no = no.Filhos[c - 'a'];
            }
            no.Fim = true;
        }
        var partes = new List<string>();
        foreach (var palavra in sentence.Split(' ')) {
            var no = raiz;
            int corte = palavra.Length;
            for (int i = 0; i < palavra.Length; i++) {
                no = no.Filhos[palavra[i] - 'a'];
                if (no == null) break;
                if (no.Fim) {
                    corte = i + 1;
                    break;
                }
            }
            partes.Add(palavra.Substring(0, corte));
        }
        return string.Join(" ", partes);
    }
}
```

## Go

```go
import "strings"

type noTrie struct {
	filhos [26]*noTrie
	fim    bool
}

func replaceWords(dictionary []string, sentence string) string {
	raiz := &noTrie{}
	for _, palavra := range dictionary {
		no := raiz
		for i := 0; i < len(palavra); i++ {
			c := palavra[i] - 'a'
			if no.filhos[c] == nil {
				no.filhos[c] = &noTrie{}
			}
			no = no.filhos[c]
		}
		no.fim = true
	}
	palavras := strings.Split(sentence, " ")
	for k, palavra := range palavras {
		no := raiz
		for i := 0; i < len(palavra); i++ {
			no = no.filhos[palavra[i]-'a']
			if no == nil {
				break
			}
			if no.fim {
				palavras[k] = palavra[:i+1]
				break
			}
		}
	}
	return strings.Join(palavras, " ")
}
```
