## Ideia

Ordenamos o array. Fixamos o primeiro elemento da tripla na posição `i` e, no trecho à direita, procuramos dois números que somem `-nums[i]` com dois ponteiros, um no início e outro no fim: se a soma é pequena demais, avançamos o ponteiro esquerdo; se é grande demais, recuamos o direito.

Para não repetir triplas, pulamos valores iguais ao anterior, tanto no elemento fixo quanto nos ponteiros depois de achar uma tripla. Além disso, se o elemento fixo já é positivo, nenhuma soma pode dar zero, e podemos parar.

## Complexidade

Tempo O(n²): a ordenação custa O(n log n) e cada elemento fixo faz uma varredura linear. Espaço O(1) extra, além da saída e da ordenação.

## Python

```python
def three_sum(nums):
    nums = sorted(nums)
    resultado = []
    n = len(nums)
    for i in range(n - 2):
        if nums[i] > 0:
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        esq, dir = i + 1, n - 1
        while esq < dir:
            soma = nums[i] + nums[esq] + nums[dir]
            if soma < 0:
                esq += 1
            elif soma > 0:
                dir -= 1
            else:
                resultado.append([nums[i], nums[esq], nums[dir]])
                esq += 1
                while esq < dir and nums[esq] == nums[esq - 1]:
                    esq += 1
                dir -= 1
    return resultado
```

## JavaScript

```javascript
function threeSum(nums) {
  nums = [...nums].sort((a, b) => a - b);
  const resultado = [];
  const n = nums.length;
  for (let i = 0; i < n - 2; i++) {
    if (nums[i] > 0) break;
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let esq = i + 1, dir = n - 1;
    while (esq < dir) {
      const soma = nums[i] + nums[esq] + nums[dir];
      if (soma < 0) esq++;
      else if (soma > 0) dir--;
      else {
        resultado.push([nums[i], nums[esq], nums[dir]]);
        esq++;
        while (esq < dir && nums[esq] === nums[esq - 1]) esq++;
        dir--;
      }
    }
  }
  return resultado;
}
```

## TypeScript

```typescript
function threeSum(nums: number[]): number[][] {
  nums = [...nums].sort((a, b) => a - b);
  const resultado: number[][] = [];
  const n = nums.length;
  for (let i = 0; i < n - 2; i++) {
    if (nums[i] > 0) break;
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let esq = i + 1, dir = n - 1;
    while (esq < dir) {
      const soma = nums[i] + nums[esq] + nums[dir];
      if (soma < 0) esq++;
      else if (soma > 0) dir--;
      else {
        resultado.push([nums[i], nums[esq], nums[dir]]);
        esq++;
        while (esq < dir && nums[esq] === nums[esq - 1]) esq++;
        dir--;
      }
    }
  }
  return resultado;
}
```

## Java

```java
class Solution {
    public int[][] threeSum(int[] nums) {
        int[] v = nums.clone();
        Arrays.sort(v);
        int n = v.length;
        List<int[]> resultado = new ArrayList<>();
        for (int i = 0; i < n - 2; i++) {
            if (v[i] > 0) break;
            if (i > 0 && v[i] == v[i - 1]) continue;
            int esq = i + 1, dir = n - 1;
            while (esq < dir) {
                int soma = v[i] + v[esq] + v[dir];
                if (soma < 0) esq++;
                else if (soma > 0) dir--;
                else {
                    resultado.add(new int[]{v[i], v[esq], v[dir]});
                    esq++;
                    while (esq < dir && v[esq] == v[esq - 1]) esq++;
                    dir--;
                }
            }
        }
        return resultado.toArray(new int[0][]);
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<int> v = nums;
        sort(v.begin(), v.end());
        int n = v.size();
        vector<vector<int>> resultado;
        for (int i = 0; i < n - 2; i++) {
            if (v[i] > 0) break;
            if (i > 0 && v[i] == v[i - 1]) continue;
            int esq = i + 1, dir = n - 1;
            while (esq < dir) {
                int soma = v[i] + v[esq] + v[dir];
                if (soma < 0) esq++;
                else if (soma > 0) dir--;
                else {
                    resultado.push_back({v[i], v[esq], v[dir]});
                    esq++;
                    while (esq < dir && v[esq] == v[esq - 1]) esq++;
                    dir--;
                }
            }
        }
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int[][] ThreeSum(int[] nums) {
        int[] v = (int[])nums.Clone();
        Array.Sort(v);
        int n = v.Length;
        var resultado = new List<int[]>();
        for (int i = 0; i < n - 2; i++) {
            if (v[i] > 0) break;
            if (i > 0 && v[i] == v[i - 1]) continue;
            int esq = i + 1, dir = n - 1;
            while (esq < dir) {
                int soma = v[i] + v[esq] + v[dir];
                if (soma < 0) esq++;
                else if (soma > 0) dir--;
                else {
                    resultado.Add(new int[]{v[i], v[esq], v[dir]});
                    esq++;
                    while (esq < dir && v[esq] == v[esq - 1]) esq++;
                    dir--;
                }
            }
        }
        return resultado.ToArray();
    }
}
```

## Go

```go
import "sort"

func threeSum(nums []int) [][]int {
	v := append([]int(nil), nums...)
	sort.Ints(v)
	n := len(v)
	resultado := [][]int{}
	for i := 0; i < n-2; i++ {
		if v[i] > 0 {
			break
		}
		if i > 0 && v[i] == v[i-1] {
			continue
		}
		esq, dir := i+1, n-1
		for esq < dir {
			soma := v[i] + v[esq] + v[dir]
			if soma < 0 {
				esq++
			} else if soma > 0 {
				dir--
			} else {
				resultado = append(resultado, []int{v[i], v[esq], v[dir]})
				esq++
				for esq < dir && v[esq] == v[esq-1] {
					esq++
				}
				dir--
			}
		}
	}
	return resultado
}
```
