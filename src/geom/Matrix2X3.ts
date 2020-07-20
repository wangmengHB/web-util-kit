import { Point2D } from "./Point2D";

export type Matrix2X3Array = [ 
  number,   // m11
  number,   // m12
  number,   // m21
  number,   // m22
  number,   // dx
  number    // dy
];

export interface TRANSFORM_OPTION {
  angle: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  translateX: number;
  translateY: number;
  flipX: boolean;
  flipY: boolean;
}

export function getIdentityMatrix2X3(): Matrix2X3Array {
  return [1, 0, 0, 1, 0, 0 ];
}

export function getIdentityTransformOption(): TRANSFORM_OPTION {
  return {
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    translateX: 0,
    translateY: 0,
    flipX: false,
    flipY: false
  };
}

export function getMatrix2X3ArrayFromDOMMatrix(a: DOMMatrix): Matrix2X3Array {
  return [a.a, a.b, a.c, a.d, a.e, a.f];
}


/**
 * Returns a transform matrix starting from an object of the same kind of
 * the one returned from qrDecompose, useful also if you want to calculate some
 * transformations from an object that is not enlived yet
 */
export function composeMatrix2X3(options: TRANSFORM_OPTION): Matrix2X3Array {
  let matrix: Matrix2X3Array = [1, 0, 0, 1, options.translateX || 0, options.translateY || 0];
  if (options.angle) {
    matrix = multiplyMatrix2X3(matrix, calcRotateMatrix2X3(options));
  }
  if (options.scaleX !== 1 || options.scaleY !== 1 ||
      options.skewX || options.skewY || options.flipX || options.flipY
  ) {
    matrix = multiplyMatrix2X3(matrix, calcDimensionsMatrix2X3(options));
  }
  return matrix;
}


/**
 * Decomposes standard 2x3 matrix into transform components
 * suppose skewY = 0, then decompse the matrix equation: 
 * a[0] === cos(angle) * scaleX
 * a[1] === sin(angle) * scaleX
 * a[0] * a[3] - a[2] * a[1] === scaleX * scaleY
 * a[0] * a[2] + a[1] * a[3] === (scaleX) ^ 2 * tan(skewX)
 * a[0] ^ 2 + a[1] ^ 2 === (scaleX) ^ 2
 */
export function decomposeMatrix2X3(a: Matrix2X3Array): TRANSFORM_OPTION {
  const angle = Math.atan2(a[1], a[0]);
  const scaleX = a[1] / Math.sin(angle);
  const scaleY = (a[0] * a[3] - a[2] * a[1]) / scaleX;  
  // const tanSkewX = (a[0] * a[2] + a[1] * a[3]) / (Math.pow(a[0], 2) + Math.pow(a[1], 2));
  const skewX = Math.atan2(a[0] * a[2] + a[1] * a[3], Math.pow(a[0], 2) + Math.pow(a[1], 2));
  return {
    angle: angle,
    scaleX: Math.abs(scaleX),
    scaleY: Math.abs(scaleY),
    skewX: skewX,
    skewY: 0,
    flipX: scaleX > 0? false: true,
    flipY: scaleY > 0? false: true,
    translateX: a[4],
    translateY: a[5]
  };
}



/**
 * Multiply matrix A by matrix B to nest transformations
 * @param  {Array} a First transformMatrix
 * @param  {Array} b Second transformMatrix
 * @param  {Boolean} is2x2 flag to multiply matrices as 2x2 matrices
 * @return {Array} The product of the two transform matrices
 */
export function multiplyMatrix2X3(a: Matrix2X3Array, b: Matrix2X3Array ): Matrix2X3Array {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5]
  ];
}



/**
 * Apply transform t to point p
 * @param  {Point2D} p The point to transform
 * @param  {Array} t The transform
 * @param  {Boolean} [ignoreOffset] Indicates that the offset should not be applied
 * @return {Point2D} The transformed point
 */
export function transformPoint2D(
  p: Point2D, 
  t: Matrix2X3Array, 
  ignoreOffset: boolean = false
): Point2D {
  if (ignoreOffset) {
    return new Point2D(
      t[0] * p.x + t[2] * p.y,
      t[1] * p.x + t[3] * p.y
    );
  }
  return new Point2D(
    t[0] * p.x + t[2] * p.y + t[4],
    t[1] * p.x + t[3] * p.y + t[5]
  );
}



/**
 * Invert transformation t
 * 求逆变换矩阵, 计算过程待证明？
 * @param {Array} t The transform
 * @return {Array} The inverted transform
 */
