# The Scratch .sb3 Format

Scratch stores its data in a data format called `sb3` and also uses those three letters as a file extension.
The format is a zip file containing resource files such as images and audio data plus a `project.json` file.

[Scratch's Parser GitHub repository](https://github.com/scratchfoundation/scratch-parser) lists a JSON schema for this file [here](https://github.com/scratchfoundation/scratch-parser/blob/master/lib/sb3_definitions.json) and [here](https://github.com/scratchfoundation/scratch-parser/blob/master/lib/sb3_schema.json).

However, the individual inputs to the different blocks are not documented in this JSON schema.
Instead, they may be found in the [respective block definition on the scratch-blocks GitHub repository](https://github.com/scratchfoundation/scratch-blocks/blob/2e3a31e555a611f0c48d7c57074e2e54104c04ce/blocks_vertical/).