## Ideia

Uma tabela hash guarda os pares em um array de baldes. A função de hash transforma a chave em um índice do array, aqui com `key % tamanho`, de modo que `get`, `put` e `remove` só precisam olhar um balde em vez de percorrer tudo.

Como chaves diferentes podem cair no mesmo índice (colisão), cada balde é uma pequena lista de pares `[chave, valor]`. Para gravar, procuramos a chave no balde e atualizamos o valor se ela já existe, ou acrescentamos o par. Um tamanho primo espalha melhor as chaves entre os baldes.

## Complexidade

Tempo O(1) em média por operação, com piso de O(n) no pior caso se todas as chaves colidirem. Espaço O(n + tamanho da tabela).

## Python

```python
class MyHashMap:
    def __init__(self):
        self.tamanho = 1009
        self.baldes = [[] for _ in range(self.tamanho)]

    def _balde(self, key):
        return self.baldes[key % self.tamanho]

    def put(self, key, value):
        balde = self._balde(key)
        for par in balde:
            if par[0] == key:
                par[1] = value
                return
        balde.append([key, value])

    def get(self, key):
        for chave, valor in self._balde(key):
            if chave == key:
                return valor
        return -1

    def remove(self, key):
        balde = self._balde(key)
        for i, par in enumerate(balde):
            if par[0] == key:
                balde.pop(i)
                return
```

## JavaScript

```javascript
class MyHashMap {
  constructor() {
    this.tamanho = 1009;
    this.baldes = Array.from({ length: this.tamanho }, () => []);
  }

  balde(key) {
    return this.baldes[key % this.tamanho];
  }

  put(key, value) {
    const balde = this.balde(key);
    for (const par of balde) {
      if (par[0] === key) {
        par[1] = value;
        return;
      }
    }
    balde.push([key, value]);
  }

  get(key) {
    for (const [chave, valor] of this.balde(key)) {
      if (chave === key) return valor;
    }
    return -1;
  }

  remove(key) {
    const balde = this.balde(key);
    const i = balde.findIndex((par) => par[0] === key);
    if (i !== -1) balde.splice(i, 1);
  }
}
```

## TypeScript

```typescript
class MyHashMap {
  private tamanho = 1009;
  private baldes: [number, number][][] = Array.from({ length: 1009 }, () => []);

  private balde(key: number): [number, number][] {
    return this.baldes[key % this.tamanho];
  }

  put(key: number, value: number): void {
    const balde = this.balde(key);
    for (const par of balde) {
      if (par[0] === key) {
        par[1] = value;
        return;
      }
    }
    balde.push([key, value]);
  }

  get(key: number): number {
    for (const [chave, valor] of this.balde(key)) {
      if (chave === key) return valor;
    }
    return -1;
  }

  remove(key: number): void {
    const balde = this.balde(key);
    const i = balde.findIndex((par) => par[0] === key);
    if (i !== -1) balde.splice(i, 1);
  }
}
```
