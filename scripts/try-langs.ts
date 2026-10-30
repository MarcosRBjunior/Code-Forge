// Prova manual do executor remoto: roda soluções de referência em Java, C++, C# e Go via Judge0.
import { readFileSync } from "node:fs";
import matter from "gray-matter";
import { buildProgram, parseOutput } from "../src/lib/harness";
import { runOnJudge0 } from "../src/lib/judge0";
import { allStarters, inferSignature, type Lang, type ProblemShape } from "../src/lib/langs";

const SOL: Record<string, Partial<Record<Lang, string>>> = {
  "two-sum": {
    java: `class Solution { public int[] twoSum(int[] nums, int target) { Map<Integer,Integer> m = new HashMap<>(); for (int i = 0; i < nums.length; i++) { Integer j = m.get(target - nums[i]); if (j != null) return new int[]{j, i}; m.put(nums[i], i); } return null; } }`,
    cpp: `class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { unordered_map<int,int> m; for (int i = 0; i < (int)nums.size(); i++) { auto it = m.find(target - nums[i]); if (it != m.end()) return {it->second, i}; m[nums[i]] = i; } return {}; } };`,
    csharp: `public class Solution { public int[] TwoSum(int[] nums, int target) { var m = new Dictionary<int,int>(); for (int i = 0; i < nums.Length; i++) { if (m.ContainsKey(target - nums[i])) return new int[]{m[target - nums[i]], i}; m[nums[i]] = i; } return null; } }`,
    go: `func twoSum(nums []int, target int) []int { m := map[int]int{}; for i, v := range nums { if j, ok := m[target-v]; ok { return []int{j, i} }; m[v] = i }; return nil }`,
  },
  "move-zeroes": {
    java: `class Solution { public void moveZeroes(int[] nums) { int k = 0; for (int x : nums) if (x != 0) nums[k++] = x; while (k < nums.length) nums[k++] = 0; } }`,
    cpp: `class Solution { public: void moveZeroes(vector<int>& nums) { int k = 0; for (int x : nums) if (x != 0) nums[k++] = x; while (k < (int)nums.size()) nums[k++] = 0; } };`,
    csharp: `public class Solution { public void MoveZeroes(int[] nums) { int k = 0; foreach (var x in nums) if (x != 0) nums[k++] = x; while (k < nums.Length) nums[k++] = 0; } }`,
    go: `func moveZeroes(nums []int) { k := 0; for _, x := range nums { if x != 0 { nums[k] = x; k++ } }; for ; k < len(nums); k++ { nums[k] = 0 } }`,
  },
  "parenteses-validos": {
    java: `class Solution { public boolean isValid(String s) { Deque<Character> st = new ArrayDeque<>(); for (char c : s.toCharArray()) { if ("([{".indexOf(c) >= 0) st.push(c); else { if (st.isEmpty()) return false; char o = st.pop(); if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false; } } return st.isEmpty(); } }`,
    cpp: `class Solution { public: bool isValid(string s) { vector<char> st; for (char c : s) { if (c=='('||c=='['||c=='{') st.push_back(c); else { if (st.empty()) return false; char o = st.back(); st.pop_back(); if ((c==')'&&o!='(')||(c==']'&&o!='[')||(c=='}'&&o!='{')) return false; } } return st.empty(); } };`,
    csharp: `public class Solution { public bool IsValid(string s) { var st = new Stack<char>(); foreach (char c in s) { if (c=='('||c=='['||c=='{') st.Push(c); else { if (st.Count==0) return false; char o = st.Pop(); if ((c==')'&&o!='(')||(c==']'&&o!='[')||(c=='}'&&o!='{')) return false; } } return st.Count==0; } }`,
    go: `func isValid(s string) bool { st := []rune{}; for _, c := range s { if c=='('||c=='['||c=='{' { st = append(st, c) } else { if len(st)==0 { return false }; o := st[len(st)-1]; st = st[:len(st)-1]; if (c==')'&&o!='(')||(c==']'&&o!='[')||(c=='}'&&o!='{') { return false } } }; return len(st)==0 }`,
  },
  subconjuntos: {
    java: `class Solution { public int[][] subsets(int[] nums) { int n = nums.length; int[][] r = new int[1 << n][]; for (int m = 0; m < (1 << n); m++) { List<Integer> l = new ArrayList<>(); for (int i = 0; i < n; i++) if ((m >> i & 1) == 1) l.add(nums[i]); r[m] = l.stream().mapToInt(x -> x).toArray(); } return r; } }`,
    cpp: `class Solution { public: vector<vector<int>> subsets(vector<int>& nums) { int n = nums.size(); vector<vector<int>> r; for (int m = 0; m < (1 << n); m++) { vector<int> l; for (int i = 0; i < n; i++) if (m >> i & 1) l.push_back(nums[i]); r.push_back(l); } return r; } };`,
    csharp: `public class Solution { public int[][] Subsets(int[] nums) { int n = nums.Length; var r = new List<int[]>(); for (int m = 0; m < (1 << n); m++) { var l = new List<int>(); for (int i = 0; i < n; i++) if ((m >> i & 1) == 1) l.Add(nums[i]); r.Add(l.ToArray()); } return r.ToArray(); } }`,
    go: `func subsets(nums []int) [][]int { n := len(nums); r := [][]int{}; for m := 0; m < 1<<n; m++ { l := []int{}; for i := 0; i < n; i++ { if m>>i&1 == 1 { l = append(l, nums[i]) } }; r = append(r, l) }; return r }`,
  },
};
const FILE: Record<string, string> = { subconjuntos: "subconjuntos" };

