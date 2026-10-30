## Ideia

Use dois ponteiros, um lento que anda um nó por vez e um rápido que anda dois. Se a lista termina, o rápido chega ao fim e não há ciclo. Se há ciclo, os dois acabam dentro dele e, como o rápido ganha um nó de distância por passo, ele inevitavelmente alcança o lento.

Quando os dois ponteiros apontam para o mesmo nó, existe ciclo. Essa técnica dispensa o conjunto de nós visitados e usa memória constante.

## Complexidade

Tempo O(n), pois o rápido alcança o lento em poucas voltas do ciclo. Espaço O(1).

## Python

```python
def has_cycle(head):
    lento = rapido = head
    while rapido is not None and rapido.next is not None:
        lento = lento.next
        rapido = rapido.next.next
        if lento is rapido:
            return True
    return False
```

## JavaScript

```javascript
function hasCycle(head) {
  let lento = head;
  let rapido = head;
  while (rapido !== null && rapido.next !== null) {
    lento = lento.next;
    rapido = rapido.next.next;
    if (lento === rapido) return true;
  }
  return false;
}
```

## TypeScript

```typescript
function hasCycle(head: any): boolean {
  let lento = head;
  let rapido = head;
  while (rapido !== null && rapido.next !== null) {
    lento = lento.next;
    rapido = rapido.next.next;
    if (lento === rapido) return true;
  }
  return false;
}
```
