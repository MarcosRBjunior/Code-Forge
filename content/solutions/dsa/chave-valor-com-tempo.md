## Ideia

Para cada chave guarde duas listas paralelas, uma de carimbos e outra de valores. Como os carimbos de `set` chegam sempre em ordem crescente, basta acrescentar ao final e a lista de carimbos já fica ordenada.

Para responder `get(key, timestamp)`, procure por busca binária o último carimbo menor ou igual a `timestamp`. Se não existir (a chave é desconhecida ou todos os carimbos são maiores), a resposta é a string vazia. Caso contrário, o valor na mesma posição é a resposta.

## Complexidade

`set` custa `O(1)` amortizado e `get` custa `O(log k)`, com `k` o número de registros da chave. O espaço é `O(total de set)`.

## Python

```python
from bisect import bisect_right


class TimeMap:
    def __init__(self):
        self.historico = {}

    def set(self, key, value, timestamp):
        carimbos, valores = self.historico.setdefault(key, ([], []))
        carimbos.append(timestamp)
        valores.append(value)

    def get(self, key, timestamp):
        if key not in self.historico:
            return ""
        carimbos, valores = self.historico[key]
        pos = bisect_right(carimbos, timestamp)
        return valores[pos - 1] if pos > 0 else ""
```

## JavaScript

```javascript
class TimeMap {
  constructor() {
    this.historico = new Map();
  }

  set(key, value, timestamp) {
    if (!this.historico.has(key)) this.historico.set(key, { carimbos: [], valores: [] });
    const reg = this.historico.get(key);
    reg.carimbos.push(timestamp);
    reg.valores.push(value);
  }

  get(key, timestamp) {
    const reg = this.historico.get(key);
    if (!reg) return "";
    let lo = 0;
    let hi = reg.carimbos.length - 1;
    let achado = -1;
    while (lo <= hi) {
      const meio = Math.floor((lo + hi) / 2);
      if (reg.carimbos[meio] <= timestamp) {
        achado = meio;
        lo = meio + 1;
      } else {
        hi = meio - 1;
      }
    }
    return achado === -1 ? "" : reg.valores[achado];
  }
}
```

## TypeScript

```typescript
interface Registro {
  carimbos: number[];
  valores: string[];
}

class TimeMap {
  private historico: Map<string, Registro>;

  constructor() {
    this.historico = new Map();
  }

  set(key: string, value: string, timestamp: number): void {
    if (!this.historico.has(key)) this.historico.set(key, { carimbos: [], valores: [] });
    const reg = this.historico.get(key)!;
    reg.carimbos.push(timestamp);
    reg.valores.push(value);
  }

  get(key: string, timestamp: number): string {
    const reg = this.historico.get(key);
    if (!reg) return "";
    let lo = 0;
    let hi = reg.carimbos.length - 1;
    let achado = -1;
    while (lo <= hi) {
      const meio = Math.floor((lo + hi) / 2);
      if (reg.carimbos[meio] <= timestamp) {
        achado = meio;
        lo = meio + 1;
      } else {
        hi = meio - 1;
      }
    }
    return achado === -1 ? "" : reg.valores[achado];
  }
}
```
