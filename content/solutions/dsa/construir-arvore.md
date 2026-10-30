## Ideia

O primeiro valor de `preorder` é sempre a raiz. Achando essa raiz em `inorder`, tudo à esquerda dela pertence à subárvore esquerda e tudo à direita, à subárvore direita. O tamanho da parte esquerda diz quantos elementos seguintes do `preorder` pertencem a ela.

Com isso a construção é recursiva: consuma a raiz, construa a esquerda e depois a direita. Um dicionário valor para índice em `inorder` evita buscar a raiz linearmente a cada chamada. Usar um ponteiro que avança em `preorder` torna desnecessário fatiar os arrays.

## Complexidade

Tempo O(n), pois cada nó é criado uma vez e a busca da raiz é O(1). Espaço O(n) para o dicionário e a recursão.

## Python

```python
def build_tree(preorder, inorder):
    indice = {v: i for i, v in enumerate(inorder)}
    prox = [0]

    def montar(esq, dir):
        if esq > dir:
            return None
        valor = preorder[prox[0]]
        prox[0] += 1
        meio = indice[valor]
        no = TreeNode(valor)
        no.left = montar(esq, meio - 1)
        no.right = montar(meio + 1, dir)
        return no

    return montar(0, len(inorder) - 1)
```

## JavaScript

```javascript
function buildTree(preorder, inorder) {
  const indice = new Map();
  inorder.forEach((v, i) => indice.set(v, i));
  let prox = 0;

  function montar(esq, dir) {
    if (esq > dir) return null;
    const valor = preorder[prox++];
    const meio = indice.get(valor);
    const no = new TreeNode(valor);
    no.left = montar(esq, meio - 1);
    no.right = montar(meio + 1, dir);
    return no;
  }

  return montar(0, inorder.length - 1);
}
```

## TypeScript

```typescript
function buildTree(preorder: number[], inorder: number[]): any {
  const indice = new Map<number, number>();
  inorder.forEach((v, i) => indice.set(v, i));
  let prox = 0;

  function montar(esq: number, dir: number): any {
    if (esq > dir) return null;
    const valor = preorder[prox++];
    const meio = indice.get(valor) as number;
    const no = new TreeNode(valor);
    no.left = montar(esq, meio - 1);
    no.right = montar(meio + 1, dir);
    return no;
  }

  return montar(0, inorder.length - 1);
}
```
