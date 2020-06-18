/* Taken from https://medium.com/@brandonstilson/lets-encrypt-files-with-node-85037bea8c0e */

import { Transform, TransformOptions } from "stream";

class AppendInitVect extends Transform {
  private initVector: Buffer;
  private appended: boolean;

  constructor(initVector: Buffer, options?: TransformOptions) {
    super(options);
    this.initVector = initVector;
    this.appended = false;
  }

  _transform(chunk: any, _encoding: string, callback: Function) {
    if (!this.appended) {
      this.push(this.initVector);
      this.appended = true;
    }
    this.push(chunk);
    callback();
  }
}

export = AppendInitVect;
