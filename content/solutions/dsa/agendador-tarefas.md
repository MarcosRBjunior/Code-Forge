## Ideia

Só importa a tarefa mais frequente. Se ela aparece `m` vezes, ela cria `m - 1` blocos de tamanho `n + 1` (a tarefa mais `n` posições de resfriamento) e depois uma última execução. Para completar o último bloco, entram também todas as outras tarefas que empatam com a frequência máxima.

Assim, o tempo mínimo é `(m - 1) * (n + 1) + k`, onde `k` é a quantidade de tarefas com frequência `m`. As demais tarefas cabem nos espaços ociosos desses blocos. Se houver tarefas demais para caber, nunca haverá ociosidade e a resposta é simplesmente o número de tarefas, por isso o resultado é o maior entre a fórmula e `len(tasks)`.

## Complexidade

Tempo `O(T)` para contar as `T` tarefas, mais `O(26)` para achar o máximo. Espaço `O(1)`, pois há no máximo 26 letras.

## Python

```python
from collections import Counter


def least_interval(tasks, n):
    contagem = Counter(tasks)
    maxima = max(contagem.values())
    empatadas = sum(1 for c in contagem.values() if c == maxima)
    return max(len(tasks), (maxima - 1) * (n + 1) + empatadas)
```

## JavaScript

```javascript
function leastInterval(tasks, n) {
  const contagem = new Map();
  for (const t of tasks) contagem.set(t, (contagem.get(t) || 0) + 1);
  const maxima = Math.max(...contagem.values());
  let empatadas = 0;
  for (const c of contagem.values()) if (c === maxima) empatadas++;
  return Math.max(tasks.length, (maxima - 1) * (n + 1) + empatadas);
}
```

## TypeScript

```typescript
function leastInterval(tasks: string[], n: number): number {
  const contagem = new Map<string, number>();
  for (const t of tasks) contagem.set(t, (contagem.get(t) ?? 0) + 1);
  const maxima = Math.max(...contagem.values());
  let empatadas = 0;
  for (const c of contagem.values()) if (c === maxima) empatadas++;
  return Math.max(tasks.length, (maxima - 1) * (n + 1) + empatadas);
}
```

## Java

```java
class Solution {
    public int leastInterval(String[] tasks, int n) {
        Map<String, Integer> contagem = new HashMap<>();
        for (String t : tasks) contagem.merge(t, 1, Integer::sum);
        int maxima = 0;
        for (int c : contagem.values()) maxima = Math.max(maxima, c);
        int empatadas = 0;
        for (int c : contagem.values()) if (c == maxima) empatadas++;
        return Math.max(tasks.length, (maxima - 1) * (n + 1) + empatadas);
    }
}
```

## C++

```cpp
class Solution {
public:
    int leastInterval(vector<string>& tasks, int n) {
        unordered_map<string, int> contagem;
        for (const string& t : tasks) contagem[t]++;
        int maxima = 0;
        for (auto& par : contagem) maxima = max(maxima, par.second);
        int empatadas = 0;
        for (auto& par : contagem) if (par.second == maxima) empatadas++;
        return max((int)tasks.size(), (maxima - 1) * (n + 1) + empatadas);
    }
};
```

## C#

```csharp
public class Solution {
    public int LeastInterval(string[] tasks, int n) {
        var contagem = new Dictionary<string, int>();
        foreach (var t in tasks) {
            contagem[t] = contagem.GetValueOrDefault(t) + 1;
        }
        int maxima = contagem.Values.Max();
        int empatadas = contagem.Values.Count(c => c == maxima);
        return Math.Max(tasks.Length, (maxima - 1) * (n + 1) + empatadas);
    }
}
```

## Go

```go
func leastInterval(tasks []string, n int) int {
	contagem := map[string]int{}
	maxima := 0
	for _, t := range tasks {
		contagem[t]++
		if contagem[t] > maxima {
			maxima = contagem[t]
		}
	}
	empatadas := 0
	for _, c := range contagem {
		if c == maxima {
			empatadas++
		}
	}
	return max(len(tasks), (maxima-1)*(n+1)+empatadas)
}
```
