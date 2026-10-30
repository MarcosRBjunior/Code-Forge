## Ideia

O resultado intercala o começo da lista com o fim invertido, então a solução tem três passos. Primeiro ache o meio com ponteiros lento e rápido. Depois inverta a segunda metade, de modo que ela passe a ser lida do último nó para o do meio. Por fim, intercale as duas metades: um nó da primeira, um da segunda, e assim por diante.

Tudo é feito religando ponteiros, sem alterar valores e sem estruturas auxiliares. Ao cortar a primeira metade (`lento.next = None`) evitamos que ela continue apontando para a metade invertida.

## Complexidade

Tempo O(n): cada um dos três passos percorre a lista uma vez. Espaço O(1).

## Python

```python
def reorder_list(head):
    if not head or not head.next:
        return
    lento = rapido = head
    while rapido.next and rapido.next.next:
        lento = lento.next
        rapido = rapido.next.next
    # inverte a segunda metade
    anterior, atual = None, lento.next
    lento.next = None
    while atual:
        proximo = atual.next
        atual.next = anterior
        anterior, atual = atual, proximo
    # intercala as duas metades
    a, b = head, anterior
    while b:
        prox_a, prox_b = a.next, b.next
        a.next = b
        b.next = prox_a
        a, b = prox_a, prox_b
```

## JavaScript

```javascript
function reorderList(head) {
  if (!head || !head.next) return;
  let lento = head;
  let rapido = head;
  while (rapido.next && rapido.next.next) {
    lento = lento.next;
    rapido = rapido.next.next;
  }
  // inverte a segunda metade
  let anterior = null;
  let atual = lento.next;
  lento.next = null;
  while (atual) {
    const proximo = atual.next;
    atual.next = anterior;
    anterior = atual;
    atual = proximo;
  }
  // intercala as duas metades
  let a = head;
  let b = anterior;
  while (b) {
    const proxA = a.next;
    const proxB = b.next;
    a.next = b;
    b.next = proxA;
    a = proxA;
    b = proxB;
  }
}
```

## TypeScript

```typescript
function reorderList(head) {
  if (!head || !head.next) return;
  let lento = head;
  let rapido = head;
  while (rapido.next && rapido.next.next) {
    lento = lento.next;
    rapido = rapido.next.next;
  }
  // inverte a segunda metade
  let anterior = null;
  let atual = lento.next;
  lento.next = null;
  while (atual) {
    const proximo = atual.next;
    atual.next = anterior;
    anterior = atual;
    atual = proximo;
  }
  // intercala as duas metades
  let a = head;
  let b = anterior;
  while (b) {
    const proxA = a.next;
    const proxB = b.next;
    a.next = b;
    b.next = proxA;
    a = proxA;
    b = proxB;
  }
}
```
