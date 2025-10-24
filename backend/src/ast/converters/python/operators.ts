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
 *                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
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
