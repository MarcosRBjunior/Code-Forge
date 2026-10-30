## Ideia

Um array permite sortear em O(1) com um índice aleatório, mas remover do meio custa O(n). Um dicionário permite inserir, remover e consultar em O(1), mas não sorteia. A solução combina os dois: o array guarda os valores e o dicionário guarda a posição de cada valor no array.

Para remover sem deixar buraco, copie o último elemento do array para a posição do valor removido, atualize o índice dele no dicionário e descarte o final do array. Assim todas as operações ficam em O(1) médio e o sorteio continua uniforme.

## Complexidade

Tempo O(1) médio por operação. Espaço O(n) para o array e o dicionário.

## Python

```python
import random

class RandomizedSet:
    def __init__(self):
        self.valores = []
        self.posicao = {}

    def insert(self, val):
        if val in self.posicao:
            return False
        self.posicao[val] = len(self.valores)
        self.valores.append(val)
        return True

    def remove(self, val):
        if val not in self.posicao:
            return False
        i = self.posicao.pop(val)
        ultimo = self.valores.pop()
        if ultimo != val:
            self.valores[i] = ultimo
            self.posicao[ultimo] = i
        return True

    def get_random(self):
        return random.choice(self.valores)
```

## JavaScript

```javascript
class RandomizedSet {
  constructor() {
    this.valores = [];
    this.posicao = new Map();
  }

  insert(val) {
    if (this.posicao.has(val)) return false;
    this.posicao.set(val, this.valores.length);
    this.valores.push(val);
    return true;
  }

  remove(val) {
    if (!this.posicao.has(val)) return false;
    const i = this.posicao.get(val);
    const ultimo = this.valores.pop();
    this.posicao.delete(val);
    if (ultimo !== val) {
      this.valores[i] = ultimo;
      this.posicao.set(ultimo, i);
    }
    return true;
  }

  getRandom() {
    return this.valores[Math.floor(Math.random() * this.valores.length)];
  }
}
```

## TypeScript

```typescript
class RandomizedSet {
  private valores: number[] = [];
  private posicao: Map<number, number> = new Map();

  constructor() {}

  insert(val: number): boolean {
    if (this.posicao.has(val)) return false;
    this.posicao.set(val, this.valores.length);
    this.valores.push(val);
    return true;
  }

  remove(val: number): boolean {
    const i = this.posicao.get(val);
    if (i === undefined) return false;
    const ultimo = this.valores.pop() as number;
    this.posicao.delete(val);
    if (ultimo !== val) {
      this.valores[i] = ultimo;
      this.posicao.set(ultimo, i);
    }
    return true;
  }

  getRandom(): number {
    return this.valores[Math.floor(Math.random() * this.valores.length)];
  }
}
```
