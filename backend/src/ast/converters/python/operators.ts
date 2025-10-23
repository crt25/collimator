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
