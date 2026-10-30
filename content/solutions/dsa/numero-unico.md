## Ideia

O XOR de um número com ele mesmo é `0`, e o XOR de qualquer número com `0` é o próprio número. Além disso, o XOR é comutativo e associativo, então a ordem não importa. Fazendo o XOR de todos os elementos, cada par se cancela e sobra apenas o valor que aparece uma vez.

Isso dispensa conjuntos ou contagens e usa memória extra constante.

## Complexidade

Tempo O(n), uma passada. Espaço O(1).

## Python

```python
def single_number(nums):
    resultado = 0
    for x in nums:
        resultado ^= x
    return resultado
```

## JavaScript

```javascript
function singleNumber(nums) {
  let resultado = 0;
  for (const x of nums) resultado ^= x;
  return resultado;
}
```

## TypeScript

```typescript
function singleNumber(nums: number[]): number {
  let resultado = 0;
  for (const x of nums) resultado ^= x;
  return resultado;
}
```

## Java

```java
class Solution {
    public int singleNumber(int[] nums) {
        int resultado = 0;
        for (int x : nums) resultado ^= x;
        return resultado;
    }
}
```

## C++

```cpp
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int resultado = 0;
        for (int x : nums) resultado ^= x;
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int SingleNumber(int[] nums) {
        int resultado = 0;
        foreach (int x in nums) resultado ^= x;
        return resultado;
    }
}
```

## Go

```go
func singleNumber(nums []int) int {
	resultado := 0
	for _, x := range nums {
		resultado ^= x
	}
	return resultado
}
```
