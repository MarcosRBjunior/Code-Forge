## Ideia

A mediana separa a união dos dois arrays em uma metade esquerda e uma direita de tamanhos (quase) iguais. Basta escolher quantos elementos do array menor vão para a esquerda, digamos `i`; o restante da metade esquerda, `metade - i`, vem do outro array. A partição é válida quando o maior elemento à esquerda de cada array é menor ou igual ao menor elemento à direita do outro.

Como a validade é monotônica em `i`, uma busca binária sobre o corte do array menor encontra a partição certa. Se o último elemento da esquerda do primeiro array é maior que o primeiro da direita do segundo, o corte está grande demais; no caso inverso, está pequeno demais. Com a partição certa, a mediana sai dos quatro valores vizinhos ao corte.

## Complexidade

Tempo O(log(min(m, n))), pois a busca binária é feita só no array menor. Espaço O(1).

## Python

```python
def find_median_sorted_arrays(nums1, nums2):
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    m, n = len(nums1), len(nums2)
    metade = (m + n + 1) // 2
    inf = float("inf")
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2
        j = metade - i
        esq1 = nums1[i - 1] if i > 0 else -inf
        dir1 = nums1[i] if i < m else inf
        esq2 = nums2[j - 1] if j > 0 else -inf
        dir2 = nums2[j] if j < n else inf
        if esq1 > dir2:
            hi = i - 1
        elif esq2 > dir1:
            lo = i + 1
        else:
            if (m + n) % 2 == 1:
                return max(esq1, esq2)
            return (max(esq1, esq2) + min(dir1, dir2)) / 2
```

## JavaScript

```javascript
function findMedianSortedArrays(nums1, nums2) {
  if (nums1.length > nums2.length) [nums1, nums2] = [nums2, nums1];
  const m = nums1.length, n = nums2.length;
  const metade = Math.floor((m + n + 1) / 2);
  let lo = 0, hi = m;
  while (lo <= hi) {
    const i = Math.floor((lo + hi) / 2);
    const j = metade - i;
    const esq1 = i > 0 ? nums1[i - 1] : -Infinity;
    const dir1 = i < m ? nums1[i] : Infinity;
    const esq2 = j > 0 ? nums2[j - 1] : -Infinity;
    const dir2 = j < n ? nums2[j] : Infinity;
    if (esq1 > dir2) hi = i - 1;
    else if (esq2 > dir1) lo = i + 1;
    else {
      if ((m + n) % 2 === 1) return Math.max(esq1, esq2);
      return (Math.max(esq1, esq2) + Math.min(dir1, dir2)) / 2;
    }
  }
  return 0;
}
```

## TypeScript

```typescript
function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  if (nums1.length > nums2.length) [nums1, nums2] = [nums2, nums1];
  const m = nums1.length, n = nums2.length;
  const metade = Math.floor((m + n + 1) / 2);
  let lo = 0, hi = m;
  while (lo <= hi) {
    const i = Math.floor((lo + hi) / 2);
    const j = metade - i;
    const esq1 = i > 0 ? nums1[i - 1] : -Infinity;
    const dir1 = i < m ? nums1[i] : Infinity;
    const esq2 = j > 0 ? nums2[j - 1] : -Infinity;
    const dir2 = j < n ? nums2[j] : Infinity;
    if (esq1 > dir2) hi = i - 1;
    else if (esq2 > dir1) lo = i + 1;
    else {
      if ((m + n) % 2 === 1) return Math.max(esq1, esq2);
      return (Math.max(esq1, esq2) + Math.min(dir1, dir2)) / 2;
    }
  }
  return 0;
}
```

## Java

```java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) {
            int[] t = nums1; nums1 = nums2; nums2 = t;
        }
        int m = nums1.length, n = nums2.length;
        int metade = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2;
            int j = metade - i;
            int esq1 = i > 0 ? nums1[i - 1] : Integer.MIN_VALUE;
            int dir1 = i < m ? nums1[i] : Integer.MAX_VALUE;
            int esq2 = j > 0 ? nums2[j - 1] : Integer.MIN_VALUE;
            int dir2 = j < n ? nums2[j] : Integer.MAX_VALUE;
            if (esq1 > dir2) hi = i - 1;
            else if (esq2 > dir1) lo = i + 1;
            else {
                if ((m + n) % 2 == 1) return Math.max(esq1, esq2);
                return (Math.max(esq1, esq2) + (double) Math.min(dir1, dir2)) / 2;
            }
        }
        return 0.0;
    }
}
```

## C++

```cpp
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size();
        int metade = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2;
            int j = metade - i;
            int esq1 = i > 0 ? nums1[i - 1] : INT_MIN;
            int dir1 = i < m ? nums1[i] : INT_MAX;
            int esq2 = j > 0 ? nums2[j - 1] : INT_MIN;
            int dir2 = j < n ? nums2[j] : INT_MAX;
            if (esq1 > dir2) hi = i - 1;
            else if (esq2 > dir1) lo = i + 1;
            else {
                if ((m + n) % 2 == 1) return max(esq1, esq2);
                return (max(esq1, esq2) + (double)min(dir1, dir2)) / 2;
            }
        }
        return 0.0;
    }
};
```

## C#

```csharp
public class Solution {
    public double FindMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.Length > nums2.Length) return FindMedianSortedArrays(nums2, nums1);
        int m = nums1.Length, n = nums2.Length;
        int metade = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2;
            int j = metade - i;
            int esq1 = i > 0 ? nums1[i - 1] : int.MinValue;
            int dir1 = i < m ? nums1[i] : int.MaxValue;
            int esq2 = j > 0 ? nums2[j - 1] : int.MinValue;
            int dir2 = j < n ? nums2[j] : int.MaxValue;
            if (esq1 > dir2) hi = i - 1;
            else if (esq2 > dir1) lo = i + 1;
            else {
                if ((m + n) % 2 == 1) return Math.Max(esq1, esq2);
                return (Math.Max(esq1, esq2) + (double)Math.Min(dir1, dir2)) / 2;
            }
        }
        return 0.0;
    }
}
```

## Go

```go
import "math"

func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {
	if len(nums1) > len(nums2) {
		nums1, nums2 = nums2, nums1
	}
	m, n := len(nums1), len(nums2)
	metade := (m + n + 1) / 2
	lo, hi := 0, m
	for lo <= hi {
		i := (lo + hi) / 2
		j := metade - i
		esq1, dir1, esq2, dir2 := math.MinInt32, math.MaxInt32, math.MinInt32, math.MaxInt32
		if i > 0 {
			esq1 = nums1[i-1]
		}
		if i < m {
			dir1 = nums1[i]
		}
		if j > 0 {
			esq2 = nums2[j-1]
		}
		if j < n {
			dir2 = nums2[j]
		}
		if esq1 > dir2 {
			hi = i - 1
		} else if esq2 > dir1 {
			lo = i + 1
		} else {
			maxEsq := esq1
			if esq2 > maxEsq {
				maxEsq = esq2
			}
			minDir := dir1
			if dir2 < minDir {
				minDir = dir2
			}
			if (m+n)%2 == 1 {
				return float64(maxEsq)
			}
			return float64(maxEsq+minDir) / 2
		}
	}
	return 0
}
```
