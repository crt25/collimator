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
 * Matches the 'await' operator in an await expression
 *     result = await some_async_function()
 *              ^^^^^
 */
export const awaitOperator = "await";

/**
 * Matches the '&' operator in a bitwise AND expression
 *     result = a & b
 *                ^
 */
export const bitwiseAndOperator = "&";

/**
 * Matches the '|' operator in a bitwise OR expression
 *     result = a | b
 *                ^
 */
export const bitwiseOrOperator = "|";

/**
 * Matches the '^' operator in a bitwise XOR expression
 *     result = a ^ b
 *                ^
 */
export const bitwiseXorOperator = "^";

/**
 * Matches the '==' operator in an equality comparison
 *    if a == b:
 *         ^^
 */
export const equalityOperator = "==";

/**
 * Matches the '!=' operator in an inequality comparison
 *   if a != b:
 *        ^^
 */
export const inequalityOperator = "!=";

/**
 * Matches the '<' operator in a less-than comparison
 *   if a < b:
 *        ^
 */
export const lessThanOperator = "<";

/**
 * Matches the '<=' operator in a less-than-or-equal comparison
 *   if a <= b:
 *        ^^
 */
export const lessThanOrEqualOperator = "<=";

/**
 * Matches the '>' operator in a greater-than comparison
 *  if a > b:
 *       ^
 */
export const greaterThanOperator = ">";

/**
 * Matches the '>=' operator in a greater-than-or-equal comparison
 *  if a >= b:
 *       ^^
 */
export const greaterThanOrEqualOperator = ">=";

/**
 * Matches the 'in' operator in membership tests
 *   if item in collection:
 *           ^^
 */
export const inOperator = "in";

/**
 * Matches the 'not in' operator in negated membership tests
 *  if item not in collection:
 *              ^^
 */
export const notInOperator = "not in";

/**
 * Matches the 'is' operator in identity tests
 *   if a is b:
 *        ^^
 */
export const isOperator = "is";

/**
 * Matches the 'is not' operator in negated identity tests
 *  if a is not b:
 *       ^^
 */
export const isNotOperator = "is not";
