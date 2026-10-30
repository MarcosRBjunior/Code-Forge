## Ideia

Duas árvores são iguais quando as raízes coincidem e, recursivamente, as subárvores esquerdas são iguais entre si e as direitas também. Os casos-base cuidam do resto: se ambas são vazias, são iguais; se só uma é vazia, ou os valores diferem, não são.

A comparação é posição a posição, então o formato conta tanto quanto os valores: um 2 à esquerda e outro 2 à direita são tratados como diferentes.

## Complexidade

Tempo `O(min(n, m))`, pois a recursão para na primeira diferença. Espaço `O(h)` pela pilha de recursão.

## Python

```python
def is_same_tree(p, q):
    if p is None and q is None:
        return True
    if p is None or q is None or p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)
```

## JavaScript

```javascript
function isSameTree(p, q) {
  if (p === null && q === null) return true;
  if (p === null || q === null || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
```

## TypeScript

```typescript
function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  if (p === null && q === null) return true;
  if (p === null || q === null || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
```
