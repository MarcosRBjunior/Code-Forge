## Ideia

Percorra a árvore em largura com uma fila. O truque para separar os níveis é medir a fila no início de cada rodada: exatamente esses nós formam o nível atual. Processe só essa quantidade, coletando os valores e enfileirando os filhos, que pertencem ao nível seguinte.

Como os filhos esquerdos entram antes dos direitos, cada nível sai da esquerda para a direita. Uma árvore vazia devolve lista vazia.

## Complexidade

Tempo O(n), pois cada nó entra e sai da fila uma vez. Espaço O(n) no pior caso, para a fila e a resposta.

## Python

```python
from collections import deque

def level_order(root):
    if root is None:
        return []
    niveis = []
    fila = deque([root])
    while fila:
        nivel = []
        for _ in range(len(fila)):
            no = fila.popleft()
            nivel.append(no.val)
            if no.left:
                fila.append(no.left)
            if no.right:
                fila.append(no.right)
        niveis.append(nivel)
    return niveis
```

## JavaScript

```javascript
function levelOrder(root) {
  if (!root) return [];
  const niveis = [];
  let atual = [root];
  while (atual.length) {
    niveis.push(atual.map((no) => no.val));
    const proximo = [];
    for (const no of atual) {
      if (no.left) proximo.push(no.left);
      if (no.right) proximo.push(no.right);
    }
    atual = proximo;
  }
  return niveis;
}
```

## TypeScript

```typescript
function levelOrder(root: any): number[][] {
  if (!root) return [];
  const niveis: number[][] = [];
  let atual: any[] = [root];
  while (atual.length) {
    niveis.push(atual.map((no) => no.val));
    const proximo: any[] = [];
    for (const no of atual) {
      if (no.left) proximo.push(no.left);
      if (no.right) proximo.push(no.right);
    }
    atual = proximo;
  }
  return niveis;
}
```
