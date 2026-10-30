## Ideia

Espelhar uma árvore é espelhar cada subárvore e trocar os dois filhos de cada nó. A recursão expressa isso diretamente: para um nó, invertemos a subárvore esquerda e a direita e depois trocamos as referências. O caso base é a árvore vazia, que já é seu próprio espelho.

A troca em cada nó é independente das demais, então a ordem (antes ou depois das chamadas recursivas) não altera o resultado final.

## Complexidade

Tempo O(n), pois cada nó é visitado uma vez. Espaço O(h) de pilha de recursão, com h a altura da árvore.

## Python

```python
def invert_tree(root):
    if root is None:
        return None
    esquerda = invert_tree(root.left)
    direita = invert_tree(root.right)
    root.left, root.right = direita, esquerda
    return root
```

## JavaScript

```javascript
function invertTree(root) {
  if (root === null) return null;
  const esquerda = invertTree(root.left);
  const direita = invertTree(root.right);
  root.left = direita;
  root.right = esquerda;
  return root;
}
```

## TypeScript

```typescript
function invertTree(root: any): any {
  if (root === null) return null;
  const esquerda = invertTree(root.left);
  const direita = invertTree(root.right);
  root.left = direita;
  root.right = esquerda;
  return root;
}
```
