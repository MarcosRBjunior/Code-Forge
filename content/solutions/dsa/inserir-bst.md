## Ideia

Numa árvore de busca binária, tudo à esquerda de um nó é menor e tudo à direita é maior. Para inserir `val`, descemos como numa busca: vamos para a esquerda se `val` é menor que o nó atual e para a direita se é maior, até chegar a uma posição vazia. É ali que o novo nó entra, como folha.

Na versão recursiva, a função devolve a subárvore já atualizada e o pai simplesmente a reatribui ao filho. Uma árvore vazia devolve o próprio novo nó, o que também cobre o caso da raiz.

## Complexidade

Tempo O(h), com h a altura da árvore (O(n) no pior caso de árvore degenerada). Espaço O(h) de pilha de recursão.

## Python

```python
def insert_into_bst(root, val):
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left = insert_into_bst(root.left, val)
    else:
        root.right = insert_into_bst(root.right, val)
    return root
```

## JavaScript

```javascript
function insertIntoBST(root, val) {
  if (root === null) return new TreeNode(val);
  if (val < root.val) root.left = insertIntoBST(root.left, val);
  else root.right = insertIntoBST(root.right, val);
  return root;
}
```

## TypeScript

```typescript
function insertIntoBST(root: any, val: number): any {
  if (root === null) return new TreeNode(val);
  if (val < root.val) root.left = insertIntoBST(root.left, val);
  else root.right = insertIntoBST(root.right, val);
  return root;
}
```
