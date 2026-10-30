## Ideia

Procurar cada palavra separadamente repetiria muito trabalho. Em vez disso, monte uma trie com todas as palavras e faça uma única busca em profundidade a partir de cada célula, descendo na trie junto com o caminho na grade.

Se a letra da célula não é filha do nó atual da trie, o caminho é podado na hora, pois nenhuma palavra começa assim. Quando o nó atual guarda uma palavra completa, ela é adicionada ao resultado e a marca é removida do nó, para que não seja reportada duas vezes. A célula visitada é marcada temporariamente com `#` e restaurada na volta, o que impede reusar a mesma célula na mesma palavra.

## Complexidade

Tempo `O(L * C * 4 * 3^(k-1))` no pior caso, com `k` o tamanho máximo das palavras, mas a poda pela trie costuma reduzir muito. Espaço proporcional ao total de letras das palavras, para a trie.

## Python

```python
def find_words(board, words):
    raiz = {}
    for palavra in words:
        no = raiz
        for letra in palavra:
            no = no.setdefault(letra, {})
        no["$"] = palavra

    linhas, colunas = len(board), len(board[0])
    achadas = []

    def dfs(i, j, no):
        letra = board[i][j]
        if letra not in no:
            return
        proximo = no[letra]
        if "$" in proximo:
            achadas.append(proximo.pop("$"))
        board[i][j] = "#"
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < linhas and 0 <= nj < colunas and board[ni][nj] != "#":
                dfs(ni, nj, proximo)
        board[i][j] = letra

    for i in range(linhas):
        for j in range(colunas):
            dfs(i, j, raiz)
    return achadas
```

## JavaScript

```javascript
function findWords(board, words) {
  const raiz = {};
  for (const palavra of words) {
    let no = raiz;
    for (const letra of palavra) {
      if (!no[letra]) no[letra] = {};
      no = no[letra];
    }
    no.palavra = palavra;
  }

  const linhas = board.length;
  const colunas = board[0].length;
  const achadas = [];
  const direcoes = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  const dfs = (i, j, no) => {
    const letra = board[i][j];
    const proximo = no[letra];
    if (!proximo) return;
    if (proximo.palavra !== undefined) {
      achadas.push(proximo.palavra);
      delete proximo.palavra;
    }
    board[i][j] = "#";
    for (const [di, dj] of direcoes) {
      const ni = i + di;
      const nj = j + dj;
      if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && board[ni][nj] !== "#") {
        dfs(ni, nj, proximo);
      }
    }
    board[i][j] = letra;
  };

  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) dfs(i, j, raiz);
  }
  return achadas;
}
```

## TypeScript

```typescript
interface NoTrie {
  filhos: Map<string, NoTrie>;
  palavra: string | null;
}

function findWords(board: string[][], words: string[]): string[] {
  const raiz: NoTrie = { filhos: new Map(), palavra: null };
  for (const palavra of words) {
    let no = raiz;
    for (const letra of palavra) {
      if (!no.filhos.has(letra)) no.filhos.set(letra, { filhos: new Map(), palavra: null });
      no = no.filhos.get(letra)!;
    }
    no.palavra = palavra;
  }

  const linhas = board.length;
  const colunas = board[0].length;
  const achadas: string[] = [];
  const direcoes: number[][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  const dfs = (i: number, j: number, no: NoTrie): void => {
    const letra = board[i][j];
    const proximo = no.filhos.get(letra);
    if (!proximo) return;
    if (proximo.palavra !== null) {
      achadas.push(proximo.palavra);
      proximo.palavra = null;
    }
    board[i][j] = "#";
    for (const [di, dj] of direcoes) {
      const ni = i + di;
      const nj = j + dj;
      if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && board[ni][nj] !== "#") {
        dfs(ni, nj, proximo);
      }
    }
    board[i][j] = letra;
  };

  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) dfs(i, j, raiz);
  }
  return achadas;
}
```

## Java

```java
class Solution {
    static class No {
        Map<String, No> filhos = new HashMap<>();
        String palavra = null;
    }

    private String[][] board;
    private int linhas, colunas;
    private List<String> achadas = new ArrayList<>();

    public String[] findWords(String[][] board, String[] words) {
        this.board = board;
        linhas = board.length;
        colunas = board[0].length;
        No raiz = new No();
        for (String palavra : words) {
            No no = raiz;
            for (char c : palavra.toCharArray()) {
                no = no.filhos.computeIfAbsent(String.valueOf(c), k -> new No());
            }
            no.palavra = palavra;
        }
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) dfs(i, j, raiz);
        }
        return achadas.toArray(new String[0]);
    }

    private void dfs(int i, int j, No no) {
        String letra = board[i][j];
        No proximo = no.filhos.get(letra);
        if (proximo == null) return;
        if (proximo.palavra != null) {
            achadas.add(proximo.palavra);
            proximo.palavra = null;
        }
        board[i][j] = "#";
        int[] di = {1, -1, 0, 0};
        int[] dj = {0, 0, 1, -1};
        for (int k = 0; k < 4; k++) {
            int ni = i + di[k], nj = j + dj[k];
            if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && !board[ni][nj].equals("#")) {
                dfs(ni, nj, proximo);
            }
        }
        board[i][j] = letra;
    }
}
```

