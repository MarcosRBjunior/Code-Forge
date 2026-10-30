## Ideia

Na pré-ordem com marcadores `#` para filhos ausentes, a sequência de tokens descreve a árvore sem ambiguidade: ler um valor significa criar o nó, e em seguida a própria sequência traz, na ordem, toda a subárvore esquerda e depois toda a direita. Um `#` encerra o ramo atual.

Por isso `deserialize` é recursiva e consome os tokens com um índice compartilhado: lê o token, devolve vazio se for `#`, ou cria o nó e chama a si mesma para a esquerda e para a direita. `serialize` faz o caminho inverso, escrevendo a raiz, depois a esquerda, depois a direita.

## Complexidade

Tempo O(n) em ambas as funções, pois cada nó e cada marcador são processados uma vez. Espaço O(n) para os tokens e O(h) de pilha de recursão, com `h` a altura da árvore.

## Python

```python
def serialize(root):
    partes = []

    def visitar(no):
        if no is None:
            partes.append("#")
            return
        partes.append(str(no.val))
        visitar(no.left)
        visitar(no.right)

    visitar(root)
    return ",".join(partes)


def deserialize(data):
    tokens = data.split(",")
    pos = 0

    def construir():
        nonlocal pos
        token = tokens[pos]
        pos += 1
        if token == "#":
            return None
        no = TreeNode(int(token))
        no.left = construir()
        no.right = construir()
        return no

    return construir()
```

## JavaScript

```javascript
function serialize(root) {
  const partes = [];
  const visitar = (no) => {
    if (!no) {
      partes.push("#");
      return;
    }
    partes.push(String(no.val));
    visitar(no.left);
    visitar(no.right);
  };
  visitar(root);
  return partes.join(",");
}

function deserialize(data) {
  const tokens = data.split(",");
  let pos = 0;
  const construir = () => {
    const token = tokens[pos++];
    if (token === "#") return null;
    const no = new TreeNode(parseInt(token, 10));
    no.left = construir();
    no.right = construir();
    return no;
  };
  return construir();
}
```

## TypeScript

```typescript
function serialize(root) {
  const partes: string[] = [];
  const visitar = (no) => {
    if (!no) {
      partes.push("#");
      return;
    }
    partes.push(String(no.val));
    visitar(no.left);
    visitar(no.right);
  };
  visitar(root);
  return partes.join(",");
}

function deserialize(data) {
  const tokens: string[] = data.split(",");
  let pos = 0;
  const construir = () => {
    const token = tokens[pos++];
    if (token === "#") return null;
    const no = new TreeNode(parseInt(token, 10));
    no.left = construir();
    no.right = construir();
    return no;
  };
  return construir();
}
```
