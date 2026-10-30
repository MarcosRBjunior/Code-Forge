## Ideia

Todo caminho entre dois nós tem um nó mais alto, onde ele "dobra". Se esse nó é `x`, o comprimento do caminho em arestas é a altura da subárvore esquerda de `x` mais a altura da direita, onde a altura é medida em arestas a partir do filho.

Calcule as alturas de baixo para cima com uma busca em profundidade. Em cada nó, atualize um máximo global com `esquerda + direita` e devolva `1 + max(esquerda, direita)` para o pai. O máximo global no fim é o diâmetro, esteja ou não o caminho passando pela raiz.

## Complexidade

Tempo O(n), pois cada nó é visitado uma vez. Espaço O(h) para a recursão, com `h` a altura da árvore.

## Python

```python
def diameter_of_binary_tree(root):
    melhor = 0

    def altura(no):
        nonlocal melhor
        if no is None:
            return 0
        esq = altura(no.left)
        dir = altura(no.right)
        melhor = max(melhor, esq + dir)
        return 1 + max(esq, dir)

    altura(root)
    return melhor
```

## JavaScript

```javascript
function diameterOfBinaryTree(root) {
  let melhor = 0;

  function altura(no) {
    if (no === null) return 0;
    const esq = altura(no.left);
    const dir = altura(no.right);
    melhor = Math.max(melhor, esq + dir);
    return 1 + Math.max(esq, dir);
  }

  altura(root);
  return melhor;
}
```

## TypeScript

```typescript
function diameterOfBinaryTree(root: any): number {
  let melhor = 0;

  function altura(no: any): number {
    if (no === null) return 0;
    const esq = altura(no.left);
    const dir = altura(no.right);
    melhor = Math.max(melhor, esq + dir);
    return 1 + Math.max(esq, dir);
  }

  altura(root);
  return melhor;
}
```
