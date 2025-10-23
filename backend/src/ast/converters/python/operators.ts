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
