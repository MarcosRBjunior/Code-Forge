## Ideia

Quebre o caminho nas barras e use uma pilha de nomes de diretório. Pedaços vazios (barras repetidas) e `.` são ignorados. Um `..` desempilha o último diretório, se houver; na raiz ele não faz nada. Qualquer outro nome, inclusive `...`, é empilhado.

No fim, junte a pilha com `/` e coloque uma barra na frente. Se a pilha estiver vazia, o resultado é só a raiz.

## Complexidade

Tempo O(n) no tamanho do caminho. Espaço O(n) para a pilha.

## Python

```python
def simplify_path(path):
    pilha = []
    for parte in path.split("/"):
        if parte == "" or parte == ".":
            continue
        if parte == "..":
            if pilha:
                pilha.pop()
        else:
            pilha.append(parte)
    return "/" + "/".join(pilha)
```

## JavaScript

```javascript
function simplifyPath(path) {
  const pilha = [];
  for (const parte of path.split("/")) {
    if (parte === "" || parte === ".") continue;
    if (parte === "..") pilha.pop();
    else pilha.push(parte);
  }
  return "/" + pilha.join("/");
}
```

## TypeScript

```typescript
function simplifyPath(path: string): string {
  const pilha: string[] = [];
  for (const parte of path.split("/")) {
    if (parte === "" || parte === ".") continue;
    if (parte === "..") pilha.pop();
    else pilha.push(parte);
  }
  return "/" + pilha.join("/");
}
```

## Java

```java
class Solution {
    public String simplifyPath(String path) {
        Deque<String> pilha = new ArrayDeque<>();
        for (String parte : path.split("/")) {
            if (parte.isEmpty() || parte.equals(".")) continue;
            if (parte.equals("..")) {
                if (!pilha.isEmpty()) pilha.removeLast();
            } else {
                pilha.addLast(parte);
            }
        }
        return "/" + String.join("/", pilha);
    }
}
```

## C++

```cpp
class Solution {
public:
    string simplifyPath(string path) {
        vector<string> pilha;
        stringstream ss(path);
        string parte;
        while (getline(ss, parte, '/')) {
            if (parte.empty() || parte == ".") continue;
            if (parte == "..") {
                if (!pilha.empty()) pilha.pop_back();
            } else {
                pilha.push_back(parte);
            }
        }
        string resultado;
        for (auto& p : pilha) resultado += "/" + p;
        return resultado.empty() ? "/" : resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public string SimplifyPath(string path) {
        var pilha = new List<string>();
        foreach (var parte in path.Split('/')) {
            if (parte == "" || parte == ".") continue;
            if (parte == "..") {
                if (pilha.Count > 0) pilha.RemoveAt(pilha.Count - 1);
            } else {
                pilha.Add(parte);
            }
        }
        return "/" + string.Join("/", pilha);
    }
}
```

## Go

```go
import "strings"

func simplifyPath(path string) string {
	pilha := []string{}
	for _, parte := range strings.Split(path, "/") {
		if parte == "" || parte == "." {
			continue
		}
		if parte == ".." {
			if len(pilha) > 0 {
				pilha = pilha[:len(pilha)-1]
			}
		} else {
			pilha = append(pilha, parte)
		}
	}
	return "/" + strings.Join(pilha, "/")
}
```
