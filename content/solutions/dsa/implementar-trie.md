## Ideia

Cada nó da trie guarda um mapa de caractere para nó filho e uma marca indicando se uma palavra termina ali. Inserir uma palavra é descer pela raiz criando os nós que faltam e, no último, ligar a marca de fim de palavra.

`search` e `startsWith` fazem a mesma descida. A diferença é o que se exige no final: `startsWith` só precisa que o caminho exista, enquanto `search` também exige a marca de fim. É essa marca que distingue "mac" inserida como palavra de "mac" que é só prefixo de "maca".

## Complexidade

Cada operação custa O(L), com L o tamanho da palavra ou do prefixo. O espaço total é O(soma dos tamanhos das palavras inseridas).

## Python

```python
class Trie:
    def __init__(self):
        self.filhos = {}
        self.fim = False

    def insert(self, word):
        no = self
        for letra in word:
            if letra not in no.filhos:
                no.filhos[letra] = Trie()
            no = no.filhos[letra]
        no.fim = True

    def _descer(self, texto):
        no = self
        for letra in texto:
            no = no.filhos.get(letra)
            if no is None:
                return None
        return no

    def search(self, word):
        no = self._descer(word)
        return no is not None and no.fim

    def starts_with(self, prefix):
        return self._descer(prefix) is not None
```

## JavaScript

```javascript
class Trie {
  constructor() {
    this.filhos = new Map();
    this.fim = false;
  }

  insert(word) {
    let no = this;
    for (const letra of word) {
      if (!no.filhos.has(letra)) no.filhos.set(letra, new Trie());
      no = no.filhos.get(letra);
    }
    no.fim = true;
  }

  descer(texto) {
    let no = this;
    for (const letra of texto) {
      no = no.filhos.get(letra);
      if (no === undefined) return null;
    }
    return no;
  }

  search(word) {
    const no = this.descer(word);
    return no !== null && no.fim;
  }

  startsWith(prefix) {
    return this.descer(prefix) !== null;
  }
}
```

## TypeScript

```typescript
class Trie {
  private filhos = new Map<string, Trie>();
  private fim = false;

  insert(word: string): void {
    let no: Trie = this;
    for (const letra of word) {
      if (!no.filhos.has(letra)) no.filhos.set(letra, new Trie());
      no = no.filhos.get(letra)!;
    }
    no.fim = true;
  }

  private descer(texto: string): Trie | null {
    let no: Trie = this;
    for (const letra of texto) {
      const proximo = no.filhos.get(letra);
      if (proximo === undefined) return null;
      no = proximo;
    }
    return no;
  }

  search(word: string): boolean {
    const no = this.descer(word);
    return no !== null && no.fim;
  }

  startsWith(prefix: string): boolean {
    return this.descer(prefix) !== null;
  }
}
```
