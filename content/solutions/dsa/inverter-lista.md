## Ideia

Percorremos a lista mantendo dois ponteiros: `anterior`, que começa vazio, e `atual`, que começa na cabeça. Em cada nó, guardamos o próximo antes de qualquer mudança (senão perderíamos o resto da lista), fazemos `atual.next` apontar para `anterior` e avançamos os dois ponteiros.

Quando `atual` chega ao fim, `anterior` aponta para o último nó original, que é a nova cabeça. Uma lista vazia nunca entra no laço e devolve vazio.

## Complexidade

Tempo O(n), com uma passagem. Espaço O(1), pois só religamos ponteiros.

## Python

```python
def reverse_list(head):
    anterior = None
    atual = head
    while atual is not None:
        proximo = atual.next
        atual.next = anterior
        anterior = atual
        atual = proximo
    return anterior
```

## JavaScript

```javascript
function reverseList(head) {
  let anterior = null;
  let atual = head;
  while (atual !== null) {
    const proximo = atual.next;
    atual.next = anterior;
    anterior = atual;
    atual = proximo;
  }
  return anterior;
}
```

## TypeScript

```typescript
function reverseList(head: any): any {
  let anterior: any = null;
  let atual: any = head;
  while (atual !== null) {
    const proximo = atual.next;
    atual.next = anterior;
    anterior = atual;
    atual = proximo;
  }
  return anterior;
}
```
