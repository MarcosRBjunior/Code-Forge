## Ideia

Uma pilha inverte a ordem dos elementos: o último a entrar é o primeiro a sair. Se despejarmos uma pilha em outra, a ordem se inverte de novo e o elemento mais antigo passa a ficar no topo, exatamente onde uma fila precisa dele.

Por isso usamos duas pilhas: `entrada` recebe todos os `push`, e `saida` entrega os elementos em `pop` e `peek`. Só quando `saida` está vazia despejamos `entrada` inteira nela. Cada elemento é movido no máximo uma vez de uma pilha para a outra, então o custo é distribuído entre as operações.

## Complexidade

Tempo O(1) amortizado por operação, pois cada elemento passa por cada pilha no máximo uma vez. Espaço O(n) para os elementos guardados.

## Python

```python
class MyQueue:
    def __init__(self):
        self.entrada = []
        self.saida = []

    def push(self, x):
        self.entrada.append(x)

    def _preparar(self):
        if not self.saida:
            while self.entrada:
                self.saida.append(self.entrada.pop())

    def pop(self):
        self._preparar()
        return self.saida.pop()

    def peek(self):
        self._preparar()
        return self.saida[-1]

    def empty(self):
        return not self.entrada and not self.saida
```

## JavaScript

```javascript
class MyQueue {
  constructor() {
    this.entrada = [];
    this.saida = [];
  }

  preparar() {
    if (this.saida.length === 0) {
      while (this.entrada.length > 0) this.saida.push(this.entrada.pop());
    }
  }

  push(x) {
    this.entrada.push(x);
  }

  pop() {
    this.preparar();
    return this.saida.pop();
  }

  peek() {
    this.preparar();
    return this.saida[this.saida.length - 1];
  }

  empty() {
    return this.entrada.length === 0 && this.saida.length === 0;
  }
}
```

## TypeScript

```typescript
class MyQueue {
  private entrada: number[] = [];
  private saida: number[] = [];

  private preparar(): void {
    if (this.saida.length === 0) {
      while (this.entrada.length > 0) this.saida.push(this.entrada.pop()!);
    }
  }

  push(x: number): void {
    this.entrada.push(x);
  }

  pop(): number {
    this.preparar();
    return this.saida.pop()!;
  }

  peek(): number {
    this.preparar();
    return this.saida[this.saida.length - 1];
  }

  empty(): boolean {
    return this.entrada.length === 0 && this.saida.length === 0;
  }
}
```
