#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const resizeImage = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const image = (0, sharp_1.default)(options.inputPath);
        const metadata = yield image.metadata();
        if (options.keepAspectRatio && (!metadata.width || !metadata.height)) {
            console.log(chalk_1.default.red("Cannot preserve aspect ratio without width and height metadata."));
            return;
        }
        if (options.keepAspectRatio && metadata.width && metadata.height) {
            if (!options.width && options.height) {
                options.width = Math.round((options.height / metadata.height) * metadata.width);
            }
            else if (!options.height && options.width) {
                options.height = Math.round((options.width / metadata.width) * metadata.height);
            }
        }
        yield image
            .resize(options.width, options.height)
            .toFile(options.outputPath);
        console.log(chalk_1.default.yellow(`[${new Date().toLocaleString()}]`), chalk_1.default.bold.green(`Resized:`), chalk_1.default.cyan(`${options.inputPath}`), chalk_1.default.gray(`->`), chalk_1.default.magenta(`${options.outputPath}`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`[${new Date().toLocaleString()}] Error resizing ${options.inputPath}:`, error.message));
        process.exit(1);
    }
});
const processImages = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!fs_1.default.existsSync(options.inputFolder)) {
            console.error(chalk_1.default.red(`Input folder does not exist: ${options.inputFolder}`));
            process.exit(1);
        }
        const files = fs_1.default.readdirSync(options.inputFolder);
        const validFormats = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        if (files.length === 0) {
            console.log(chalk_1.default.red("No images found in the input folder."));
            process.exit(1);
        }
        const resizeTasks = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const ext = path_1.default.extname(file).toLowerCase();
            if (validFormats.includes(ext)) {
                const inputPath = path_1.default.join(options.inputFolder, file);
                const outputPath = path_1.default.join(options.outputFolder, file);
                if (fs_1.default.existsSync(outputPath) && !options.overwrite) {
                    console.log(chalk_1.default.hex("#ed1c73")(`[${new Date().toLocaleString()}]`), chalk_1.default.bold.hex("#ed1c43")(`Skipped:`), chalk_1.default.hex("#ed1c5b")(`${file}`), chalk_1.default.red(`(File already exists, skipping.)`));
                }
                else {
                    yield resizeImage({
                        inputPath,
                        outputPath,
                        width: options.width,
                        height: options.height,
                        keepAspectRatio: options.keepAspectRatio,
                    });
                }
            }
            else {
                console.log(chalk_1.default.hex("#ed1c73")(`[${new Date().toLocaleString()}]`), chalk_1.default.bold.hex("#ed1c43")(`Skipped:`), chalk_1.default.hex("#ed1c5b")(`${file}`), chalk_1.default.red(`(Unsupported format)`));
            }
        }));
        console.time(chalk_1.default.hex("#1cede3")("Processing time"));
        yield Promise.all(resizeTasks);
        console.timeEnd(chalk_1.default.hex("#1cede3")("Processing time"));
        console.log(chalk_1.default.bold.blue("All images processed successfully."));
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error processing images:`, error.message));
    }
});
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .usage("Usage: swyft <command> [options]")
    .version("1.0.3")
    .command("resize", "Resize images in batch", (yargs) => {
    yargs
        .option("input", {
        alias: "i",
        type: "string",
        demandOption: true,
        description: "Input folder containing images",
        string: true,
    })
        .option("output", {
        alias: "o",
        type: "string",
        demandOption: true,
        description: "Output folder for resized images",
        string: true,
    })
        .option("width", {
        alias: "w",
        type: "number",
        description: "Target width for resized images",
        number: true,
    })
        .option("height", {
        alias: "h",
        type: "number",
        description: "Target height for resized images",
        number: true,
    })
        .option("keepAspectRatio", {
        alias: "a",
        type: "boolean",
        default: false,
        description: "Preserve aspect ratio when resizing. Only one of width or height is required if this is set.",
        boolean: true,
    })
        .option("overwrite", {
        alias: "y",
        type: "boolean",
        default: false,
        description: "Overwrite existing files in the output folder",
        boolean: true,
    });
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    const { input, output, width, height, keepAspectRatio, overwrite } = argv;
    if (!fs_1.default.existsSync(output)) {
        fs_1.default.mkdirSync(output, { recursive: true });
    }
    if (keepAspectRatio && !width && !height) {
        console.error(chalk_1.default.red("Either width or height is required when keeping aspect ratio."));
        process.exit(1);
    }
    if (!keepAspectRatio && (!width || !height)) {
        console.error(chalk_1.default.red("Both width and height are required when not preserving aspect ratio."));
        process.exit(1);
    }
    yield processImages({
        inputFolder: input,
        outputFolder: output,
        width,
        height,
        keepAspectRatio,
        overwrite,
    });
}))
    .help().argv;
