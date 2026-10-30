## Ideia

Fazemos uma busca em profundidade que visita sempre a subárvore direita antes da esquerda e leva junto a profundidade atual. O primeiro nó que chega a uma profundidade nova é o mais à direita daquele nível, então o registramos: a profundidade é nova quando ela é igual ao tamanho da lista de resultados.

Assim, se a direita for mais rasa, a esquerda ainda contribui com os níveis que a direita não alcançou.

## Complexidade

Tempo O(n), um acesso por nó. Espaço O(h) para a recursão, com h a altura da árvore.

## Python

```python
def right_side_view(root):
    visiveis = []

    def descer(no, profundidade):
        if no is None:
            return
        if profundidade == len(visiveis):
            visiveis.append(no.val)
        descer(no.right, profundidade + 1)
        descer(no.left, profundidade + 1)

    descer(root, 0)
    return visiveis
```

## JavaScript

```javascript
function rightSideView(root) {
  const visiveis = [];
  const descer = (no, profundidade) => {
    if (no === null) return;
    if (profundidade === visiveis.length) visiveis.push(no.val);
    descer(no.right, profundidade + 1);
    descer(no.left, profundidade + 1);
  };
  descer(root, 0);
  return visiveis;
}
```

## TypeScript

```typescript
function rightSideView(root) {
  const visiveis: number[] = [];
  const descer = (no, profundidade: number): void => {
    if (no === null) return;
    if (profundidade === visiveis.length) visiveis.push(no.val);
    descer(no.right, profundidade + 1);
    descer(no.left, profundidade + 1);
  };
  descer(root, 0);
  return visiveis;
}
```
