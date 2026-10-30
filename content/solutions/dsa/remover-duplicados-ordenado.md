## Ideia

Como o array está ordenado, os valores repetidos ficam grudados. Use dois ponteiros: `escrita` marca a próxima posição livre para um valor distinto, e `leitura` percorre o array. Sempre que `nums[leitura]` difere do último valor guardado, ele é novo e é copiado para `nums[escrita]`.

No fim, as primeiras `escrita` posições contêm os valores distintos em ordem, e o restante é descartado (cortando o tamanho do array, nas linguagens em que isso é possível).

## Complexidade

Tempo O(n), uma passada. Espaço O(1) extra, pois tudo é feito no próprio array.

## Python

```python
def remove_duplicates(nums):
    escrita = 0
    for leitura in range(len(nums)):
        if escrita == 0 or nums[leitura] != nums[escrita - 1]:
            nums[escrita] = nums[leitura]
            escrita += 1
    del nums[escrita:]
```

## JavaScript

```javascript
function removeDuplicates(nums) {
  let escrita = 0;
  for (let leitura = 0; leitura < nums.length; leitura++) {
    if (escrita === 0 || nums[leitura] !== nums[escrita - 1]) nums[escrita++] = nums[leitura];
  }
  nums.length = escrita;
}
```

## TypeScript

```typescript
function removeDuplicates(nums: number[]): void {
  let escrita = 0;
  for (let leitura = 0; leitura < nums.length; leitura++) {
    if (escrita === 0 || nums[leitura] !== nums[escrita - 1]) nums[escrita++] = nums[leitura];
  }
  nums.length = escrita;
}
```
