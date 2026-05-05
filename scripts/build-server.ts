import * as esbuild from "esbuild";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

esbuild.build({
  entryPoints: [path.resolve(__dirname, "../server.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: path.resolve(__dirname, "../dist/server.cjs"),
  format: "cjs",
  logLevel: "info",
}).catch(() => process.exit(1));
