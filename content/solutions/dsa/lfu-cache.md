## Ideia

Agrupamos as chaves por frequência de uso: para cada contador há uma coleção ordenada por uso (a mais antiga primeiro, como num LRU). Dois mapas ajudam: um de chave para `[valor, frequência]` e outro de frequência para o grupo de chaves. Também guardamos a menor frequência atual, `menor`.

Ao usar uma chave, tiramos ela do grupo da frequência `f` e a colocamos no grupo `f + 1`. Se o grupo `f` esvaziou e `f` era a menor, então `menor` passa a ser `f + 1`. Ao inserir uma chave nova com o cache cheio, removemos a chave mais antiga do grupo de frequência `menor`, e depois a nova entra com frequência 1 (então `menor` volta a 1). Capacidade 0 simplesmente ignora o `put`.

## Complexidade

Tempo `O(1)` médio por operação. Espaço `O(capacity)`.

## Python

```python
from collections import OrderedDict, defaultdict


class LFUCache:
    def __init__(self, capacity):
        self.capacidade = capacity
        self.dados = {}  # chave -> [valor, frequencia]
        self.grupos = defaultdict(OrderedDict)  # frequencia -> chaves em ordem de uso
        self.menor = 0

    def _usar(self, key):
        valor, freq = self.dados[key]
        del self.grupos[freq][key]
        if not self.grupos[freq]:
            del self.grupos[freq]
            if self.menor == freq:
                self.menor = freq + 1
        self.dados[key][1] = freq + 1
        self.grupos[freq + 1][key] = None

    def get(self, key):
        if key not in self.dados:
            return -1
        self._usar(key)
        return self.dados[key][0]

    def put(self, key, value):
        if self.capacidade == 0:
            return
        if key in self.dados:
            self.dados[key][0] = value
            self._usar(key)
            return
        if len(self.dados) >= self.capacidade:
            antiga, _ = self.grupos[self.menor].popitem(last=False)
            if not self.grupos[self.menor]:
                del self.grupos[self.menor]
            del self.dados[antiga]
        self.dados[key] = [value, 1]
        self.grupos[1][key] = None
        self.menor = 1
```

## JavaScript

```javascript
class LFUCache {
  constructor(capacity) {
    this.capacidade = capacity;
    this.dados = new Map(); // chave -> [valor, frequencia]
    this.grupos = new Map(); // frequencia -> Set de chaves em ordem de uso
    this.menor = 0;
  }

  _usar(key) {
    const item = this.dados.get(key);
    const freq = item[1];
    const grupo = this.grupos.get(freq);
    grupo.delete(key);
    if (grupo.size === 0) {
      this.grupos.delete(freq);
      if (this.menor === freq) this.menor = freq + 1;
    }
    item[1] = freq + 1;
    if (!this.grupos.has(freq + 1)) this.grupos.set(freq + 1, new Set());
    this.grupos.get(freq + 1).add(key);
  }

  get(key) {
    if (!this.dados.has(key)) return -1;
    this._usar(key);
    return this.dados.get(key)[0];
  }

  put(key, value) {
    if (this.capacidade === 0) return;
    if (this.dados.has(key)) {
      this.dados.get(key)[0] = value;
      this._usar(key);
      return;
    }
    if (this.dados.size >= this.capacidade) {
      const grupo = this.grupos.get(this.menor);
      const antiga = grupo.values().next().value;
      grupo.delete(antiga);
      if (grupo.size === 0) this.grupos.delete(this.menor);
      this.dados.delete(antiga);
    }
    this.dados.set(key, [value, 1]);
    if (!this.grupos.has(1)) this.grupos.set(1, new Set());
    this.grupos.get(1).add(key);
    this.menor = 1;
  }
}
```

## TypeScript

```typescript
class LFUCache {
  private capacidade: number;
  private dados: Map<number, [number, number]> = new Map(); // chave -> [valor, frequencia]
  private grupos: Map<number, Set<number>> = new Map(); // frequencia -> chaves em ordem de uso
  private menor = 0;

  constructor(capacity: number) {
    this.capacidade = capacity;
  }

  private usar(key: number): void {
    const item = this.dados.get(key) as [number, number];
    const freq = item[1];
    const grupo = this.grupos.get(freq) as Set<number>;
    grupo.delete(key);
    if (grupo.size === 0) {
      this.grupos.delete(freq);
      if (this.menor === freq) this.menor = freq + 1;
    }
    item[1] = freq + 1;
    if (!this.grupos.has(freq + 1)) this.grupos.set(freq + 1, new Set());
    (this.grupos.get(freq + 1) as Set<number>).add(key);
  }

  get(key: number): number {
    if (!this.dados.has(key)) return -1;
    this.usar(key);
    return (this.dados.get(key) as [number, number])[0];
  }

  put(key: number, value: number): void {
    if (this.capacidade === 0) return;
    if (this.dados.has(key)) {
      (this.dados.get(key) as [number, number])[0] = value;
      this.usar(key);
      return;
    }
    if (this.dados.size >= this.capacidade) {
      const grupo = this.grupos.get(this.menor) as Set<number>;
      const antiga = grupo.values().next().value as number;
      grupo.delete(antiga);
      if (grupo.size === 0) this.grupos.delete(this.menor);
      this.dados.delete(antiga);
    }
    this.dados.set(key, [value, 1]);
    if (!this.grupos.has(1)) this.grupos.set(1, new Set());
    (this.grupos.get(1) as Set<number>).add(key);
    this.menor = 1;
  }
}
```
