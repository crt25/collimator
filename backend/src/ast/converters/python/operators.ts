// This file contains string constants representing various Python operators.
// See https://github.com/antlr/grammars-v4/blob/master/python/python3_13/PythonParser.g4 for the grammar.

/**
 * Matches the component highlighted below in a dictionary creation
 *     my_dict = { key: value, another_key: another_value }
 *                 ^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^
 * Matches the component highlighted below in a dictionary comprehension
 *      { key: value for (k, v) in getData() if value > 3 }
 *        ^^^^^^^^^^
 */
export const createKeyValuePairOperator = "create-key-value-pair";

/**
 * Matches an await expression
 *     result = await some_async_function()
 *              ^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const awaitOperator = "await";

/**
 * Matches a bitwise AND expression
 *     result = a & b
 *              ^^^^^
 */
export const bitwiseAndOperator = "&";

/**
 * Matches a bitwise OR expression
 *     result = a | b
 *              ^^^^^
 */
export const bitwiseOrOperator = "|";

/**
 * Matches a bitwise XOR expression
 *     result = a ^ b
 *              ^^^^^
 */
export const bitwiseXorOperator = "^";

/**
 * Matches an equality comparison
 *    if a == b:
 *       ^^^^^^
 */
export const equalityOperator = "==";

/**
 * Matches an inequality comparison
 *   if a != b:
 *      ^^^^^^
 */
export const inequalityOperator = "!=";

/**
 * Matches a less-than comparison
 *   if a < b:
 *      ^^^^^
 */
export const lessThanOperator = "<";

/**
 * Matches a less-than-or-equal comparison
 *   if a <= b:
 *      ^^^^^^
 */
export const lessThanOrEqualOperator = "<=";

/**
 * Matches a greater-than comparison
 *  if a > b:
 *     ^^^^^
 */
export const greaterThanOperator = ">";

/**
 * Matches a greater-than-or-equal comparison
 *  if a >= b:
 *     ^^^^^^
 */
export const greaterThanOrEqualOperator = ">=";

/**
 * Matches a membership test
 *   if item in collection:
 *      ^^^^^^^^^^^^^^^^^^
 */
export const inOperator = "in";

/**
 * Matches a negated membership tests
 *  if item not in collection:
 *     ^^^^^^^^^^^^^^^^^^^^^^
 */
export const notInOperator = "not in";

/**
 * Matches an identity tests
 *   if a is b:
 *      ^^^^^^
 */
export const isOperator = "is";

/**
 * Matches a negated identity tests
 *  if a is not b:
 *     ^^^^^^^^^^
 */
export const isNotOperator = "is not";

/**
 * Matches a complex number construction
 *   z = 3 + 4j
 *       ^^^^^^
 */
export const complexNumberOperator = "complex-number";

/**
 * Matches a logical AND expression
 *  if a and b:
 *     ^^^^^^^
 */
export const logicalAndOperator = "and";

/**
 * Matches a logical OR expression
 *  if a or b:
 *     ^^^^^^
 */
export const logicalOrOperator = "or";

/**
 * Matches a dictionary creation expression with key-value pairs as operands
 *     my_dict = { key: value, another_key: another_value }
 *                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const createDictionaryOperator = "create-dictionary";

/**
 * Matches a dictionary comprehension expression
 *      { key: value for (k, v) in getData() if value > 3 }
 *        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const dictionaryComprehensionOperator = "dictionary-comprehension";

/**
 * Matches a double-star key-value pair in dictionary unpacking
 *    my_dict = { **other_dict }
 *               ^^^^^^^^^^^^^
 */
export const doubleStarKvPairOperator = "**-kv-pair";

/**
 * Matches an if-then-else expression
 *  result = a if condition else b
 *           ^^^^^^^^^^^^^^^^^^^^^
 */
export const ifThenElseOperator = "if-then-else";

/**
 * Matches a for-if clause in comprehensions
 * my_list = [x * 2 for x in range(10) if x % 2 == 0]
 *           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const forIfClauseOperator = "for-if-clause";

/**
 * Matches an async for-if clause in comprehensions
 * my_list = [x * 2 async for x in async_range(10) if x % 2 == 0]
 *           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const asyncForIfClauseOperator = "async-for-if-clause";

/**
 * Matches an f-string
 *  value = f"Hello, {name}!"
 *          ^^^^^^^^^^^^^^^^^
 */
export const fStringOperator = "fstring";

/**
 * Matches an f-string conversion
 *  value = f"{variable!r}"
 *                     ^^
 * See https://stackoverflow.com/a/44800859.
 */
export const fStringConversionOperator = "fstring-conversion";

/**
 * Matches an f-string format specification
 * value = f"{variable:.2f}"
 *                    ^^^^
 */
export const fStringFormatSpecOperator = "fstring-format-spec";

/**
 * Matches an f-string replacement field
 * value = f"{some_var}"
 *           ^^^^^^^^^
 * value = f"{some_var=}"
 *            ^^^^^^^^^
 */
export const fStringReplacementFieldOperator = "fstring-replacement-field";

/**
 * Matches a generator expression
 *  gen_exp = (x * 2 for x in range(10) if x % 2 == 0)
 *            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const generatorExpressionOperator = "generator-expression";

/**
 * Matches an inversion (logical NOT) expression
 *  result = not condition
 *           ^^^^^^^^^^^^^
 */
export const notOperator = "not";

/**
 * Matches a double-star kwarg in function calls
 * func(**kwargs)
 *      ^^^^^^^^
 */
export const doubleStarKwArgsOperator = "double-star-kwargs";

