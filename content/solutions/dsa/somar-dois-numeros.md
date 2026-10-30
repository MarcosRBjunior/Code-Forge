## Ideia

Como os dígitos estão em ordem inversa, as cabeças das listas guardam as unidades, e a soma pode ser feita exatamente como no papel: da direita para a esquerda, só que aqui isso significa do início para o fim das listas. Percorra as duas listas juntas, somando os dígitos de cada uma (zero quando uma delas acabou) mais o "vai um" da posição anterior.

O dígito do resultado é a soma módulo 10 e o novo "vai um" é a divisão inteira por 10. Um nó sentinela simplifica a construção da lista de saída, e o laço só termina quando ambas as listas e o "vai um" se esgotam.

## Complexidade

Tempo O(max(m, n)) para listas de tamanhos `m` e `n`. Espaço O(max(m, n)) para a lista resultado.

## Python

```python
def add_two_numbers(l1, l2):
    sentinela = ListNode(0)
    cauda = sentinela
    vai_um = 0
    while l1 or l2 or vai_um:
        soma = vai_um
        if l1:
            soma += l1.val
            l1 = l1.next
        if l2:
            soma += l2.val
            l2 = l2.next
        vai_um, digito = divmod(soma, 10)
        cauda.next = ListNode(digito)
        cauda = cauda.next
    return sentinela.next
```

## JavaScript

```javascript
function addTwoNumbers(l1, l2) {
  const sentinela = new ListNode(0);
  let cauda = sentinela;
  let vaiUm = 0;
  while (l1 || l2 || vaiUm) {
    let soma = vaiUm;
    if (l1) {
      soma += l1.val;
      l1 = l1.next;
    }
    if (l2) {
      soma += l2.val;
      l2 = l2.next;
    }
    vaiUm = Math.floor(soma / 10);
    cauda.next = new ListNode(soma % 10);
    cauda = cauda.next;
  }
  return sentinela.next;
}
```

## TypeScript

```typescript
function addTwoNumbers(l1, l2) {
  const sentinela = new ListNode(0);
  let cauda = sentinela;
  let vaiUm = 0;
  while (l1 || l2 || vaiUm) {
    let soma = vaiUm;
    if (l1) {
      soma += l1.val;
      l1 = l1.next;
    }
    if (l2) {
      soma += l2.val;
      l2 = l2.next;
    }
    vaiUm = Math.floor(soma / 10);
    cauda.next = new ListNode(soma % 10);
    cauda = cauda.next;
  }
  return sentinela.next;
}
```
