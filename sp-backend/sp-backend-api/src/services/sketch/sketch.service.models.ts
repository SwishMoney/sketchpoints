export interface Sketch {
  _id: any;
  gifUrl?: string;
  movUrl?: string;
  sketchFrames?: SketchFrame[];
}

export interface SketchFrame {
  url: string;
  timestamp: Date;
}
