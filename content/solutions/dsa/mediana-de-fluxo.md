## Ideia

Divida os números recebidos em duas metades: a metade menor fica num max-heap (o maior dela está no topo) e a metade maior fica num min-heap (o menor dela está no topo). Todo elemento da metade menor é menor ou igual a todo elemento da metade maior, então a mediana está sempre junto dos topos.

A cada inserção, o número entra na metade menor e o maior dela é empurrado para a metade maior; se a metade maior ficar com mais elementos, o seu menor volta para a metade menor. Assim a metade menor tem o mesmo tamanho da maior ou um elemento a mais. Com tamanho total ímpar, a mediana é o topo da metade menor; com tamanho par, é a média dos dois topos.

## Complexidade

`add_num` custa O(log n), pois faz um número constante de operações em heaps, e `find_median` custa O(1). Espaço O(n).

## Python

```python
import heapq


class MedianFinder:
    def __init__(self):
        self.menores = []  # max-heap (valores negados)
        self.maiores = []  # min-heap

    def add_num(self, num):
        heapq.heappush(self.menores, -num)
        heapq.heappush(self.maiores, -heapq.heappop(self.menores))
        if len(self.maiores) > len(self.menores):
            heapq.heappush(self.menores, -heapq.heappop(self.maiores))

    def find_median(self):
        if len(self.menores) > len(self.maiores):
            return -self.menores[0]
        return (-self.menores[0] + self.maiores[0]) / 2
```

## JavaScript

```javascript
class Heap {
  constructor(antes) {
    this.a = [];
    this.antes = antes;
  }
  get size() { return this.a.length; }
  top() { return this.a[0]; }
  push(v) {
    const a = this.a;
    a.push(v);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.antes(a[i], a[p])) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const topo = a[0];
    const ultimo = a.pop();
    if (a.length > 0) {
      a[0] = ultimo;
      let i = 0;
      for (;;) {
        let m = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < a.length && this.antes(a[l], a[m])) m = l;
        if (r < a.length && this.antes(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return topo;
  }
}

class MedianFinder {
  constructor() {
    this.menores = new Heap((x, y) => x > y);
    this.maiores = new Heap((x, y) => x < y);
  }

  addNum(num) {
    this.menores.push(num);
    this.maiores.push(this.menores.pop());
    if (this.maiores.size > this.menores.size) {
      this.menores.push(this.maiores.pop());
    }
  }

  findMedian() {
    if (this.menores.size > this.maiores.size) return this.menores.top();
    return (this.menores.top() + this.maiores.top()) / 2;
  }
}
```

## TypeScript

```typescript
class Heap {
  private a: number[] = [];
  constructor(private antes: (x: number, y: number) => boolean) {}
  get size(): number { return this.a.length; }
  top(): number { return this.a[0]; }
  push(v: number): void {
    const a = this.a;
    a.push(v);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.antes(a[i], a[p])) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop(): number {
    const a = this.a;
    const topo = a[0];
    const ultimo = a.pop() as number;
    if (a.length > 0) {
      a[0] = ultimo;
      let i = 0;
      for (;;) {
        let m = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < a.length && this.antes(a[l], a[m])) m = l;
        if (r < a.length && this.antes(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return topo;
  }
}

class MedianFinder {
  private menores = new Heap((x, y) => x > y);
  private maiores = new Heap((x, y) => x < y);

  constructor() {}

  addNum(num: number): void {
    this.menores.push(num);
    this.maiores.push(this.menores.pop());
    if (this.maiores.size > this.menores.size) {
      this.menores.push(this.maiores.pop());
    }
  }

  findMedian(): number {
    if (this.menores.size > this.maiores.size) return this.menores.top();
    return (this.menores.top() + this.maiores.top()) / 2;
  }
}
```
