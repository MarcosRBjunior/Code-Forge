## Ideia

Usamos um nó sentinela antes da cabeça para tratar o primeiro bloco como qualquer outro. A variável `antes` aponta para o nó imediatamente anterior ao bloco atual. Para cada bloco, avançamos `k` passos a partir de `antes` para achar o último nó do grupo; se a lista acabar antes disso, restam menos de `k` nós e paramos sem mexer neles.

Quando o bloco existe, invertemos seus ponteiros com a técnica usual, mas fazendo o primeiro nó apontar para o que vem depois do bloco (`depois`). No fim, `antes.next` passa a apontar para o antigo último nó, que agora é a frente do bloco, e o antigo primeiro nó vira o novo `antes` para o próximo grupo.

## Complexidade

Tempo O(n), pois cada nó é percorrido um número constante de vezes. Espaço O(1) extra.

## Python

```python
def reverse_k_group(head, k):
    sentinela = ListNode(0, head)
    antes = sentinela
    while True:
        ultimo = antes
        for _ in range(k):
            ultimo = ultimo.next
            if ultimo is None:
                return sentinela.next
        depois = ultimo.next
        primeiro = antes.next
        anterior, atual = depois, primeiro
        while atual is not depois:
            proximo = atual.next
            atual.next = anterior
            anterior = atual
            atual = proximo
        antes.next = ultimo
        antes = primeiro
```

## JavaScript

```javascript
function reverseKGroup(head, k) {
  const sentinela = new ListNode(0, head);
  let antes = sentinela;
  while (true) {
    let ultimo = antes;
    for (let i = 0; i < k; i++) {
      ultimo = ultimo.next;
      if (ultimo === null) return sentinela.next;
    }
    const depois = ultimo.next;
    const primeiro = antes.next;
    let anterior = depois;
    let atual = primeiro;
    while (atual !== depois) {
      const proximo = atual.next;
      atual.next = anterior;
      anterior = atual;
      atual = proximo;
    }
    antes.next = ultimo;
    antes = primeiro;
  }
}
```

## TypeScript

```typescript
function reverseKGroup(head: any, k: number): any {
  const sentinela = new ListNode(0, head);
  let antes: any = sentinela;
  while (true) {
    let ultimo: any = antes;
    for (let i = 0; i < k; i++) {
      ultimo = ultimo.next;
      if (ultimo === null) return sentinela.next;
    }
    const depois = ultimo.next;
    const primeiro = antes.next;
    let anterior = depois;
    let atual = primeiro;
    while (atual !== depois) {
      const proximo = atual.next;
      atual.next = anterior;
      anterior = atual;
      atual = proximo;
    }
    antes.next = ultimo;
    antes = primeiro;
  }
}
```
