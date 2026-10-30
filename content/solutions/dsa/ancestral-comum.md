## Ideia

Desça pela árvore com recursão. Se o nó atual é vazio, é `p` ou é `q`, ele mesmo é o retorno: ou não há nada ali, ou achamos um dos alvos. Caso contrário, pergunte à subárvore esquerda e à direita.

Se as duas respostas forem não vazias, `p` e `q` estão em lados diferentes e o nó atual é o menor ancestral comum. Se só uma for não vazia, ela carrega o ancestral (ou o único alvo encontrado) para cima. Quando um alvo é ancestral do outro, o primeiro a ser encontrado já é a resposta correta, pois um nó conta como descendente de si mesmo.

## Complexidade

Tempo `O(n)`, cada nó é visitado no máximo uma vez. Espaço `O(h)` para a pilha de recursão, com `h` a altura da árvore.

## Python

```python
def lowest_common_ancestor(root, p, q):
    if root is None or root is p or root is q:
        return root
    esquerda = lowest_common_ancestor(root.left, p, q)
    direita = lowest_common_ancestor(root.right, p, q)
    if esquerda and direita:
        return root
    return esquerda or direita
```

## JavaScript

```javascript
function lowestCommonAncestor(root, p, q) {
  if (root === null || root === p || root === q) return root;
  const esquerda = lowestCommonAncestor(root.left, p, q);
  const direita = lowestCommonAncestor(root.right, p, q);
  if (esquerda && direita) return root;
  return esquerda || direita;
}
```

## TypeScript

```typescript
function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode,
  q: TreeNode
): TreeNode | null {
  if (root === null || root === p || root === q) return root;
  const esquerda = lowestCommonAncestor(root.left, p, q);
  const direita = lowestCommonAncestor(root.right, p, q);
  if (esquerda && direita) return root;
  return esquerda || direita;
}
```
