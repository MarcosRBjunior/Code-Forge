## Ideia

Trata-se de uma ordenação topológica pelo algoritmo de Kahn. Para cada curso, conte quantos pré-requisitos ainda estão pendentes e monte, para cada pré-requisito `b`, a lista dos cursos que dependem dele. Os cursos com contagem zero estão liberados.

Para respeitar o desempate pelo menor número, os cursos liberados ficam num min-heap. A cada passo retira-se o menor curso liberado, acrescenta-se à ordem e reduz-se a contagem de seus dependentes, liberando os que chegam a zero. Se no fim a ordem não contém todos os cursos, sobrou um ciclo e a resposta é a lista vazia.

## Complexidade

Tempo O((V + E) log V), com V cursos e E pré-requisitos. Espaço O(V + E).

## Python

```python
import heapq


def find_order(num_courses, prerequisites):
    pendentes = [0] * num_courses
    dependentes = [[] for _ in range(num_courses)]
    for a, b in prerequisites:
        pendentes[a] += 1
        dependentes[b].append(a)
    liberados = [c for c in range(num_courses) if pendentes[c] == 0]
    heapq.heapify(liberados)
    ordem = []
    while liberados:
        c = heapq.heappop(liberados)
        ordem.append(c)
        for d in dependentes[c]:
            pendentes[d] -= 1
            if pendentes[d] == 0:
                heapq.heappush(liberados, d)
    return ordem if len(ordem) == num_courses else []
```

## JavaScript

```javascript
function findOrder(numCourses, prerequisites) {
  const pendentes = new Array(numCourses).fill(0);
  const dependentes = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) {
    pendentes[a]++;
    dependentes[b].push(a);
  }

  const heap = [];
  const push = (x) => {
    heap.push(x);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) break;
      [heap[i], heap[p]] = [heap[p], heap[i]];
      i = p;
    }
  };
  const pop = () => {
    const topo = heap[0];
    const ultimo = heap.pop();
    if (heap.length > 0) {
      heap[0] = ultimo;
      let i = 0;
      for (;;) {
        let m = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < heap.length && heap[l] < heap[m]) m = l;
        if (r < heap.length && heap[r] < heap[m]) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return topo;
  };

  for (let c = 0; c < numCourses; c++) if (pendentes[c] === 0) push(c);
  const ordem = [];
  while (heap.length > 0) {
    const c = pop();
    ordem.push(c);
    for (const d of dependentes[c]) {
      if (--pendentes[d] === 0) push(d);
    }
  }
  return ordem.length === numCourses ? ordem : [];
}
```

## TypeScript

```typescript
function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const pendentes: number[] = new Array(numCourses).fill(0);
  const dependentes: number[][] = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) {
    pendentes[a]++;
    dependentes[b].push(a);
  }

  const heap: number[] = [];
  const push = (x: number): void => {
    heap.push(x);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) break;
      [heap[i], heap[p]] = [heap[p], heap[i]];
      i = p;
    }
  };
  const pop = (): number => {
    const topo = heap[0];
    const ultimo = heap.pop() as number;
    if (heap.length > 0) {
      heap[0] = ultimo;
      let i = 0;
      for (;;) {
        let m = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < heap.length && heap[l] < heap[m]) m = l;
        if (r < heap.length && heap[r] < heap[m]) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return topo;
  };

  for (let c = 0; c < numCourses; c++) if (pendentes[c] === 0) push(c);
  const ordem: number[] = [];
  while (heap.length > 0) {
    const c = pop();
    ordem.push(c);
    for (const d of dependentes[c]) {
      if (--pendentes[d] === 0) push(d);
    }
  }
  return ordem.length === numCourses ? ordem : [];
}
```

## Java

```java
class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {
        int[] pendentes = new int[numCourses];
        List<List<Integer>> dependentes = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) dependentes.add(new ArrayList<>());
        for (int[] p : prerequisites) {
            pendentes[p[0]]++;
            dependentes.get(p[1]).add(p[0]);
        }
        PriorityQueue<Integer> liberados = new PriorityQueue<>();
        for (int c = 0; c < numCourses; c++) if (pendentes[c] == 0) liberados.add(c);
        int[] ordem = new int[numCourses];
        int n = 0;
        while (!liberados.isEmpty()) {
            int c = liberados.poll();
            ordem[n++] = c;
            for (int d : dependentes.get(c)) {
                if (--pendentes[d] == 0) liberados.add(d);
            }
        }
        return n == numCourses ? ordem : new int[0];
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        vector<int> pendentes(numCourses, 0);
        vector<vector<int>> dependentes(numCourses);
        for (auto& p : prerequisites) {
            pendentes[p[0]]++;
            dependentes[p[1]].push_back(p[0]);
        }
        priority_queue<int, vector<int>, greater<int>> liberados;
        for (int c = 0; c < numCourses; c++)
            if (pendentes[c] == 0) liberados.push(c);
        vector<int> ordem;
        while (!liberados.empty()) {
            int c = liberados.top();
            liberados.pop();
            ordem.push_back(c);
            for (int d : dependentes[c])
                if (--pendentes[d] == 0) liberados.push(d);
        }
        if ((int)ordem.size() != numCourses) return {};
        return ordem;
    }
};
```

## C#

```csharp
public class Solution {
    public int[] FindOrder(int numCourses, int[][] prerequisites) {
        var pendentes = new int[numCourses];
        var dependentes = new List<int>[numCourses];
        for (int i = 0; i < numCourses; i++) dependentes[i] = new List<int>();
        foreach (var p in prerequisites) {
            pendentes[p[0]]++;
            dependentes[p[1]].Add(p[0]);
        }
        var liberados = new SortedSet<int>();
        for (int c = 0; c < numCourses; c++)
            if (pendentes[c] == 0) liberados.Add(c);
        var ordem = new List<int>();
        while (liberados.Count > 0) {
            int c = liberados.Min;
            liberados.Remove(c);
            ordem.Add(c);
            foreach (int d in dependentes[c]) {
                pendentes[d]--;
                if (pendentes[d] == 0) liberados.Add(d);
            }
        }
        return ordem.Count == numCourses ? ordem.ToArray() : new int[0];
    }
}
```

## Go

```go
import "container/heap"

type filaInt []int

func (h filaInt) Len() int            { return len(h) }
func (h filaInt) Less(a, b int) bool  { return h[a] < h[b] }
func (h filaInt) Swap(a, b int)       { h[a], h[b] = h[b], h[a] }
func (h *filaInt) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *filaInt) Pop() interface{} {
	velho := *h
	n := len(velho)
	x := velho[n-1]
	*h = velho[:n-1]
	return x
}

func findOrder(numCourses int, prerequisites [][]int) []int {
	pendentes := make([]int, numCourses)
	dependentes := make([][]int, numCourses)
	for _, p := range prerequisites {
		pendentes[p[0]]++
		dependentes[p[1]] = append(dependentes[p[1]], p[0])
	}
	liberados := &filaInt{}
	for c := 0; c < numCourses; c++ {
		if pendentes[c] == 0 {
			heap.Push(liberados, c)
		}
	}
	ordem := []int{}
	for liberados.Len() > 0 {
		c := heap.Pop(liberados).(int)
		ordem = append(ordem, c)
		for _, d := range dependentes[c] {
			pendentes[d]--
			if pendentes[d] == 0 {
				heap.Push(liberados, d)
			}
		}
	}
	if len(ordem) != numCourses {
		return []int{}
	}
	return ordem
}
```
