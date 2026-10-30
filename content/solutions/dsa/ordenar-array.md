## Ideia

O merge sort divide o array ao meio, ordena cada metade recursivamente e intercala as duas metades já ordenadas. A intercalação compara as frentes das duas metades e copia sempre a menor; usar `<=` na comparação mantém a ordenação estável.

Como a cada nível da recursão o trabalho total de intercalar é linear e há cerca de `log n` níveis, o custo é O(n log n) em qualquer entrada, inclusive já ordenada ou com muitos valores repetidos, ao contrário de um quick sort com pivô fixo.

## Complexidade

Tempo O(n log n) em todos os casos. Espaço O(n) para os arrays auxiliares da intercalação.

## Python

```python
def sort_array(nums):
    if len(nums) <= 1:
        return list(nums)
    meio = len(nums) // 2
    esq = sort_array(nums[:meio])
    dir_ = sort_array(nums[meio:])
    resultado = []
    i = j = 0
    while i < len(esq) and j < len(dir_):
        if esq[i] <= dir_[j]:
            resultado.append(esq[i])
            i += 1
        else:
            resultado.append(dir_[j])
            j += 1
    resultado.extend(esq[i:])
    resultado.extend(dir_[j:])
    return resultado
```

## JavaScript

```javascript
function sortArray(nums) {
  if (nums.length <= 1) return nums.slice();
  const meio = nums.length >> 1;
  const esq = sortArray(nums.slice(0, meio));
  const dir = sortArray(nums.slice(meio));
  const resultado = [];
  let i = 0, j = 0;
  while (i < esq.length && j < dir.length) {
    if (esq[i] <= dir[j]) resultado.push(esq[i++]);
    else resultado.push(dir[j++]);
  }
  while (i < esq.length) resultado.push(esq[i++]);
  while (j < dir.length) resultado.push(dir[j++]);
  return resultado;
}
```

## TypeScript

```typescript
function sortArray(nums: number[]): number[] {
  if (nums.length <= 1) return nums.slice();
  const meio = nums.length >> 1;
  const esq = sortArray(nums.slice(0, meio));
  const dir = sortArray(nums.slice(meio));
  const resultado: number[] = [];
  let i = 0, j = 0;
  while (i < esq.length && j < dir.length) {
    if (esq[i] <= dir[j]) resultado.push(esq[i++]);
    else resultado.push(dir[j++]);
  }
  while (i < esq.length) resultado.push(esq[i++]);
  while (j < dir.length) resultado.push(dir[j++]);
  return resultado;
}
```

## Java

```java
class Solution {
    public int[] sortArray(int[] nums) {
        int[] a = nums.clone();
        ordenar(a, new int[a.length], 0, a.length);
        return a;
    }

    // ordena a[ini, fim)
    private void ordenar(int[] a, int[] aux, int ini, int fim) {
        if (fim - ini <= 1) return;
        int meio = (ini + fim) / 2;
        ordenar(a, aux, ini, meio);
        ordenar(a, aux, meio, fim);
        int i = ini, j = meio, k = ini;
        while (i < meio && j < fim) aux[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i < meio) aux[k++] = a[i++];
        while (j < fim) aux[k++] = a[j++];
        for (k = ini; k < fim; k++) a[k] = aux[k];
    }
}
```

## C++

```cpp
class Solution {
    void ordenar(vector<int>& a, vector<int>& aux, int ini, int fim) {
        if (fim - ini <= 1) return;
        int meio = (ini + fim) / 2;
        ordenar(a, aux, ini, meio);
        ordenar(a, aux, meio, fim);
        int i = ini, j = meio, k = ini;
        while (i < meio && j < fim) aux[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i < meio) aux[k++] = a[i++];
        while (j < fim) aux[k++] = a[j++];
        for (k = ini; k < fim; k++) a[k] = aux[k];
    }

public:
    vector<int> sortArray(vector<int>& nums) {
        vector<int> a = nums, aux(nums.size());
        ordenar(a, aux, 0, a.size());
        return a;
    }
};
```

## C#

```csharp
public class Solution {
    public int[] SortArray(int[] nums) {
        var a = (int[])nums.Clone();
        Ordenar(a, new int[a.Length], 0, a.Length);
        return a;
    }

    private void Ordenar(int[] a, int[] aux, int ini, int fim) {
        if (fim - ini <= 1) return;
        int meio = (ini + fim) / 2;
        Ordenar(a, aux, ini, meio);
        Ordenar(a, aux, meio, fim);
        int i = ini, j = meio, k = ini;
        while (i < meio && j < fim) aux[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i < meio) aux[k++] = a[i++];
        while (j < fim) aux[k++] = a[j++];
        for (k = ini; k < fim; k++) a[k] = aux[k];
    }
}
```

## Go

```go
func sortArray(nums []int) []int {
	a := make([]int, len(nums))
	copy(a, nums)
	aux := make([]int, len(nums))
	ordenarMerge(a, aux, 0, len(a))
	return a
}

func ordenarMerge(a, aux []int, ini, fim int) {
	if fim-ini <= 1 {
		return
	}
	meio := (ini + fim) / 2
	ordenarMerge(a, aux, ini, meio)
	ordenarMerge(a, aux, meio, fim)
	i, j, k := ini, meio, ini
	for i < meio && j < fim {
		if a[i] <= a[j] {
			aux[k] = a[i]
			i++
		} else {
			aux[k] = a[j]
			j++
		}
		k++
	}
	for i < meio {
		aux[k] = a[i]
		i++
		k++
	}
	for j < fim {
		aux[k] = a[j]
		j++
		k++
	}
	copy(a[ini:fim], aux[ini:fim])
}
```