const norm = (v: unknown, deep: boolean): unknown =>
  Array.isArray(v) ? v.map((x) => (deep ? norm(x, deep) : x)).sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1)) : v;

async function main() {
  let failed = 0;
  for (const [slug, sols] of Object.entries(SOL)) {
    const fm = matter(readFileSync(`content/courses/dsa/${FILE[slug] ?? slug}.mdx`, "utf8")).data as ProblemShape & { compare?: string };
    const sig = inferSignature(fm)!;
    const starters = allStarters(fm);
    console.log(`\n== ${slug}  (${Object.keys(starters).length} linguagens com código inicial)`);
    for (const lang of ["java", "cpp", "csharp", "go"] as const) {
      // 1) o código inicial tem que compilar (testes falham, mas sem erro de compilação)
      const s0 = await runOnJudge0(lang, buildProgram(lang, starters[lang]!, fm, sig));
      const starterOk = s0.status.id !== 6;
      // 2) a solução de referência tem que passar em tudo
      const res = await runOnJudge0(lang, buildProgram(lang, sols[lang]!, fm, sig));
      if (res.status.id === 6) { console.log(`  ${lang}: ERRO DE COMPILAÇÃO\n${res.compile_output}`); failed++; continue; }
      const parsed = parseOutput(res.stdout ?? "", fm.tests.length);
      const deep = fm.compare === "unordered-deep";
      const oks = fm.tests.map((t, i) => {
        const p = parsed[i];
        if (!p || p.kind !== "ok") return false;
        const a = JSON.parse(p.text);
        return fm.compare && fm.compare !== "exact" ? JSON.stringify(norm(a, deep)) === JSON.stringify(norm(t.expected, deep)) : JSON.stringify(a) === JSON.stringify(t.expected);
      });
      const pass = oks.filter(Boolean).length;
      console.log(`  ${lang}: ${pass}/${oks.length} testes  | inicial compila: ${starterOk ? "sim" : "NÃO"}${pass < oks.length ? `\n    stdout: ${(res.stdout ?? "").slice(0, 300)}\n    stderr: ${(res.stderr ?? "").slice(0, 300)}` : ""}`);
      if (pass < oks.length || !starterOk) failed++;
    }
  }
  console.log(failed ? `\n${failed} combinações com problema` : "\ntudo certo");
  process.exit(failed ? 1 : 0);
}
main();
