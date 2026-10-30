## Ideia

Coloque um nó sentinela antes da cabeça, para que remover o primeiro nó não seja um caso especial. Use dois ponteiros, `rapido` e `lento`, ambos começando no sentinela. Avance o `rapido` `n` passos; depois, ande com os dois juntos até o `rapido` chegar ao último nó.

Nesse momento a distância entre eles é exatamente `n`, então `lento` está parado no nó imediatamente anterior ao que deve sair. Basta religar `lento.next` para pular o nó seguinte e devolver o `next` do sentinela.

## Complexidade

Tempo O(L), uma única passada pela lista de tamanho `L`. Espaço O(1).

## Python

```python
def remove_nth_from_end(head, n):
    sentinela = ListNode(0, head)
    rapido = lento = sentinela
    for _ in range(n):
        rapido = rapido.next
    while rapido.next:
        rapido = rapido.next
        lento = lento.next
    lento.next = lento.next.next
    return sentinela.next
```

## JavaScript

```javascript
function removeNthFromEnd(head, n) {
  const sentinela = new ListNode(0, head);
  let rapido = sentinela;
  let lento = sentinela;
  for (let i = 0; i < n; i++) rapido = rapido.next;
  while (rapido.next) {
    rapido = rapido.next;
    lento = lento.next;
  }
  lento.next = lento.next.next;
  return sentinela.next;
}
```

## TypeScript

```typescript
function removeNthFromEnd(head, n) {
  const sentinela = new ListNode(0, head);
  let rapido = sentinela;
  let lento = sentinela;
  for (let i = 0; i < n; i++) rapido = rapido.next;
  while (rapido.next) {
    rapido = rapido.next;
    lento = lento.next;
  }
  lento.next = lento.next.next;
  return sentinela.next;
}
```
