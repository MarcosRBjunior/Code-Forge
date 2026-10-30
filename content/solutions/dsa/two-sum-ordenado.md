## Ideia

Com o array ordenado, colocamos um ponteiro em cada ponta. Se a soma dos dois é menor que `target`, só podemos aumentá-la avançando o ponteiro esquerdo (o valor da direita já é o maior possível para essa esquerda); se é maior, recuamos o direito. Nenhum par descartado pode ser a resposta, porque cada movimento elimina todos os pares que usariam o elemento deixado para trás.

Quando a soma é igual a `target`, devolvemos os índices, que já saem em ordem crescente.

## Complexidade

Tempo O(n), pois os ponteiros se aproximam sem voltar. Espaço O(1).

## Python

```python
def two_sum_sorted(numbers, target):
    esq, dir = 0, len(numbers) - 1
    while esq < dir:
        soma = numbers[esq] + numbers[dir]
        if soma == target:
            return [esq, dir]
        if soma < target:
            esq += 1
        else:
            dir -= 1
```

## JavaScript

```javascript
function twoSumSorted(numbers, target) {
  let esq = 0, dir = numbers.length - 1;
  while (esq < dir) {
    const soma = numbers[esq] + numbers[dir];
    if (soma === target) return [esq, dir];
    if (soma < target) esq++;
    else dir--;
  }
}
```

## TypeScript

```typescript
function twoSumSorted(numbers: number[], target: number): number[] {
  let esq = 0, dir = numbers.length - 1;
  while (esq < dir) {
    const soma = numbers[esq] + numbers[dir];
    if (soma === target) return [esq, dir];
    if (soma < target) esq++;
    else dir--;
  }
  return [];
}
```

## Java

```java
class Solution {
    public int[] twoSumSorted(int[] numbers, int target) {
        int esq = 0, dir = numbers.length - 1;
        while (esq < dir) {
            int soma = numbers[esq] + numbers[dir];
            if (soma == target) return new int[]{esq, dir};
            if (soma < target) esq++;
            else dir--;
        }
        return null;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> twoSumSorted(vector<int>& numbers, int target) {
        int esq = 0, dir = (int)numbers.size() - 1;
        while (esq < dir) {
            int soma = numbers[esq] + numbers[dir];
            if (soma == target) return {esq, dir};
            if (soma < target) esq++;
            else dir--;
        }
        return {};
    }
};
```

## C#

```csharp
public class Solution {
    public int[] TwoSumSorted(int[] numbers, int target) {
        int esq = 0, dir = numbers.Length - 1;
        while (esq < dir) {
            int soma = numbers[esq] + numbers[dir];
            if (soma == target) return new int[]{esq, dir};
            if (soma < target) esq++;
            else dir--;
        }
        return null;
    }
}
```

## Go

```go
func twoSumSorted(numbers []int, target int) []int {
	esq, dir := 0, len(numbers)-1
	for esq < dir {
		soma := numbers[esq] + numbers[dir]
		if soma == target {
			return []int{esq, dir}
		}
		if soma < target {
			esq++
		} else {
			dir--
		}
	}
	return nil
}
```
