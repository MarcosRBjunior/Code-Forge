## Ideia

Na notação pós-fixa, quando um operador aparece, seus dois operandos são justamente os dois últimos valores já calculados. Uma pilha modela isso: números são empilhados, e cada operador desempilha dois valores, aplica a operação e empilha o resultado. No fim sobra um único valor na pilha, que é a resposta.

Cuidado com a ordem: o segundo valor desempilhado é o operando da esquerda. A divisão deve truncar em direção a zero, o que exige tratamento explícito em Python e JavaScript, onde o operador comum arredonda para baixo ou produz fração.

## Complexidade

Tempo O(n), um passo por token. Espaço O(n) para a pilha.

## Python

```python
def eval_rpn(tokens):
    pilha = []
    for token in tokens:
        if token in ("+", "-", "*", "/"):
            b = pilha.pop()
            a = pilha.pop()
            if token == "+":
                pilha.append(a + b)
            elif token == "-":
                pilha.append(a - b)
            elif token == "*":
                pilha.append(a * b)
            else:
                pilha.append(int(a / b))
        else:
            pilha.append(int(token))
    return pilha[0]
```

## JavaScript

```javascript
function evalRPN(tokens) {
  const pilha = [];
  for (const token of tokens) {
    if (["+", "-", "*", "/"].includes(token)) {
      const b = pilha.pop();
      const a = pilha.pop();
      if (token === "+") pilha.push(a + b);
      else if (token === "-") pilha.push(a - b);
      else if (token === "*") pilha.push(a * b);
      else pilha.push(Math.trunc(a / b));
    } else {
      pilha.push(Number(token));
    }
  }
  return pilha[0];
}
```

## TypeScript

```typescript
function evalRPN(tokens: string[]): number {
  const pilha: number[] = [];
  for (const token of tokens) {
    if (["+", "-", "*", "/"].includes(token)) {
      const b = pilha.pop() as number;
      const a = pilha.pop() as number;
      if (token === "+") pilha.push(a + b);
      else if (token === "-") pilha.push(a - b);
      else if (token === "*") pilha.push(a * b);
      else pilha.push(Math.trunc(a / b));
    } else {
      pilha.push(Number(token));
    }
  }
  return pilha[0];
}
```

## Java

```java
class Solution {
    public int evalRPN(String[] tokens) {
        Deque<Integer> pilha = new ArrayDeque<>();
        for (String token : tokens) {
            switch (token) {
                case "+": pilha.push(pilha.pop() + pilha.pop()); break;
                case "*": pilha.push(pilha.pop() * pilha.pop()); break;
                case "-": { int b = pilha.pop(), a = pilha.pop(); pilha.push(a - b); break; }
                case "/": { int b = pilha.pop(), a = pilha.pop(); pilha.push(a / b); break; }
                default: pilha.push(Integer.parseInt(token));
            }
        }
        return pilha.pop();
    }
}
```

## C++

```cpp
class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        vector<int> pilha;
        for (const string& token : tokens) {
            if (token == "+" || token == "-" || token == "*" || token == "/") {
                int b = pilha.back(); pilha.pop_back();
                int a = pilha.back(); pilha.pop_back();
                if (token == "+") pilha.push_back(a + b);
                else if (token == "-") pilha.push_back(a - b);
                else if (token == "*") pilha.push_back(a * b);
                else pilha.push_back(a / b);
            } else {
                pilha.push_back(stoi(token));
            }
        }
        return pilha.back();
    }
};
```

## C#

```csharp
public class Solution {
    public int EvalRPN(string[] tokens) {
        var pilha = new Stack<int>();
        foreach (var token in tokens) {
            if (token == "+" || token == "-" || token == "*" || token == "/") {
                int b = pilha.Pop();
                int a = pilha.Pop();
                if (token == "+") pilha.Push(a + b);
                else if (token == "-") pilha.Push(a - b);
                else if (token == "*") pilha.Push(a * b);
                else pilha.Push(a / b);
            } else {
                pilha.Push(int.Parse(token));
            }
        }
        return pilha.Pop();
    }
}
```

## Go

```go
import "strconv"

func evalRPN(tokens []string) int {
	pilha := []int{}
	for _, token := range tokens {
		switch token {
		case "+", "-", "*", "/":
			b := pilha[len(pilha)-1]
			a := pilha[len(pilha)-2]
			pilha = pilha[:len(pilha)-2]
			var r int
			switch token {
			case "+":
				r = a + b
			case "-":
				r = a - b
			case "*":
				r = a * b
			default:
				r = a / b
			}
			pilha = append(pilha, r)
		default:
			n, _ := strconv.Atoi(token)
			pilha = append(pilha, n)
		}
	}
	return pilha[0]
}
```
