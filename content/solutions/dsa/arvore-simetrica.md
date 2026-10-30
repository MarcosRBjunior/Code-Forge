## Ideia

Uma árvore é simétrica quando a subárvore esquerda é o espelho da direita. Escreva uma função auxiliar que compara dois nós `a` e `b` como espelhos um do outro: ambos vazios é verdadeiro, só um vazio ou valores diferentes é falso.

Para serem espelhos, o filho esquerdo de `a` deve espelhar o filho direito de `b`, e o filho direito de `a` deve espelhar o filho esquerdo de `b`. Chamando a função com os dois filhos da raiz, a verificação desce cruzando os lados.

## Complexidade

Tempo `O(n)`, cada nó é visitado no máximo uma vez. Espaço `O(h)` pela recursão.

## Python

```python
def is_symmetric(root):
    def espelhos(a, b):
        if a is None and b is None:
            return True
        if a is None or b is None or a.val != b.val:
            return False
        return espelhos(a.left, b.right) and espelhos(a.right, b.left)

    return root is None or espelhos(root.left, root.right)
```

## JavaScript

```javascript
function isSymmetric(root) {
  const espelhos = (a, b) => {
    if (a === null && b === null) return true;
    if (a === null || b === null || a.val !== b.val) return false;
    return espelhos(a.left, b.right) && espelhos(a.right, b.left);
  };
  return root === null || espelhos(root.left, root.right);
}
```

## TypeScript

```typescript
function isSymmetric(root: TreeNode | null): boolean {
  const espelhos = (a: TreeNode | null, b: TreeNode | null): boolean => {
    if (a === null && b === null) return true;
    if (a === null || b === null || a.val !== b.val) return false;
    return espelhos(a.left, b.right) && espelhos(a.right, b.left);
  };
  return root === null || espelhos(root.left, root.right);
}
```
