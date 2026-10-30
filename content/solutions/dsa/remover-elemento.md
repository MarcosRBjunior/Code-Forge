## Ideia

Percorra o array com um ponteiro de leitura e mantenha um ponteiro de escrita que aponta para a próxima posição onde cabe um elemento que fica. Cada elemento diferente de `val` é copiado para a posição de escrita, que então avança; os iguais a `val` são simplesmente pulados.

Ao final, as primeiras `escrita` posições têm os elementos restantes na ordem original. Assim evitamos remoções no meio do array, que custariam O(n) cada.

## Complexidade

Tempo O(n), uma passada. Espaço O(1) extra.

## Python

```python
def remove_element(nums, val):
    escrita = 0
    for x in nums:
        if x != val:
            nums[escrita] = x
            escrita += 1
    del nums[escrita:]
```

## JavaScript

```javascript
function removeElement(nums, val) {
  let escrita = 0;
  for (const x of nums) {
    if (x !== val) nums[escrita++] = x;
  }
  nums.length = escrita;
}
```

## TypeScript

```typescript
function removeElement(nums: number[], val: number): void {
  let escrita = 0;
  for (const x of nums) {
    if (x !== val) nums[escrita++] = x;
  }
  nums.length = escrita;
}
```
