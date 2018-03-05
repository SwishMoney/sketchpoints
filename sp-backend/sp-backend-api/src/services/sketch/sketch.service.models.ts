export interface Sketch {
  _id: any;
  gifUrl?: string;
  movUrl?: string;
  sketchPages?: SketchPage[];
}

export interface SketchPage {
  sketchFrames?: SketchFrame[];
}

export interface SketchFrame {
  url: string;
  timestamp: Date;
}
