/// <reference path="../node_modules/@turbowarp/types/types/scratch-render.d.ts" />
/// <reference path="../node_modules/@turbowarp/types/types/scratch-svg-renderer.d.ts" />
/// <reference path="../node_modules/@turbowarp/types/types/scratch-render-fonts.d.ts" />
/// <reference path="../node_modules/@turbowarp/types/types/scratch-audio.d.ts" />
/// <reference path="../node_modules/@turbowarp/types/types/scratch-scratch-parser.d.ts" />

declare module "scratch-render" {
  export = RenderWebGL;
}

declare module "scratch-svg-renderer" {
  export = ScratchSVGRenderer;
}

declare module "scratch-render-fonts" {
  export = ScratchRenderFonts;
}

declare module "scratch-audio" {
  export = AudioEngine;
}

declare module "scratch-parser" {
  export = ScratchParser;
}
