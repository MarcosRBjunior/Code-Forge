## Ideia

Cada elemento tem duas opções independentes: entrar ou não no subconjunto. Começando com a lista contendo só o conjunto vazio, processe os números um a um: para cada subconjunto já gerado, crie uma cópia com o novo número acrescentado. Depois de processar todos, a lista contém os `2^n` subconjuntos.

Como os números são distintos, nenhum subconjunto se repete.

## Complexidade

Tempo O(n · 2^n), pois há `2^n` subconjuntos e copiar cada um custa até `n`. Espaço O(n · 2^n) para a saída.

## Python

```python
def subsets(nums):
    resultado = [[]]
    for x in nums:
        resultado += [parcial + [x] for parcial in resultado]
    return resultado
```

## JavaScript

```javascript
function subsets(nums) {
  let resultado = [[]];
  for (const x of nums) {
    resultado = resultado.concat(resultado.map((parcial) => [...parcial, x]));
  }
  return resultado;
}
```

## TypeScript

```typescript
function subsets(nums: number[]): number[][] {
  let resultado: number[][] = [[]];
  for (const x of nums) {
    resultado = resultado.concat(resultado.map((parcial) => [...parcial, x]));
  }
  return resultado;
}
```

## Java

```java
class Solution {
    public int[][] subsets(int[] nums) {
        int n = nums.length;
        int[][] resultado = new int[1 << n][];
        for (int mascara = 0; mascara < (1 << n); mascara++) {
            int[] sub = new int[Integer.bitCount(mascara)];
            int k = 0;
            for (int i = 0; i < n; i++) {
                if ((mascara & (1 << i)) != 0) sub[k++] = nums[i];
            }
            resultado[mascara] = sub;
        }
        return resultado;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> resultado = {{}};
        for (int x : nums) {
            int tamanho = resultado.size();
            for (int i = 0; i < tamanho; i++) {
                vector<int> copia = resultado[i];
                copia.push_back(x);
                resultado.push_back(copia);
            }
        }
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int[][] Subsets(int[] nums) {
        int n = nums.Length;
        var resultado = new int[1 << n][];
        for (int mascara = 0; mascara < (1 << n); mascara++) {
            var sub = new List<int>();
            for (int i = 0; i < n; i++) {
                if ((mascara & (1 << i)) != 0) sub.Add(nums[i]);
            }
            resultado[mascara] = sub.ToArray();
        }
        return resultado;
    }
}
```

## Go

```go
func subsets(nums []int) [][]int {
	resultado := [][]int{{}}
	for _, x := range nums {
		tamanho := len(resultado)
		for i := 0; i < tamanho; i++ {
			copia := append(append([]int{}, resultado[i]...), x)
			resultado = append(resultado, copia)
		}
	}
	return resultado
}
```
