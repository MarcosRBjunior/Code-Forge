## Ideia

O último delimitador aberto precisa ser o primeiro a fechar, e isso é exatamente o comportamento de uma pilha. Percorra a string: ao ver uma abertura, empilhe-a; ao ver um fechamento, o topo da pilha precisa ser a abertura correspondente, que então é removida.

No final, a string é válida somente se nenhuma verificação falhou e a pilha ficou vazia, sem aberturas sobrando.

## Complexidade

Tempo O(n), com uma passada. Espaço O(n) para a pilha no pior caso.

## Python

```python
def is_valid(s):
    par = {')': '(', ']': '[', '}': '{'}
    pilha = []
    for ch in s:
        if ch in par:
            if not pilha or pilha.pop() != par[ch]:
                return False
        else:
            pilha.append(ch)
    return not pilha
```

## JavaScript

```javascript
function isValid(s) {
  const par = { ')': '(', ']': '[', '}': '{' };
  const pilha = [];
  for (const ch of s) {
    if (ch in par) {
      if (pilha.pop() !== par[ch]) return false;
    } else {
      pilha.push(ch);
    }
  }
  return pilha.length === 0;
}
```

## TypeScript

```typescript
function isValid(s: string): boolean {
  const par: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const pilha: string[] = [];
  for (const ch of s) {
    if (ch in par) {
      if (pilha.pop() !== par[ch]) return false;
    } else {
      pilha.push(ch);
    }
  }
  return pilha.length === 0;
}
```

## Java

```java
class Solution {
    public boolean isValid(String s) {
        Deque<Character> pilha = new ArrayDeque<>();
        for (char ch : s.toCharArray()) {
            if (ch == '(' || ch == '[' || ch == '{') {
                pilha.push(ch);
            } else {
                if (pilha.isEmpty()) return false;
                char topo = pilha.pop();
                if ((ch == ')' && topo != '(') || (ch == ']' && topo != '[') || (ch == '}' && topo != '{')) {
                    return false;
                }
            }
        }
        return pilha.isEmpty();
    }
}
```

## C++

```cpp
class Solution {
public:
    bool isValid(string s) {
        stack<char> pilha;
        for (char ch : s) {
            if (ch == '(' || ch == '[' || ch == '{') {
                pilha.push(ch);
            } else {
                if (pilha.empty()) return false;
                char topo = pilha.top();
                pilha.pop();
                if ((ch == ')' && topo != '(') || (ch == ']' && topo != '[') || (ch == '}' && topo != '{')) {
                    return false;
                }
            }
        }
        return pilha.empty();
    }
};
```

## C#

```csharp
public class Solution {
    public bool IsValid(string s) {
        var pilha = new Stack<char>();
        foreach (char ch in s) {
            if (ch == '(' || ch == '[' || ch == '{') {
                pilha.Push(ch);
            } else {
                if (pilha.Count == 0) return false;
                char topo = pilha.Pop();
                if ((ch == ')' && topo != '(') || (ch == ']' && topo != '[') || (ch == '}' && topo != '{')) {
                    return false;
                }
            }
        }
        return pilha.Count == 0;
    }
}
```

## Go

```go
func isValid(s string) bool {
	par := map[rune]rune{')': '(', ']': '[', '}': '{'}
	pilha := []rune{}
	for _, ch := range s {
		if abre, ok := par[ch]; ok {
			if len(pilha) == 0 || pilha[len(pilha)-1] != abre {
				return false
			}
			pilha = pilha[:len(pilha)-1]
		} else {
			pilha = append(pilha, ch)
		}
	}
	return len(pilha) == 0
}
```
