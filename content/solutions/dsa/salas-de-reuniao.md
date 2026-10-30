## Ideia

Ordene as reuniões pelo horário de início e mantenha uma min-heap com os horários de término das reuniões que ainda ocupam salas. Ao chegar uma nova reunião, se a que termina mais cedo (o topo da heap) acaba antes ou exatamente quando a nova começa, aquela sala é reaproveitada: removemos o topo. Em seguida, inserimos o término da nova reunião.

O tamanho máximo que a heap atinge é o número de salas necessário, e ao final o tamanho da heap já é esse máximo, pois salas só são liberadas quando reaproveitadas.

## Complexidade

Tempo O(n log n), pela ordenação e pelas operações na heap. Espaço O(n).

## Python

```python
import heapq


def min_meeting_rooms(intervals):
    salas = []  # heap com os horários de término
    for inicio, fim in sorted(intervals):
        if salas and salas[0] <= inicio:
            heapq.heapreplace(salas, fim)
        else:
            heapq.heappush(salas, fim)
    return len(salas)
```

## JavaScript

```javascript
function minMeetingRooms(intervals) {
  const inicios = intervals.map((r) => r[0]).sort((a, b) => a - b);
  const fins = intervals.map((r) => r[1]).sort((a, b) => a - b);
  // varredura com dois ponteiros: início mais cedo contra término mais cedo
  let salas = 0;
  let j = 0;
  for (let i = 0; i < inicios.length; i++) {
    if (inicios[i] >= fins[j]) j++;
    else salas++;
  }
  return salas;
}
```

## TypeScript

```typescript
function minMeetingRooms(intervals: number[][]): number {
  const inicios = intervals.map((r) => r[0]).sort((a, b) => a - b);
  const fins = intervals.map((r) => r[1]).sort((a, b) => a - b);
  // varredura com dois ponteiros: início mais cedo contra término mais cedo
  let salas = 0;
  let j = 0;
  for (let i = 0; i < inicios.length; i++) {
    if (inicios[i] >= fins[j]) j++;
    else salas++;
  }
  return salas;
}
```

## Java

```java
class Solution {
    public int minMeetingRooms(int[][] intervals) {
        int[][] ordenadas = intervals.clone();
        Arrays.sort(ordenadas, (a, b) -> Integer.compare(a[0], b[0]));
        PriorityQueue<Integer> salas = new PriorityQueue<>();
        for (int[] r : ordenadas) {
            if (!salas.isEmpty() && salas.peek() <= r[0]) salas.poll();
            salas.add(r[1]);
        }
        return salas.size();
    }
}
```

## C++

```cpp
class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        vector<vector<int>> ordenadas = intervals;
        sort(ordenadas.begin(), ordenadas.end());
        priority_queue<int, vector<int>, greater<int>> salas;
        for (auto& r : ordenadas) {
            if (!salas.empty() && salas.top() <= r[0]) salas.pop();
            salas.push(r[1]);
        }
        return salas.size();
    }
};
```

## C#

```csharp
public class Solution {
    public int MinMeetingRooms(int[][] intervals) {
        // sem PriorityQueue: varredura com inícios e términos ordenados
        int[] inicios = intervals.Select(r => r[0]).OrderBy(x => x).ToArray();
        int[] fins = intervals.Select(r => r[1]).OrderBy(x => x).ToArray();
        int salas = 0, j = 0;
        for (int i = 0; i < inicios.Length; i++) {
            if (inicios[i] >= fins[j]) j++;
            else salas++;
        }
        return salas;
    }
}
```

## Go

```go
import (
	"container/heap"
	"sort"
)

type heapInt []int

func (h heapInt) Len() int            { return len(h) }
func (h heapInt) Less(i, j int) bool  { return h[i] < h[j] }
func (h heapInt) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *heapInt) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *heapInt) Pop() interface{} {
	velho := *h
	x := velho[len(velho)-1]
	*h = velho[:len(velho)-1]
	return x
}

func minMeetingRooms(intervals [][]int) int {
	ordenadas := make([][]int, len(intervals))
	copy(ordenadas, intervals)
	sort.Slice(ordenadas, func(i, j int) bool { return ordenadas[i][0] < ordenadas[j][0] })
	salas := &heapInt{}
	for _, r := range ordenadas {
		if salas.Len() > 0 && (*salas)[0] <= r[0] {
			heap.Pop(salas)
		}
		heap.Push(salas, r[1])
	}
	return salas.Len()
}
```
