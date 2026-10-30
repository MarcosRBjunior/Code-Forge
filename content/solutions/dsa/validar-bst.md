## Ideia

Comparar cada nó só com os filhos diretos não basta: um valor na subárvore direita precisa ser maior que todos os ancestrais pelos quais a busca foi para a direita, e vice-versa. Por isso descemos pela árvore carregando o intervalo aberto `(minimo, maximo)` de valores permitidos para a subárvore atual.

Ao ir para a esquerda, o valor do nó vira o novo máximo; ao ir para a direita, vira o novo mínimo. Se algum nó cai fora do intervalo (inclusive igual ao limite, pois duplicatas são inválidas), a árvore não é BST. Uma árvore vazia é válida.

## Complexidade

Tempo O(n), visitando cada nó uma vez. Espaço O(h) para a recursão, com h a altura da árvore.

## Python

```python
def is_valid_bst(root):
    def valido(no, minimo, maximo):
        if no is None:
            return True
        if (minimo is not None and no.val <= minimo) or (maximo is not None and no.val >= maximo):
            return False
        return valido(no.left, minimo, no.val) and valido(no.right, no.val, maximo)

    return valido(root, None, None)
```

## JavaScript

```javascript
function isValidBST(root) {
  const valido = (no, minimo, maximo) => {
    if (no === null) return true;
    if (no.val <= minimo || no.val >= maximo) return false;
    return valido(no.left, minimo, no.val) && valido(no.right, no.val, maximo);
  };
  return valido(root, -Infinity, Infinity);
}
```

## TypeScript

```typescript
function isValidBST(root) {
  const valido = (no, minimo: number, maximo: number): boolean => {
    if (no === null) return true;
    if (no.val <= minimo || no.val >= maximo) return false;
    return valido(no.left, minimo, no.val) && valido(no.right, no.val, maximo);
  };
  return valido(root, -Infinity, Infinity);
}
```
