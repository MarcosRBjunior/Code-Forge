## Ideia

Precisamos de acesso por chave em O(1) e de uma ordem de uso que permita mover um item para "mais recente" e descartar o mais antigo também em O(1). Um hash sozinho não guarda ordem; uma lista duplamente ligada sozinha não acha a chave. Combinando os dois, o hash aponta direto para o nó da lista.

Em Python, `OrderedDict` já é exatamente essa combinação: `move_to_end` marca o uso e `popitem(last=False)` remove o mais antigo. Em JavaScript, o `Map` preserva a ordem de inserção, então apagar e reinserir uma chave a torna a mais recente, e a primeira chave do `Map` é sempre a mais antiga.

## Complexidade

Tempo `O(1)` médio por operação. Espaço `O(capacity)`.

## Python

```python
from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity):
        self.capacidade = capacity
        self.dados = OrderedDict()

    def get(self, key):
        if key not in self.dados:
            return -1
        self.dados.move_to_end(key)
        return self.dados[key]

    def put(self, key, value):
        if key in self.dados:
            self.dados.move_to_end(key)
        self.dados[key] = value
        if len(self.dados) > self.capacidade:
            self.dados.popitem(last=False)
```

## JavaScript

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacidade = capacity;
    this.dados = new Map();
  }

  get(key) {
    if (!this.dados.has(key)) return -1;
    const valor = this.dados.get(key);
    this.dados.delete(key);
    this.dados.set(key, valor);
    return valor;
  }

  put(key, value) {
    this.dados.delete(key);
    this.dados.set(key, value);
    if (this.dados.size > this.capacidade) {
      this.dados.delete(this.dados.keys().next().value);
    }
  }
}
```

## TypeScript

```typescript
class LRUCache {
  private capacidade: number;
  private dados: Map<number, number>;

  constructor(capacity: number) {
    this.capacidade = capacity;
    this.dados = new Map();
  }

  get(key: number): number {
    if (!this.dados.has(key)) return -1;
    const valor = this.dados.get(key) as number;
    this.dados.delete(key);
    this.dados.set(key, valor);
    return valor;
  }

  put(key: number, value: number): void {
    this.dados.delete(key);
    this.dados.set(key, value);
    if (this.dados.size > this.capacidade) {
      this.dados.delete(this.dados.keys().next().value as number);
    }
  }
}
```
