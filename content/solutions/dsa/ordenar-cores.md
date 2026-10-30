## Ideia

Este é o problema da bandeira holandesa. Mantenha três regiões: zeros no começo (até o índice `baixo`), dois no fim (a partir de `alto`) e os ainda não analisados no meio, onde `atual` percorre. Se o elemento atual é `0`, troque-o com a posição `baixo` e avance os dois ponteiros; se é `1`, apenas avance `atual`; se é `2`, troque-o com a posição `alto` e recue `alto`.

Neste último caso `atual` não avança, porque o valor que veio do fim ainda não foi examinado e pode ser `0` ou `2`. Já no caso do `0`, o valor trocado vindo de `baixo` já foi visto e é `1`, então avançar é seguro.

## Complexidade

Tempo O(n), uma única passada. Espaço O(1).

## Python

```python
def sort_colors(nums):
    baixo, atual, alto = 0, 0, len(nums) - 1
    while atual <= alto:
        if nums[atual] == 0:
            nums[baixo], nums[atual] = nums[atual], nums[baixo]
            baixo += 1
            atual += 1
        elif nums[atual] == 1:
            atual += 1
        else:
            nums[atual], nums[alto] = nums[alto], nums[atual]
            alto -= 1
```

## JavaScript

```javascript
function sortColors(nums) {
  let baixo = 0, atual = 0, alto = nums.length - 1;
  while (atual <= alto) {
    if (nums[atual] === 0) {
      [nums[baixo], nums[atual]] = [nums[atual], nums[baixo]];
      baixo++;
      atual++;
    } else if (nums[atual] === 1) {
      atual++;
    } else {
      [nums[atual], nums[alto]] = [nums[alto], nums[atual]];
      alto--;
    }
  }
}
```

## TypeScript

```typescript
function sortColors(nums: number[]): void {
  let baixo = 0, atual = 0, alto = nums.length - 1;
  while (atual <= alto) {
    if (nums[atual] === 0) {
      [nums[baixo], nums[atual]] = [nums[atual], nums[baixo]];
      baixo++;
      atual++;
    } else if (nums[atual] === 1) {
      atual++;
    } else {
      [nums[atual], nums[alto]] = [nums[alto], nums[atual]];
      alto--;
    }
  }
}
```

## Java

```java
class Solution {
    public void sortColors(int[] nums) {
        int baixo = 0, atual = 0, alto = nums.length - 1;
        while (atual <= alto) {
            if (nums[atual] == 0) {
                int t = nums[baixo]; nums[baixo] = nums[atual]; nums[atual] = t;
                baixo++;
                atual++;
            } else if (nums[atual] == 1) {
                atual++;
            } else {
                int t = nums[atual]; nums[atual] = nums[alto]; nums[alto] = t;
                alto--;
            }
        }
    }
}
```

## C++

```cpp
class Solution {
public:
    void sortColors(vector<int>& nums) {
        int baixo = 0, atual = 0, alto = (int)nums.size() - 1;
        while (atual <= alto) {
            if (nums[atual] == 0) {
                swap(nums[baixo++], nums[atual++]);
            } else if (nums[atual] == 1) {
                atual++;
            } else {
                swap(nums[atual], nums[alto--]);
            }
        }
    }
};
```

## C#

```csharp
public class Solution {
    public void SortColors(int[] nums) {
        int baixo = 0, atual = 0, alto = nums.Length - 1;
        while (atual <= alto) {
            if (nums[atual] == 0) {
                int t = nums[baixo]; nums[baixo] = nums[atual]; nums[atual] = t;
                baixo++;
                atual++;
            } else if (nums[atual] == 1) {
                atual++;
            } else {
                int t = nums[atual]; nums[atual] = nums[alto]; nums[alto] = t;
                alto--;
            }
        }
    }
}
```

## Go

```go
func sortColors(nums []int) {
	baixo, atual, alto := 0, 0, len(nums)-1
	for atual <= alto {
		if nums[atual] == 0 {
			nums[baixo], nums[atual] = nums[atual], nums[baixo]
			baixo++
			atual++
		} else if nums[atual] == 1 {
			atual++
		} else {
			nums[atual], nums[alto] = nums[alto], nums[atual]
			alto--
		}
	}
}
```
