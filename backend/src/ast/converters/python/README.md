`./python-ast-visitor.ts` is an ANTLR visitor that recursively calls the conversion functions corresponding to the input's type.

These specific conversion functions are defined in `./nodes` and are grouped into different folders.
For instance if the ANTLR generated typescript class in `./generated/PythonParser.ts` is called `Import_from_targetsContext`, there is a file `import-from-targets`, om this case in the `./nodes/imports` folder.

Also for some files, the name was slightly changed to make it easier to read while still maintaining the connection to the ANTLR class names.
Examples of this are the following abbreviations used by the ANTLR python grammar:

- `t` = `target`
- `del` = `delete`
- `kwds` = `keywords`
- `comp` = `comprehension`

The original (abbreviated) name directly corresponds to an entry in the ANTRL python grammar which can be found online: https://github.com/antlr/grammars-v4/blob/master/python/python3_13/PythonParser.g4.

Each conversion function accepts the `./python-ast-visitor.ts` and the specific context.
Most return an instance of `PythonVisitorReturnValue` while others that are only used in specific contexts may return a different type.
All converters used in `./python-ast-visitor.ts`, return `PythonVisitorReturnValue`.

# Limitations

Currently Typing information is not preserved (except for the declaration a typed variable).
Moreover, `multiAssignment` is always the parent node of any assignment in Python
