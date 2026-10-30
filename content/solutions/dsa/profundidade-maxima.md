## Ideia

A profundidade de uma árvore é um mais a maior das profundidades das suas duas subárvores. O caso base é a árvore vazia, que tem profundidade zero.

Com essa definição recursiva, basta calcular a profundidade da subárvore esquerda e da direita, pegar a maior e somar 1 pelo nó atual.

## Complexidade

Tempo O(n), pois cada nó é visitado uma vez. Espaço O(h) de pilha de recursão, com h a altura da árvore.

## Python

```python
def max_depth(root):
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
```

## JavaScript

```javascript
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

## TypeScript

```typescript
function maxDepth(root: any): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```
