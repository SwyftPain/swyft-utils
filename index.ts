#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import type { ProcessOptions, ResizeOptions, Args } from "./types";

const resizeImage = async (options: ResizeOptions) => {
  try {
    const image = sharp(options.inputPath);
    const metadata = await image.metadata();

    if (options.keepAspectRatio && (!metadata.width || !metadata.height)) {
      console.log(
        chalk.red(
          "Cannot preserve aspect ratio without width and height metadata."
        )
      );
      return;
    }

    if (options.keepAspectRatio && metadata.width && metadata.height) {
      if (!options.width && options.height) {
        options.width = Math.round(
          (options.height / metadata.height) * metadata.width
        );
      } else if (!options.height && options.width) {
        options.height = Math.round(
          (options.width / metadata.width) * metadata.height
        );
      }
    }

    await image
      .resize(options.width, options.height)
      .toFile(options.outputPath);

    console.log(
      chalk.yellow(`[${new Date().toLocaleString()}]`),
      chalk.bold.green(`Resized:`),
      chalk.cyan(`${options.inputPath}`),
      chalk.gray(`->`),
      chalk.magenta(`${options.outputPath}`)
    );
  } catch (error: any) {
    console.error(
      chalk.red(
        `[${new Date().toLocaleString()}] Error resizing ${options.inputPath}:`,
        error.message
      )
    );
    process.exit(1);
  }
};

const processImages = async (options: ProcessOptions) => {
  try {
    if (!fs.existsSync(options.inputFolder)) {
      console.error(
        chalk.red(`Input folder does not exist: ${options.inputFolder}`)
      );
      process.exit(1);
    }

    const files = fs.readdirSync(options.inputFolder);
    const validFormats = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    if (files.length === 0) {
      console.log(chalk.red("No images found in the input folder."));
      process.exit(1);
    }

    const resizeTasks = files.map(async (file) => {
      const ext = path.extname(file).toLowerCase();

      if (validFormats.includes(ext)) {
        const inputPath = path.join(options.inputFolder, file);
        const outputPath = path.join(options.outputFolder, file);

        if (fs.existsSync(outputPath) && !options.overwrite) {
          console.log(
            chalk.hex("#ed1c73")(`[${new Date().toLocaleString()}]`),
            chalk.bold.hex("#ed1c43")(`Skipped:`),
            chalk.hex("#ed1c5b")(`${file}`),
            chalk.red(`(File already exists, skipping.)`)
          );
        } else {
          await resizeImage({
            inputPath,
            outputPath,
            width: options.width,
            height: options.height,
            keepAspectRatio: options.keepAspectRatio,
          });
        }
      } else {
        console.log(
          chalk.hex("#ed1c73")(`[${new Date().toLocaleString()}]`),
          chalk.bold.hex("#ed1c43")(`Skipped:`),
          chalk.hex("#ed1c5b")(`${file}`),
          chalk.red(`(Unsupported format)`)
        );
      }
    });

    console.time(chalk.hex("#1cede3")("Processing time"));
    await Promise.all(resizeTasks);
    console.timeEnd(chalk.hex("#1cede3")("Processing time"));
    console.log(chalk.bold.blue("All images processed successfully."));
  } catch (error: any) {
    console.error(chalk.red(`Error processing images:`, error.message));
  }
};

yargs(hideBin(process.argv))
  .usage("Usage: swyft <command> [options]")
  .version("1.0.3")
  .command(
    "resize",
    "Resize images in batch",
    (yargs) => {
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
          description:
            "Preserve aspect ratio when resizing. Only one of width or height is required if this is set.",
          boolean: true,
        })
        .option("overwrite", {
          alias: "y",
          type: "boolean",
          default: false,
          description: "Overwrite existing files in the output folder",
          boolean: true,
        });
    },
    async (argv) => {
      const { input, output, width, height, keepAspectRatio, overwrite } =
        argv as unknown as Args;

      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true });
      }

      if (keepAspectRatio && !width && !height) {
        console.error(
          chalk.red(
            "Either width or height is required when keeping aspect ratio."
          )
        );
        process.exit(1);
      }

      if (!keepAspectRatio && (!width || !height)) {
        console.error(
          chalk.red(
            "Both width and height are required when not preserving aspect ratio."
          )
        );
        process.exit(1);
      }

      await processImages({
        inputFolder: input,
        outputFolder: output,
        width,
        height,
        keepAspectRatio,
        overwrite,
      });
    }
  )
  .help().argv;
