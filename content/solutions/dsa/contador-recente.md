## Ideia

Os instantes de `ping` chegam em ordem crescente, então as chamadas mais antigas ficam sempre no começo de uma fila. A cada novo `t`, enfileire-o e remova da frente tudo que for menor que `t - 3000`, pois essas chamadas saíram da janela.

O que sobrou na fila é exatamente o conjunto de chamadas no intervalo `[t - 3000, t]`, e o tamanho da fila é a resposta. Cada instante entra e sai uma vez só.

## Complexidade

Tempo amortizado O(1) por `ping`. Espaço O(w), em que `w` é o número de chamadas na janela de 3000.

## Python

```python
from collections import deque

class RecentCounter:
    def __init__(self):
        self.fila = deque()

    def ping(self, t):
        self.fila.append(t)
        while self.fila[0] < t - 3000:
            self.fila.popleft()
        return len(self.fila)
```

## JavaScript

```javascript
class RecentCounter {
  constructor() {
    this.fila = [];
    this.inicio = 0;
  }

  ping(t) {
    this.fila.push(t);
    while (this.fila[this.inicio] < t - 3000) this.inicio++;
    return this.fila.length - this.inicio;
  }
}
```

## TypeScript

```typescript
class RecentCounter {
  private fila: number[] = [];
  private inicio = 0;

  constructor() {}

  ping(t: number): number {
    this.fila.push(t);
    while (this.fila[this.inicio] < t - 3000) this.inicio++;
    return this.fila.length - this.inicio;
  }
}
```
