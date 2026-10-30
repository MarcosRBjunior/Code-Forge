## Ideia

Como o array nunca muda, vale pagar uma vez no construtor para responder cada consulta em tempo constante. Construa um vetor de somas de prefixo em que `prefixo[i]` é a soma dos `i` primeiros elementos, com `prefixo[0]` igual a zero.

A soma entre `left` e `right` (inclusive) é o que foi acumulado até `right` menos o que foi acumulado antes de `left`: `prefixo[right + 1] - prefixo[left]`.

## Complexidade

Construtor em tempo e espaço O(n); cada consulta `sumRange` em O(1).

## Python

```python
class NumArray:
    def __init__(self, nums):
        self.prefixo = [0]
        for x in nums:
            self.prefixo.append(self.prefixo[-1] + x)

    def sum_range(self, left, right):
        return self.prefixo[right + 1] - self.prefixo[left]
```

## JavaScript

```javascript
class NumArray {
  constructor(nums) {
    this.prefixo = [0];
    for (const x of nums) {
      this.prefixo.push(this.prefixo[this.prefixo.length - 1] + x);
    }
  }

  sumRange(left, right) {
    return this.prefixo[right + 1] - this.prefixo[left];
  }
}
```

## TypeScript

```typescript
class NumArray {
  prefixo: number[];

  constructor(nums) {
    this.prefixo = [0];
    for (const x of nums) {
      this.prefixo.push(this.prefixo[this.prefixo.length - 1] + x);
    }
  }

  sumRange(left, right) {
    return this.prefixo[right + 1] - this.prefixo[left];
  }
}
```
