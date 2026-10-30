## Ideia

O mínimo da pilha muda quando elementos saem, então guarde junto de cada elemento qual era o mínimo da pilha no instante em que ele entrou. Ao empilhar `val`, o novo mínimo é o menor entre `val` e o mínimo que estava no topo.

Como o mínimo de cada nível já está gravado, desempilhar apenas descarta o topo e o mínimo anterior reaparece sozinho. Todas as operações ficam em tempo constante.

## Complexidade

Tempo O(1) por operação. Espaço O(n), com um par por elemento.

## Python

```python
class MinStack:
    def __init__(self):
        self.itens = []  # pares (valor, mínimo até aqui)

    def push(self, val):
        minimo = min(val, self.itens[-1][1]) if self.itens else val
        self.itens.append((val, minimo))

    def pop(self):
        self.itens.pop()

    def top(self):
        return self.itens[-1][0]

    def get_min(self):
        return self.itens[-1][1]
```

## JavaScript

```javascript
class MinStack {
  constructor() {
    this.itens = []; // pares [valor, mínimo até aqui]
  }

  push(val) {
    const n = this.itens.length;
    const minimo = n ? Math.min(val, this.itens[n - 1][1]) : val;
    this.itens.push([val, minimo]);
  }

  pop() {
    this.itens.pop();
  }

  top() {
    return this.itens[this.itens.length - 1][0];
  }

  getMin() {
    return this.itens[this.itens.length - 1][1];
  }
}
```

## TypeScript

```typescript
class MinStack {
  private itens: [number, number][] = []; // pares [valor, mínimo até aqui]

  constructor() {}

  push(val: number): void {
    const n = this.itens.length;
    const minimo = n ? Math.min(val, this.itens[n - 1][1]) : val;
    this.itens.push([val, minimo]);
  }

  pop(): void {
    this.itens.pop();
  }

  top(): number {
    return this.itens[this.itens.length - 1][0];
  }

  getMin(): number {
    return this.itens[this.itens.length - 1][1];
  }
}
```