export function invertMatrix2X3(t: Matrix2X3Array): Matrix2X3Array {
  const a = 1 / (t[0] * t[3] - t[1] * t[2]);
  const r: Matrix2X3Array = [a * t[3], -a * t[1], -a * t[2], a * t[0], 0, 0];
  const o: Point2D = transformPoint2D( new Point2D(t[4], t[5]), r, true);
  r[4] = -o.x;
  r[5] = -o.y;
  return r;
}



/**
 * Returns a transform matrix starting from an object of the same kind of
 * the one returned from qrDecompose, useful also if you want to calculate some
 * transformations from an object that is not enlived yet
 * @static
 * @memberOf fabric.util
 * @param  {Object} options
 * @param  {Number} [options.angle] angle in degrees
 * @return {Number[]} transform matrix
 */
export function calcRotateMatrix2X3(options: TRANSFORM_OPTION): Matrix2X3Array {
  if (!options.angle) {
    return getIdentityMatrix2X3();
  }
  const cos = Math.cos(options.angle);
  const sin = Math.sin(options.angle);
  return [cos, sin, -sin, cos, 0, 0];
}



/**
 * Returns a transform matrix starting from an object of the same kind of
 * the one returned from qrDecompose, useful also if you want to calculate some
 * transformations from an object that is not enlived yet.
 * is called DimensionsTransformMatrix because those properties are the one that influence
 * the size of the resulting box of the object.
 * @param  {TRANSFORM_OPTION} options
 * @return {Matrix2X3Array} transform matrix
 */
export function calcDimensionsMatrix2X3(options: TRANSFORM_OPTION): Matrix2X3Array {
  const scaleX = typeof options.scaleX === 'undefined' ? 1 : options.scaleX;
  const scaleY = typeof options.scaleY === 'undefined' ? 1 : options.scaleY;
  let scaleMatrix: Matrix2X3Array = [
    options.flipX ? -scaleX : scaleX,
    0,
    0,
    options.flipY ? -scaleY : scaleY,
    0,
    0
  ];
      
  if (options.skewX) {
    scaleMatrix = multiplyMatrix2X3(
      scaleMatrix,
      [1, 0, Math.tan(options.skewX), 1, 0, 0]
    );
  }
  if (options.skewY) {
    scaleMatrix = multiplyMatrix2X3(
      scaleMatrix,
      [1, Math.tan(options.skewY), 0, 1, 0, 0],
    );
  }
  return scaleMatrix;
}


/**
 * Rotates `vector` with `angle` (radian unit)
 */
export function rotateVector2D(vector: Point2D, angle: number): Point2D {
  let sin = Math.sin(angle),
      cos = Math.cos(angle),
      rx = vector.x * cos - vector.y * sin,
      ry = vector.x * sin + vector.y * cos;
  return new Point2D({
    x: rx,
    y: ry
  });
}


/**
 * Rotates `point` around `origin` with `angle` (radian unit)
 */
export function rotatePoint2D(point: Point2D, origin: Point2D, angle: number): Point2D {
  let vector = point.sub(origin);
  vector = rotateVector2D(vector, angle);
  return vector.add(origin);
}


/**
 * Returns coordinates of points's bounding rectangle (left, top, width, height)
 * @param {Array<Point2D>} points 4 points array, points will be changed
 * @param {Matrix2X3Array} [transform] an array of 6 numbers representing a 2x3 transform matrix
 * @return {Object} Object with left, top, width, height properties
 */
export function makeBoundingBoxFromPoints(points: Array<Point2D>, transform: Matrix2X3Array) {
  if (transform) {
    for (var i = 0; i < points.length; i++) {
      points[i] = transformPoint2D(points[i], transform);
    }
  }

  const xs = points.map((p: Point2D) => p.x);
  const ys = points.map((p: Point2D) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const width = maxX - minX;
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const height = maxY - minY;

  return {
    left: minX,
    top: minY,
    width: width,
    height: height
  };
}


/**
 * given a width and height, return the size of the bounding box
 * that can contains the box with width/height with applied transform
 * described in options.
 * Use to calculate the boxes around objects for controls.
 * @memberOf fabric.util
 * @param {Number} width
 * @param {Number} height
 * @param {TRANSFORM_OPTION} options
 * @return {Object.width} width of containing
 * @return {Object.height} height of containing
 */
export function sizeAfterTransform(width: number, height: number, options: TRANSFORM_OPTION) {
  const dimX = width / 2, dimY = height / 2;
  const points = [
    {
      x: -dimX,
      y: -dimY
    },
    {
      x: dimX,
      y: -dimY
    },
    {
      x: -dimX,
      y: dimY
    },
    {
      x: dimX,
      y: dimY
    }
  ].map((p: any) => new Point2D(p));
  const transformMatrix = calcDimensionsMatrix2X3(options);
  const bbox = makeBoundingBoxFromPoints(points, transformMatrix);
  return {
    width: bbox.width,
    height: bbox.height,
  };
}


