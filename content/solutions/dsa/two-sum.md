## Ideia

Para cada número `x`, o que você procura é o complemento `target - x`. Uma busca linear por ele em cada passo levaria O(n²). Em vez disso, percorra o array uma vez guardando num dicionário os números já vistos e o índice de cada um. Antes de guardar `x`, pergunte ao dicionário se `target - x` já apareceu: se sim, o par está pronto.

Guardar depois de consultar evita usar o mesmo elemento duas vezes.

## Complexidade

Tempo O(n), porque cada elemento é visitado uma vez e o dicionário responde em tempo constante. Espaço O(n) para o dicionário.

## Python

```python
def two_sum(nums, target):
    vistos = {}
    for i, x in enumerate(nums):
        if target - x in vistos:
            return [vistos[target - x], i]
        vistos[x] = i
```

## JavaScript

```javascript
function twoSum(nums, target) {
  const vistos = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (vistos.has(target - nums[i])) return [vistos.get(target - nums[i]), i];
    vistos.set(nums[i], i);
  }
}
```

## TypeScript

```typescript
function twoSum(nums: number[], target: number): number[] {
  const vistos = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const j = vistos.get(target - nums[i]);
    if (j !== undefined) return [j, i];
    vistos.set(nums[i], i);
  }
  return [];
}
```

## Java

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> vistos = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer j = vistos.get(target - nums[i]);
            if (j != null) return new int[]{j, i};
            vistos.put(nums[i], i);
        }
        return null;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> vistos;
        for (int i = 0; i < (int)nums.size(); i++) {
            auto it = vistos.find(target - nums[i]);
            if (it != vistos.end()) return {it->second, i};
            vistos[nums[i]] = i;
        }
        return {};
    }
};
```

## C#

```csharp
public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        var vistos = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++) {
            if (vistos.ContainsKey(target - nums[i])) return new int[]{vistos[target - nums[i]], i};
            vistos[nums[i]] = i;
        }
        return null;
    }
}
```

## Go

```go
func twoSum(nums []int, target int) []int {
	vistos := map[int]int{}
	for i, x := range nums {
		if j, ok := vistos[target-x]; ok {
			return []int{j, i}
		}
		vistos[x] = i
	}
	return nil
}
```
