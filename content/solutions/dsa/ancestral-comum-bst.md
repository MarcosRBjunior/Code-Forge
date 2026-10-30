## Ideia

Numa árvore de busca binária, tudo à esquerda de um nó é menor e tudo à direita é maior. Comece na raiz: se `p` e `q` são ambos menores que o nó atual, o ancestral comum está à esquerda; se ambos são maiores, está à direita.

No momento em que os valores ficam em lados opostos (ou um deles é igual ao nó atual), o caminho até cada alvo se separa neste nó, então ele é o menor ancestral comum. Não há necessidade de recursão: um laço descendo um caminho só resolve.

## Complexidade

Tempo `O(h)`, com `h` a altura da árvore, pois seguimos um único caminho. Espaço `O(1)`.

## Python

```python
def lowest_common_ancestor(root, p, q):
    no = root
    while no:
        if p.val < no.val and q.val < no.val:
            no = no.left
        elif p.val > no.val and q.val > no.val:
            no = no.right
        else:
            return no
    return None
```

## JavaScript

```javascript
function lowestCommonAncestor(root, p, q) {
  let no = root;
  while (no) {
    if (p.val < no.val && q.val < no.val) no = no.left;
    else if (p.val > no.val && q.val > no.val) no = no.right;
    else return no;
  }
  return null;
}
```

## TypeScript

```typescript
function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode,
  q: TreeNode
): TreeNode | null {
  let no = root;
  while (no) {
    if (p.val < no.val && q.val < no.val) no = no.left;
    else if (p.val > no.val && q.val > no.val) no = no.right;
    else return no;
  }
  return null;
}
```
