## Ideia

Uma trie guarda as palavras letra por letra: cada nó tem um mapa de filhos e uma marca dizendo se uma palavra termina ali. Adicionar é descer criando os nós que faltam e marcar o último.

Na busca, uma letra comum segue um único filho. Um ponto precisa tentar todos os filhos do nó atual, então a busca é recursiva: se algum ramo casar até o fim do padrão e terminar em um nó marcado, a resposta é verdadeira. Como o enunciado limita a 2 pontos por busca, a ramificação fica controlada. O casamento exige o nó final marcado, então prefixos não contam.

## Complexidade

Adicionar custa `O(L)` para uma palavra de tamanho `L`. Buscar custa `O(L)` sem pontos e, no pior caso, `O(26^p * L)` com `p` pontos. O espaço é proporcional ao total de letras guardadas.

## Python

```python
class WordDictionary:
    def __init__(self):
        self.raiz = {}

    def add_word(self, word):
        no = self.raiz
        for letra in word:
            no = no.setdefault(letra, {})
        no["$"] = True

    def search(self, word):
        def buscar(no, i):
            if i == len(word):
                return "$" in no
            letra = word[i]
            if letra == ".":
                return any(buscar(filho, i + 1)
                           for chave, filho in no.items() if chave != "$")
            return letra in no and buscar(no[letra], i + 1)

        return buscar(self.raiz, 0)
```

## JavaScript

```javascript
class WordDictionary {
  constructor() {
    this.raiz = { filhos: new Map(), fim: false };
  }

  addWord(word) {
    let no = this.raiz;
    for (const letra of word) {
      if (!no.filhos.has(letra)) no.filhos.set(letra, { filhos: new Map(), fim: false });
      no = no.filhos.get(letra);
    }
    no.fim = true;
  }

  search(word) {
    const buscar = (no, i) => {
      if (i === word.length) return no.fim;
      const letra = word[i];
      if (letra === ".") {
        for (const filho of no.filhos.values()) {
          if (buscar(filho, i + 1)) return true;
        }
        return false;
      }
      const filho = no.filhos.get(letra);
      return filho !== undefined && buscar(filho, i + 1);
    };
    return buscar(this.raiz, 0);
  }
}
```

## TypeScript

```typescript
interface NoTrie {
  filhos: Map<string, NoTrie>;
  fim: boolean;
}

class WordDictionary {
  private raiz: NoTrie;

  constructor() {
    this.raiz = { filhos: new Map(), fim: false };
  }

  addWord(word: string): void {
    let no = this.raiz;
    for (const letra of word) {
      if (!no.filhos.has(letra)) no.filhos.set(letra, { filhos: new Map(), fim: false });
      no = no.filhos.get(letra)!;
    }
    no.fim = true;
  }

  search(word: string): boolean {
    const buscar = (no: NoTrie, i: number): boolean => {
      if (i === word.length) return no.fim;
      const letra = word[i];
      if (letra === ".") {
        for (const filho of no.filhos.values()) {
          if (buscar(filho, i + 1)) return true;
        }
        return false;
      }
      const filho = no.filhos.get(letra);
      return filho !== undefined && buscar(filho, i + 1);
    };
    return buscar(this.raiz, 0);
  }
}
```
