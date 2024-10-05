# Swyft-Utils

A command-line tool to batch resize images with options to preserve aspect ratio, overwrite existing files, and more. Built with Node.js, using the [Sharp](https://sharp.pixelplumbing.com/) library for efficient image processing.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Examples](#examples)
- [License](#license)

## Features

- Resize multiple images in a folder
- Preserve aspect ratio
- Overwrite existing files
- Support for common image formats: JPG, PNG, GIF, WEBP

## Installation

To install the package globally, run:

```bash
npm install -g swyft-utils
```

## Usage

To resize images, use the following command:

```bash
swyft resize --input <input-folder> --output <output-folder> --width <width> --height <height> --keepAspectRatio [true|false] --overwrite [true|false]
```

## Options

| Option              | Alias | Type      | Required | Description                                                                              |
| ------------------- | ----- | --------- | -------- | ---------------------------------------------------------------------------------------- |
| `--input`           | `-i`  | `string`  | Yes      | Input folder containing images to be resized.                                            |
| `--output`          | `-o`  | `string`  | Yes      | Output folder where resized images will be saved.                                        |
| `--width`           | `-w`  | `number`  | No       | Target width for resized images.                                                         |
| `--height`          | `-h`  | `number`  | No       | Target height for resized images.                                                        |
| `--keepAspectRatio` | `-a`  | `boolean` | No       | Preserve aspect ratio when resizing. At least one of width or height is required if set. |
| `--overwrite`       | `-y`  | `boolean` | No       | Overwrite existing files in the output folder.                                           |

## Examples

1. Resize images while preserving the aspect ratio:

```bash
swyft resize -i ./images/input -o ./images/output -h 200 -a true
```

2. Resize images to specific width and height without preserving aspect ratio:

```bash
swyft resize -i ./images/input -o ./images/output -w 300 -h 200
```

3. Overwrite existing files in the output folder:

```bash
swyft resize -i ./images/input -o ./images/output -w 300 -h 200 -y true
```

## License

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/license/mit) file for details.
