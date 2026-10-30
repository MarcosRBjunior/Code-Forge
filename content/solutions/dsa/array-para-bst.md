## Ideia

Se o array está ordenado, o elemento do meio de qualquer trecho é uma boa raiz: tudo à esquerda dele é menor e tudo à direita é maior. Construindo recursivamente a subárvore esquerda com o trecho anterior ao meio e a direita com o trecho posterior, a árvore resulta em uma BST válida.

Como cada trecho é dividido ao meio, as duas metades diferem em no máximo um elemento, o que mantém as alturas das subárvores com diferença de no máximo 1. Usar sempre `(lo + hi) // 2` como meio torna a resposta única.

## Complexidade

Tempo `O(n)`, cada elemento vira exatamente um nó. Espaço `O(log n)` de pilha de recursão, além da própria árvore.

## Python

```python
def sorted_array_to_bst(nums):
    def construir(lo, hi):
        if lo > hi:
            return None
        meio = (lo + hi) // 2
        return TreeNode(nums[meio], construir(lo, meio - 1), construir(meio + 1, hi))

    return construir(0, len(nums) - 1)
```

## JavaScript

```javascript
function sortedArrayToBST(nums) {
  const construir = (lo, hi) => {
    if (lo > hi) return null;
    const meio = Math.floor((lo + hi) / 2);
    return new TreeNode(nums[meio], construir(lo, meio - 1), construir(meio + 1, hi));
  };
  return construir(0, nums.length - 1);
}
```

## TypeScript

```typescript
function sortedArrayToBST(nums: number[]): TreeNode | null {
  const construir = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) return null;
    const meio = Math.floor((lo + hi) / 2);
    return new TreeNode(nums[meio], construir(lo, meio - 1), construir(meio + 1, hi));
  };
  return construir(0, nums.length - 1);
}
```
