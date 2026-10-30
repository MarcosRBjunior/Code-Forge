## Ideia

Modele cada par `[a, b]` como uma aresta de `b` para `a` num grafo direcionado. Concluir todos os cursos só é possível se esse grafo não tiver ciclo. Para verificar, use a ordenação topológica de Kahn: calcule o grau de entrada de cada curso e comece pelos que não têm pré-requisitos.

Ao "concluir" um curso, reduza o grau dos cursos que dependem dele e enfileire os que chegarem a zero. Se todos os cursos forem processados, não havia ciclo; se sobrar algum, ele está preso em um ciclo de dependências.

## Complexidade

Tempo O(V + E), com `V` cursos e `E` pré-requisitos. Espaço O(V + E) para a lista de adjacência.

## Python

```python
from collections import deque

def can_finish(num_courses, prerequisites):
    adj = [[] for _ in range(num_courses)]
    grau = [0] * num_courses
    for a, b in prerequisites:
        adj[b].append(a)
        grau[a] += 1

    fila = deque(i for i in range(num_courses) if grau[i] == 0)
    feitos = 0
    while fila:
        curso = fila.popleft()
        feitos += 1
        for prox in adj[curso]:
            grau[prox] -= 1
            if grau[prox] == 0:
                fila.append(prox)
    return feitos == num_courses
```

## JavaScript

```javascript
function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const grau = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    grau[a]++;
  }

  const fila = [];
  for (let i = 0; i < numCourses; i++) if (grau[i] === 0) fila.push(i);
  let feitos = 0;
  for (let k = 0; k < fila.length; k++) {
    feitos++;
    for (const prox of adj[fila[k]]) {
      if (--grau[prox] === 0) fila.push(prox);
    }
  }
  return feitos === numCourses;
}
```

## TypeScript

```typescript
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  const grau: number[] = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    grau[a]++;
  }

  const fila: number[] = [];
  for (let i = 0; i < numCourses; i++) if (grau[i] === 0) fila.push(i);
  let feitos = 0;
  for (let k = 0; k < fila.length; k++) {
    feitos++;
    for (const prox of adj[fila[k]]) {
      if (--grau[prox] === 0) fila.push(prox);
    }
  }
  return feitos === numCourses;
}
```

## Java

```java
class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] grau = new int[numCourses];
        for (int[] p : prerequisites) {
            adj.get(p[1]).add(p[0]);
            grau[p[0]]++;
        }

        Deque<Integer> fila = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++) if (grau[i] == 0) fila.add(i);
        int feitos = 0;
        while (!fila.isEmpty()) {
            int curso = fila.poll();
            feitos++;
            for (int prox : adj.get(curso)) {
                if (--grau[prox] == 0) fila.add(prox);
            }
        }
        return feitos == numCourses;
    }
}
```

## C++

```cpp
class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> grau(numCourses, 0);
        for (auto& p : prerequisites) {
            adj[p[1]].push_back(p[0]);
            grau[p[0]]++;
        }

        queue<int> fila;
        for (int i = 0; i < numCourses; i++) if (grau[i] == 0) fila.push(i);
        int feitos = 0;
        while (!fila.empty()) {
            int curso = fila.front();
            fila.pop();
            feitos++;
            for (int prox : adj[curso]) {
                if (--grau[prox] == 0) fila.push(prox);
            }
        }
        return feitos == numCourses;
    }
};
```

## C#

```csharp
public class Solution {
    public bool CanFinish(int numCourses, int[][] prerequisites) {
        var adj = new List<int>[numCourses];
        for (int i = 0; i < numCourses; i++) adj[i] = new List<int>();
        var grau = new int[numCourses];
        foreach (var p in prerequisites) {
            adj[p[1]].Add(p[0]);
            grau[p[0]]++;
        }

        var fila = new Queue<int>();
        for (int i = 0; i < numCourses; i++) if (grau[i] == 0) fila.Enqueue(i);
        int feitos = 0;
        while (fila.Count > 0) {
            int curso = fila.Dequeue();
            feitos++;
            foreach (int prox in adj[curso]) {
                if (--grau[prox] == 0) fila.Enqueue(prox);
            }
        }
        return feitos == numCourses;
    }
}
```

## Go

```go
func canFinish(numCourses int, prerequisites [][]int) bool {
	adj := make([][]int, numCourses)
	grau := make([]int, numCourses)
	for _, p := range prerequisites {
		adj[p[1]] = append(adj[p[1]], p[0])
		grau[p[0]]++
	}

	fila := []int{}
	for i := 0; i < numCourses; i++ {
		if grau[i] == 0 {
			fila = append(fila, i)
		}
	}
	for k := 0; k < len(fila); k++ {
		for _, prox := range adj[fila[k]] {
			grau[prox]--
			if grau[prox] == 0 {
				fila = append(fila, prox)
			}
		}
	}
	return len(fila) == numCourses
}
```
