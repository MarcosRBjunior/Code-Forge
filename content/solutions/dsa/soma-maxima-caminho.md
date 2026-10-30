## Ideia

Para cada nó, considere o melhor caminho que "dobra" nele: sobe pela esquerda, passa pelo nó e desce pela direita. Seu valor é o do nó mais o melhor ganho vindo de cada lado. Como ganhos negativos só atrapalham, cada lado contribui com `max(0, ganho)`.

Uma busca em profundidade devolve ao pai o melhor ganho que pode ser estendido, isto é, o valor do nó mais o melhor dos dois lados (só um, pois o caminho não pode se bifurcar para cima). Em paralelo, atualizamos o melhor global com o caminho que dobra no nó atual. O global começa em menos infinito, para tratar árvores só com valores negativos.

## Complexidade

Tempo O(n), uma visita por nó. Espaço O(h) de pilha de recursão, com `h` a altura da árvore.

## Python

```python
def max_path_sum(root):
    melhor = float("-inf")

    def ganho(no):
        nonlocal melhor
        if no is None:
            return 0
        esq = max(0, ganho(no.left))
        dir_ = max(0, ganho(no.right))
        melhor = max(melhor, no.val + esq + dir_)
        return no.val + max(esq, dir_)

    ganho(root)
    return melhor
```

## JavaScript

```javascript
function maxPathSum(root) {
  let melhor = -Infinity;
  const ganho = (no) => {
    if (!no) return 0;
    const esq = Math.max(0, ganho(no.left));
    const dir = Math.max(0, ganho(no.right));
    melhor = Math.max(melhor, no.val + esq + dir);
    return no.val + Math.max(esq, dir);
  };
  ganho(root);
  return melhor;
}
```

## TypeScript

```typescript
function maxPathSum(root) {
  let melhor = -Infinity;
  const ganho = (no): number => {
    if (!no) return 0;
    const esq = Math.max(0, ganho(no.left));
    const dir = Math.max(0, ganho(no.right));
    melhor = Math.max(melhor, no.val + esq + dir);
    return no.val + Math.max(esq, dir);
  };
  ganho(root);
  return melhor;
}
```
