import { convertPythonToGeneralAst } from "../";

const version = "3.10.4";

// Every snippet is valid Python. The converter must produce an AST for all of
// them; a throw is a finding.
const corpus: [string, string][] = [
  // conditionals (regression for the CRT-457 fix)
  ["bare if", "if x > 3:\n    y = 1\n"],
  ["if/elif no else", "if x > 3:\n    y = 1\nelif x > 2:\n    y = 2\n"],
  // try variants
  ["try/bare except", "try:\n    x = 1\nexcept:\n    pass\n"],
  ["try/except type", "try:\n    x = 1\nexcept ValueError:\n    pass\n"],
  ["try/except as", "try:\n    x = 1\nexcept ValueError as e:\n    pass\n"],
  ["try/finally only", "try:\n    x = 1\nfinally:\n    pass\n"],
  [
    "try/except/else",
    "try:\n    x = 1\nexcept ValueError:\n    pass\nelse:\n    y = 2\n",
  ],
  [
    "try/except/else/finally",
    "try:\n    x = 1\nexcept ValueError:\n    pass\nelse:\n    y = 2\nfinally:\n    z = 3\n",
  ],
  // loops
  ["for without else", "for i in range(3):\n    x = i\n"],
  ["for with else", "for i in range(3):\n    x = i\nelse:\n    y = 1\n"],
  ["while without else", "while False:\n    x = 1\n"],
  ["for with break", "for i in range(3):\n    break\n"],
  ["for with continue", "for i in range(3):\n    continue\n"],
  // with
  ["with as", 'with open("f") as f:\n    x = 1\n'],
  ["with without as", "with lock:\n    x = 1\n"],
  ["with two items", "with a as x, b as y:\n    pass\n"],
  ["with item no as mixed", "with a, b as y:\n    pass\n"],
  // return / raise / yield
  ["bare return", "def f():\n    return\n"],
  ["return value", "def f():\n    return 1\n"],
  ["return tuple", "def f():\n    return 1, 2\n"],
  ["bare raise", "def f():\n    raise\n"],
  ["raise exc", "def f():\n    raise ValueError()\n"],
  ["raise from", "def f():\n    raise ValueError() from None\n"],
  ["bare yield", "def f():\n    yield\n"],
  ["yield value", "def f():\n    yield 1\n"],
  ["yield from", "def f():\n    yield from range(3)\n"],
  // functions
  ["lambda no params", "f = lambda: 1\n"],
  ["lambda default", "f = lambda x=1: x\n"],
  ["def star args", "def f(*args, **kwargs):\n    pass\n"],
  ["def pos-only slash", "def f(x, /, y):\n    pass\n"],
  ["def kw-only star", "def f(x, *, y):\n    pass\n"],
  [
    "def annotations",
    'def f(x: int, y: str = "a") -> bool:\n    return True\n',
  ],
  ["def default value", "def f(x=1):\n    pass\n"],
  ["decorator bare", "@staticmethod\ndef f():\n    pass\n"],
  ["decorator call", "@decorator(1)\ndef f():\n    pass\n"],
  ["nested def", "def f():\n    def g():\n        pass\n    return g\n"],
  // classes
  ["class no bases", "class C:\n    pass\n"],
  ["class empty parens", "class C():\n    pass\n"],
  ["class base", "class C(B):\n    pass\n"],
  ["class metaclass kwarg", "class C(B, metaclass=M):\n    pass\n"],
  // slices and subscripts
  ["slice full open", "y = a[:]\n"],
  ["slice full open with step colon", "y = a[::]\n"],
  ["slice start", "y = a[1:]\n"],
  ["slice stop", "y = a[:2]\n"],
  ["slice step only", "y = a[::2]\n"],
  ["slice negative step", "y = a[::-1]\n"],
  ["slice all three", "y = a[1:2:3]\n"],
  ["subscript tuple", "y = a[1, 2]\n"],
  // simple statements
  ["assert bare", "assert x\n"],
  ["assert message", 'assert x, "boom"\n'],
  ["del single", "del x\n"],
  ["del multiple", "del x, y\n"],
  ["global", "def f():\n    global x\n    x = 1\n"],
  [
    "nonlocal",
    "def f():\n    x = 1\n    def g():\n        nonlocal x\n        x = 2\n    return g\n",
  ],
  ["pass", "pass\n"],
  ["ellipsis", "x = ...\n"],
  // imports
  ["import", "import os\n"],
  ["import as", "import os as o\n"],
  ["from import", "from os import path\n"],
  ["from import as", "from os import path as p\n"],
  ["from import star", "from os import *\n"],
  ["relative import", "from . import sibling\n"],
  // assignments
  ["chained assign", "a = b = 1\n"],
  ["augmented", "x += 1\n"],
  ["star unpack", "a, *b = [1, 2, 3]\n"],
  ["annotated with value", "x: int = 1\n"],
  ["annotated no value", "x: int\n"],
  ["walrus", "if (n := 10) > 5:\n    y = n\n"],
  ["tuple no parens", "x = 1, 2\n"],
  // expressions
  ["ternary", "y = a if c else b\n"],
  ["chained comparison", "y = 1 < x < 10\n"],
  ["unary ops", "y = -x + +x - ~x\n"],
  ["not/and/or", "y = not a and b or c\n"],
  ["is/in", "y = a is not None and b not in c\n"],
  ["arith ops", "y = a ** 2 // 3 % 4 * 5 / 6\n"],
  ["bitwise ops", "y = a & b | c ^ d << 2 >> 1\n"],
  ["matmul", "y = a @ b\n"],
  ["call kwargs", "f(1, x=2, *args, **kw)\n"],
  ["call kwarg only", "f(x=2)\n"],
  ["call star only", "f(*args)\n"],
  ["call doublestar only", "f(**kw)\n"],
  ["call kwarg then star", "f(x=2, *args)\n"],
  ["call kwarg then doublestar", "f(x=2, **kw)\n"],
  ["call star then kwarg", "f(*args, x=2)\n"],
  ["call star then doublestar", "f(*args, **kw)\n"],
  ["call pos then kwarg", "f(1, x=2)\n"],
  ["attribute chain", "y = a.b.c.d\n"],
  ["fstring simple", 'y = f"{x}"\n'],
  ["fstring format spec", 'y = f"{x!r:>10}"\n'],
  ["implicit concat", 'y = "a" "b"\n'],
  ["bytes", 'y = b"abc"\n'],
  ["numbers", "y = 1_000 + 0x1F + 1e-3 + 1j\n"],
  ["empty collections", "a = []\nb = {}\nc = ()\nd = set()\n"],
  ["list comp", "y = [i for i in range(3)]\n"],
  ["list comp if", "y = [i for i in range(3) if i > 1]\n"],
  ["dict comp", "y = {k: v for k, v in items}\n"],
  ["set comp", "y = {i for i in range(3)}\n"],
  ["genexp in call", "y = sum(i for i in range(3))\n"],
  ["nested comp", "y = [[j for j in range(i)] for i in range(3)]\n"],
  // async
  ["async def", "async def f():\n    pass\n"],
  ["await", "async def f():\n    await g()\n"],
  ["async for", "async def f():\n    async for i in gen():\n        pass\n"],
  ["async with", "async def f():\n    async with lock:\n        pass\n"],
  // match (3.10+)
  ["match wildcard", "match x:\n    case _:\n        pass\n"],
  ["match literal", "match x:\n    case 1:\n        pass\n"],
  ["match capture", "match x:\n    case y:\n        pass\n"],
  ["match guard", "match x:\n    case y if y > 1:\n        pass\n"],
  ["match or-pattern", "match x:\n    case 1 | 2:\n        pass\n"],
  [
    "match class pattern",
    "match x:\n    case Point(x=0, y=0):\n        pass\n",
  ],
  ["match sequence", "match x:\n    case [a, b]:\n        pass\n"],
  ["match star pattern", "match x:\n    case [a, *rest]:\n        pass\n"],
  ["match mapping", 'match x:\n    case {"k": v}:\n        pass\n'],
  ["match as-pattern", "match x:\n    case [1, 2] as pair:\n        pass\n"],
  ["match value pattern", "match x:\n    case Color.RED:\n        pass\n"],
];

describe("Python AST converter crash corpus", () => {
  it.each(corpus)("%s", (_label, source) => {
    expect(() => convertPythonToGeneralAst(source, version)).not.toThrow();
  });
});