## C++

```cpp
class Solution {
    struct No {
        unordered_map<string, No*> filhos;
        string palavra;
        bool tem = false;
    };

    vector<vector<string>>* board;
    int linhas, colunas;
    vector<string> achadas;

    void dfs(int i, int j, No* no) {
        string letra = (*board)[i][j];
        auto it = no->filhos.find(letra);
        if (it == no->filhos.end()) return;
        No* proximo = it->second;
        if (proximo->tem) {
            achadas.push_back(proximo->palavra);
            proximo->tem = false;
        }
        (*board)[i][j] = "#";
        int di[] = {1, -1, 0, 0};
        int dj[] = {0, 0, 1, -1};
        for (int k = 0; k < 4; k++) {
            int ni = i + di[k], nj = j + dj[k];
            if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && (*board)[ni][nj] != "#") {
                dfs(ni, nj, proximo);
            }
        }
        (*board)[i][j] = letra;
    }

public:
    vector<string> findWords(vector<vector<string>>& tabuleiro, vector<string>& words) {
        board = &tabuleiro;
        linhas = tabuleiro.size();
        colunas = tabuleiro[0].size();
        achadas.clear();
        No* raiz = new No();
        for (const string& palavra : words) {
            No* no = raiz;
            for (char c : palavra) {
                string chave(1, c);
                if (!no->filhos.count(chave)) no->filhos[chave] = new No();
                no = no->filhos[chave];
            }
            no->palavra = palavra;
            no->tem = true;
        }
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) dfs(i, j, raiz);
        }
        return achadas;
    }
};
```

## C#

```csharp
public class Solution {
    private class No {
        public Dictionary<string, No> Filhos = new Dictionary<string, No>();
        public string Palavra = null;
    }

    private string[][] board;
    private int linhas, colunas;
    private List<string> achadas = new List<string>();

    public string[] FindWords(string[][] board, string[] words) {
        this.board = board;
        linhas = board.Length;
        colunas = board[0].Length;
        var raiz = new No();
        foreach (var palavra in words) {
            var no = raiz;
            foreach (char c in palavra) {
                string chave = c.ToString();
                if (!no.Filhos.ContainsKey(chave)) no.Filhos[chave] = new No();
                no = no.Filhos[chave];
            }
            no.Palavra = palavra;
        }
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) Dfs(i, j, raiz);
        }
        return achadas.ToArray();
    }

    private void Dfs(int i, int j, No no) {
        string letra = board[i][j];
        if (!no.Filhos.TryGetValue(letra, out No proximo)) return;
        if (proximo.Palavra != null) {
            achadas.Add(proximo.Palavra);
            proximo.Palavra = null;
        }
        board[i][j] = "#";
        int[] di = {1, -1, 0, 0};
        int[] dj = {0, 0, 1, -1};
        for (int k = 0; k < 4; k++) {
            int ni = i + di[k], nj = j + dj[k];
            if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && board[ni][nj] != "#") {
                Dfs(ni, nj, proximo);
            }
        }
        board[i][j] = letra;
    }
}
```

## Go

```go
type noTrie struct {
	filhos  map[byte]*noTrie
	palavra string
	tem     bool
}

func findWords(board [][]string, words []string) []string {
	raiz := &noTrie{filhos: map[byte]*noTrie{}}
	for _, palavra := range words {
		no := raiz
		for i := 0; i < len(palavra); i++ {
			c := palavra[i]
			if no.filhos[c] == nil {
				no.filhos[c] = &noTrie{filhos: map[byte]*noTrie{}}
			}
			no = no.filhos[c]
		}
		no.palavra = palavra
		no.tem = true
	}

	linhas, colunas := len(board), len(board[0])
	achadas := []string{}
	di := []int{1, -1, 0, 0}
	dj := []int{0, 0, 1, -1}

	var dfs func(i, j int, no *noTrie)
	dfs = func(i, j int, no *noTrie) {
		letra := board[i][j]
		proximo := no.filhos[letra[0]]
		if proximo == nil {
			return
		}
		if proximo.tem {
			achadas = append(achadas, proximo.palavra)
			proximo.tem = false
		}
		board[i][j] = "#"
		for k := 0; k < 4; k++ {
			ni, nj := i+di[k], j+dj[k]
			if ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && board[ni][nj] != "#" {
				dfs(ni, nj, proximo)
			}
		}
		board[i][j] = letra
	}

	for i := 0; i < linhas; i++ {
		for j := 0; j < colunas; j++ {
			dfs(i, j, raiz)
		}
	}
	return achadas
}
```