/**
 * Matches variadic, positional arguments in function calls
 * func(*args)
 *      ^^^^^
 */
export const starArgsOperator = "star-args";

/**
 * Matches a list comprehension expression
 * my_list = [x * 2 for x in range(10) if x % 2 == 0]
 *           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const listComprehensionOperator = "list-comprehension";

/**
 * Matches a power expression
 * result = a ** b
 *          ^^^^^^
 */
export const powerOperator = "**";

/**
 * Matches a field access expression
 * value = obj.field
 *         ^^^^^^^^^
 */
export const fieldAccessOperator = ".";

/**
 * Matches a named parameter in function calls
 * func(param=value)
 *      ^^^^^^^^^^^
 */
export const namedParameterOperator = "named-parameter";

/**
 * Matches a function invocation expression
 * result = my_function(arg1, arg2)
 *          ^^^^^^^^^^^^^^^^^^^^^^^
 */
export const functionInvocationOperator = "function-invocation";

/**
 * Matches a slice expression
 * sublist = my_list[1:5]
 *           ^^^^^^^^^^^^
 */
export const sliceOperator = "slice";

/**
 * Matches a set creation expression
 * my_set = {1, 2, 3, 4}
 *          ^^^^^^^^^^^^
 */
export const createSetOperator = "create-set";

/**
 * Matches a set comprehension expression
 * { x * 2 for x in range(10) if x % 2 == 0 }
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const setComprehensionOperator = "set-comprehension";

/**
 * Matches an additive inverse expression
 * result = -value
 *          ^^^^^^
 */
export const additiveInverseOperator = "additive-inverse";

/**
 * Matches a start (unpack) operator
 * func(*args)
 */
export const unpackOperator = "*";

/**
 * Matches an implicit string concatenation operator
 * full_string = "Hello, " "world!"
 *               ^^^^^^^^^^^^^^^^^^
 */
export const implicitConcatOperator = "implicit-concat";

/**
 * Matches a yield expression
 * result = yield value
 *          ^^^^^^^^^^^
 */
export const yieldOperator = "yield";

/**
 * Matches a rename import operator
 * import module as mod
 *        ^^^^^^^^^^^^^
 */
export const renameImportOperator = "rename-import";

/**
 * Matches an "as" pattern operator in pattern matching
 * case some_value as target:
 *      ^^^^^^^^^^^^^^^^^^^^
 */
export const asPatternOperator = "as-pattern";

/**
 * Matches a class pattern operator in pattern matching
 * case ClassName(attr1=value1, attr2=value2):
 *      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const classPatternOperator = "class-pattern";

/**
 * Matches a double-star pattern operator in pattern matching
 * case **rest:
 *      ^^^^^^^
 */
export const doubleStarPatternOperator = "double-star-pattern";

/**
 * Matches a group pattern operator in pattern matching
 * case (pattern):
 *      ^^^^^^^^^
 */
export const groupPatternOperator = "group-pattern";

/**
 * Matches a pattern guard operator in pattern matching
 * case pattern if condition:
 *      ^^^^^^^^^^^^^^^^^^^^^
 */
export const patternGuardOperator = "guard";

/**
 * Matches an items pattern operator in pattern matching
 * case { key1: value1, key2: value2, **rest }:
 *        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const itemsPatternOperator = "items-pattern";

/**
 * Matches a key-value pattern operator in pattern matching
 * case { key: value, **rest }:
 *        ^^^^^^^^^^
 */
export const keyValuePatternOperator = "key-value-pattern";

/**
 * Matches a keyword pattern operator in pattern matching
 * case ClassName(attr1=value1, attr2=value2):
 *                ^^^^^^^^^^^^  ^^^^^^^^^^^^
 */
export const keywordPatternOperator = "keyword-pattern";

/**
 * Matches a mapping pattern operator in pattern matching
 * case { key1: value1, key2: value2, **rest }:
 *      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const mappingPatternOperator = "mapping-pattern";

/**
 * Matches an or pattern operator in pattern matching
 * case pattern1 | pattern2:
 *      ^^^^^^^^^^^^^^^^^^^
 */
export const orPatternOperator = "or-pattern";

/**
 * Matches a sequence pattern operator in pattern matching
 * case [item1, item2, *rest]:
 *      ^^^^^^^^^^^^^^^^^^^^^
 * case (item1, item2, *rest):
 *      ^^^^^^^^^^^^^^^^^^^^^
 */
export const sequencePatternOperator = "sequence-pattern";

/**
 * Matches a star pattern operator in pattern matching
 * case [item1, item2, *rest]:
 *                     ^^^^^
 * case (item1, item2, *rest):
 *                     ^^^^^
 */
export const starPatternOperator = "star-pattern";

/**
 * Matches a "with item" operator in context managers
 * with resource as res_item:
 *      ^^^^^^^^^^^^^^^^^^^^
 */
export const withItemOperator = "with-item";

/**
 * Matches a type parameter bound operator
 * class MyGenericClass[T : SomeBaseClass]:
 *                        ^^^^^^^^^^^^^^^
 */
export const typeParameterBoundOperator = "type-parameter-bound";

/**
 * Matches a type parameter default operator
 * class MyGenericClass[T = int]:
 *                        ^^^^^
 */
export const typeParameterDefaultOperator = "type-parameter-default";

/**
 * Matches a type parameter starred default operator
 * class MyGenericClass[*Ts = *tuple[int, bool]]:
 *                          ^^^^^^^^^^^^^^^^^^^
 */
export const typeParameterStarredDefaultOperator =
  "type-parameter-starred-default";
