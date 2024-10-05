type ResizeOptions = {
  inputPath: string;
  outputPath: string;
  width: number;
  height: number;
  keepAspectRatio: boolean;
};

type ProcessOptions = {
  inputFolder: string;
  outputFolder: string;
  width: number;
  height: number;
  keepAspectRatio: boolean;
  overwrite: boolean;
};

type Args = {
  input: string;
  output: string;
  width: number;
  height: number;
  keepAspectRatio: boolean;
  overwrite: boolean;
};

export type { ResizeOptions, ProcessOptions, Args };
