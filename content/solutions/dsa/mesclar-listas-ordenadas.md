## Ideia

Crie um nó sentinela que serve de ponto de partida do resultado e mantenha um ponteiro para o último nó já ligado. A cada passo compare as frentes das duas listas, ligue o menor nó ao final do resultado e avance nessa lista. Isso reaproveita os nós originais sem criar nenhum novo além do sentinela.

Quando uma das listas acaba, a outra já está ordenada e todos os seus valores são maiores ou iguais aos já ligados, então basta ligar o restante dela de uma só vez. O resultado é o `next` do sentinela, o que também cobre o caso de listas vazias.

## Complexidade

Tempo O(m + n), pois cada nó é visitado uma vez. Espaço O(1).

## Python

```python
def merge_two_lists(l1, l2):
    sentinela = ListNode(0)
    cauda = sentinela
    while l1 and l2:
        if l1.val <= l2.val:
            cauda.next = l1
            l1 = l1.next
        else:
            cauda.next = l2
            l2 = l2.next
        cauda = cauda.next
    cauda.next = l1 or l2
    return sentinela.next
```

## JavaScript

```javascript
function mergeTwoLists(l1, l2) {
  const sentinela = new ListNode(0);
  let cauda = sentinela;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      cauda.next = l1;
      l1 = l1.next;
    } else {
      cauda.next = l2;
      l2 = l2.next;
    }
    cauda = cauda.next;
  }
  cauda.next = l1 || l2;
  return sentinela.next;
}
```

## TypeScript

```typescript
function mergeTwoLists(l1: any, l2: any): any {
  const sentinela = new ListNode(0);
  let cauda = sentinela;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      cauda.next = l1;
      l1 = l1.next;
    } else {
      cauda.next = l2;
      l2 = l2.next;
    }
    cauda = cauda.next;
  }
  cauda.next = l1 || l2;
  return sentinela.next;
}
```
