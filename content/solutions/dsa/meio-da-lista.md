## Ideia

Use dois ponteiros que começam na cabeça: o lento anda um nó por passo e o rápido anda dois. Quando o rápido chega ao fim da lista, ele percorreu o dobro da distância do lento, então o lento está exatamente na metade.

Com número par de nós, o rápido termina em `None` (ou `null`) quando o lento acabou de entrar no segundo nó central, e por isso o lento para nele, como o enunciado pede.

## Complexidade

Tempo O(n), numa única passada. Espaço O(1).

## Python

```python
def middle_node(head):
    lento = rapido = head
    while rapido and rapido.next:
        lento = lento.next
        rapido = rapido.next.next
    return lento
```

## JavaScript

```javascript
function middleNode(head) {
  let lento = head, rapido = head;
  while (rapido && rapido.next) {
    lento = lento.next;
    rapido = rapido.next.next;
  }
  return lento;
}
```

## TypeScript

```typescript
function middleNode(head: any): any {
  let lento = head, rapido = head;
  while (rapido && rapido.next) {
    lento = lento.next;
    rapido = rapido.next.next;
  }
  return lento;
}
```
