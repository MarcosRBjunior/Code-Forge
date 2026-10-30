## Ideia

Percorra o array guardando num conjunto os valores já vistos. Se o valor atual já está no conjunto, encontramos um duplicado e podemos parar na hora; se terminar o laço sem isso, todos são distintos.

Consultar e inserir num conjunto hash custa O(1) em média, o que evita comparar cada par de elementos.

## Complexidade

Tempo O(n) em média. Espaço O(n) para o conjunto.

## Python

```python
def contains_duplicate(nums):
    vistos = set()
    for x in nums:
        if x in vistos:
            return True
        vistos.add(x)
    return False
```

## JavaScript

```javascript
function containsDuplicate(nums) {
  const vistos = new Set();
  for (const x of nums) {
    if (vistos.has(x)) return true;
    vistos.add(x);
  }
  return false;
}
```

## TypeScript

```typescript
function containsDuplicate(nums: number[]): boolean {
  const vistos = new Set<number>();
  for (const x of nums) {
    if (vistos.has(x)) return true;
    vistos.add(x);
  }
  return false;
}
```

## Java

```java
class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> vistos = new HashSet<>();
        for (int x : nums) {
            if (!vistos.add(x)) return true;
        }
        return false;
    }
}
```

## C++

```cpp
class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> vistos;
        for (int x : nums) {
            if (!vistos.insert(x).second) return true;
        }
        return false;
    }
};
```

## C#

```csharp
public class Solution {
    public bool ContainsDuplicate(int[] nums) {
        var vistos = new HashSet<int>();
        foreach (int x in nums) {
            if (!vistos.Add(x)) return true;
        }
        return false;
    }
}
```

## Go

```go
func containsDuplicate(nums []int) bool {
	vistos := make(map[int]struct{})
	for _, x := range nums {
		if _, ok := vistos[x]; ok {
			return true
		}
		vistos[x] = struct{}{}
	}
	return false
}
```
