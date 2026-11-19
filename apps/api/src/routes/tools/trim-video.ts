import { extname } from "node:path";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  audioEncodeArgsForContainer,
  formatFfmpegSeconds,
  runMediaTool,
  videoContentType,
  videoEncodeArgsForContainer,
} from "../../lib/media-tool.js";
import { checkTrimMode, resolveTrimWindow, trimModeFields } from "../../lib/trim-window.js";
import { InputValidationError } from "../../modality/contract.js";
import { createToolRoute } from "../tool-factory.js";

const settingsSchema = z
  .object({
    ...trimModeFields,
    precise: z.boolean().default(false),
  })
  .superRefine((s, ctx) => checkTrimMode(s, ctx));

export function registerTrimVideo(app: FastifyInstance) {
  createToolRoute(app, {
    toolId: "trim-video",
    settingsSchema,
    process: async () => {
      throw new Error("trim-video is v2-only");
    },
    processV2: async (ctx) => {
      const settings = settingsSchema.parse(ctx.settings);
      const origExt = extname(ctx.inputs[0].filename) || ".mp4";
      const base = ctx.inputs[0].filename.replace(/\.[^.]+$/, "");
      const outName = `${base}_trimmed${origExt}`;
      const contentType = videoContentType(origExt);

      const { outPath } = await runMediaTool(ctx, outName, (inPath, out, info) => {
        if (info.durationS === null) {
          throw new InputValidationError("Could not determine video duration");
        }
        const { startS, endS } = resolveTrimWindow(settings, info.durationS, "video");
        if (settings.precise) {
          return [
            "-i",
            inPath,
            "-ss",
            formatFfmpegSeconds(startS),
            "-to",
            formatFfmpegSeconds(endS),
            ...videoEncodeArgsForContainer(origExt),
            ...audioEncodeArgsForContainer(origExt),
            out,
          ];
        }
        // Fast seek: -ss before -i for stream-copy
        return [
          "-ss",
          formatFfmpegSeconds(startS),
          "-to",
          formatFfmpegSeconds(endS),
          "-i",
          inPath,
          "-c",
          "copy",
          "-avoid_negative_ts",
          "make_zero",
          out,
        ];
      });
      return { scratchPath: outPath, filename: outName, contentType };
    },
  });
}
