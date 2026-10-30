## Ideia

O percurso em ordem (esquerda, nó, direita) visita os nós de uma BST em ordem crescente. Basta percorrer assim, contando os nós visitados, e parar no `k`-ésimo.

Para poder interromper cedo e evitar recursão profunda, usamos uma pilha explícita: descemos pela esquerda empilhando, desempilhamos o próximo menor, decrementamos `k` e seguimos pela subárvore direita.

## Complexidade

Tempo `O(h + k)`, onde `h` é a altura da árvore (no pior caso `O(n)`). Espaço `O(h)` para a pilha.

## Python

```python
def kth_smallest(root, k):
    pilha = []
    no = root
    while pilha or no:
        while no:
            pilha.append(no)
            no = no.left
        no = pilha.pop()
        k -= 1
        if k == 0:
            return no.val
        no = no.right
```

## JavaScript

```javascript
function kthSmallest(root, k) {
  const pilha = [];
  let no = root;
  while (pilha.length || no) {
    while (no) {
      pilha.push(no);
      no = no.left;
    }
    no = pilha.pop();
    k--;
    if (k === 0) return no.val;
    no = no.right;
  }
}
```

## TypeScript

```typescript
function kthSmallest(root: any, k: number): number {
  const pilha: any[] = [];
  let no: any = root;
  while (pilha.length || no) {
    while (no) {
      pilha.push(no);
      no = no.left;
    }
    no = pilha.pop();
    k--;
    if (k === 0) return no.val;
    no = no.right;
  }
  return -1;
}
```
