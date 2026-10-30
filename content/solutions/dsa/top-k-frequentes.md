## Ideia

Primeiro contamos quantas vezes cada valor aparece. Depois, em vez de ordenar, usamos "baldes" indexados pela frequência: a frequência de qualquer valor vai de 1 até `n`, então o balde `f` guarda os valores que aparecem exatamente `f` vezes.

Percorremos os baldes da maior frequência para a menor, recolhendo valores até juntar `k`. Como a resposta é única, não há ambiguidade na fronteira.

## Complexidade

Tempo O(n), pois contar e percorrer os baldes são passos lineares. Espaço O(n) para as contagens e os baldes.

## Python

```python
def top_k_frequent(nums, k):
    contagem = {}
    for x in nums:
        contagem[x] = contagem.get(x, 0) + 1
    baldes = [[] for _ in range(len(nums) + 1)]
    for valor, freq in contagem.items():
        baldes[freq].append(valor)
    resultado = []
    for freq in range(len(nums), 0, -1):
        for valor in baldes[freq]:
            resultado.append(valor)
            if len(resultado) == k:
                return resultado
    return resultado
```

## JavaScript

```javascript
function topKFrequent(nums, k) {
  const contagem = new Map();
  for (const x of nums) contagem.set(x, (contagem.get(x) || 0) + 1);
  const baldes = Array.from({ length: nums.length + 1 }, () => []);
  for (const [valor, freq] of contagem) baldes[freq].push(valor);
  const resultado = [];
  for (let freq = nums.length; freq > 0; freq--) {
    for (const valor of baldes[freq]) {
      resultado.push(valor);
      if (resultado.length === k) return resultado;
    }
  }
  return resultado;
}
```

## TypeScript

```typescript
function topKFrequent(nums: number[], k: number): number[] {
  const contagem = new Map<number, number>();
  for (const x of nums) contagem.set(x, (contagem.get(x) ?? 0) + 1);
  const baldes: number[][] = Array.from({ length: nums.length + 1 }, () => []);
  for (const [valor, freq] of contagem) baldes[freq].push(valor);
  const resultado: number[] = [];
  for (let freq = nums.length; freq > 0; freq--) {
    for (const valor of baldes[freq]) {
      resultado.push(valor);
      if (resultado.length === k) return resultado;
    }
  }
  return resultado;
}
```

## Java

```java
class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> contagem = new HashMap<>();
        for (int x : nums) contagem.merge(x, 1, Integer::sum);
        List<List<Integer>> baldes = new ArrayList<>();
        for (int i = 0; i <= nums.length; i++) baldes.add(new ArrayList<>());
        for (Map.Entry<Integer, Integer> e : contagem.entrySet()) {
            baldes.get(e.getValue()).add(e.getKey());
        }
        int[] resultado = new int[k];
        int pos = 0;
        for (int freq = nums.length; freq > 0 && pos < k; freq--) {
            for (int valor : baldes.get(freq)) {
                if (pos == k) break;
                resultado[pos++] = valor;
            }
        }
        return resultado;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> contagem;
        for (int x : nums) contagem[x]++;
        vector<vector<int>> baldes(nums.size() + 1);
        for (auto& [valor, freq] : contagem) baldes[freq].push_back(valor);
        vector<int> resultado;
        for (int freq = nums.size(); freq > 0 && (int)resultado.size() < k; freq--) {
            for (int valor : baldes[freq]) {
                if ((int)resultado.size() == k) break;
                resultado.push_back(valor);
            }
        }
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int[] TopKFrequent(int[] nums, int k) {
        var contagem = new Dictionary<int, int>();
        foreach (int x in nums) {
            contagem[x] = contagem.GetValueOrDefault(x) + 1;
        }
        var baldes = new List<int>[nums.Length + 1];
        for (int i = 0; i <= nums.Length; i++) baldes[i] = new List<int>();
        foreach (var par in contagem) baldes[par.Value].Add(par.Key);
        var resultado = new List<int>();
        for (int freq = nums.Length; freq > 0 && resultado.Count < k; freq--) {
            foreach (int valor in baldes[freq]) {
                if (resultado.Count == k) break;
                resultado.Add(valor);
            }
        }
        return resultado.ToArray();
    }
}
```

## Go

```go
func topKFrequent(nums []int, k int) []int {
	contagem := map[int]int{}
	for _, x := range nums {
		contagem[x]++
	}
	baldes := make([][]int, len(nums)+1)
	for valor, freq := range contagem {
		baldes[freq] = append(baldes[freq], valor)
	}
	resultado := []int{}
	for freq := len(nums); freq > 0 && len(resultado) < k; freq-- {
		for _, valor := range baldes[freq] {
			if len(resultado) == k {
				break
			}
			resultado = append(resultado, valor)
		}
	}
	return resultado
}
```
