


export interface CircleNode {
  x: number;
  y: number;
  radius: number;
}

export interface Quad {
  point: CircleNode;
}


// collide takes a node -> returns a function
// the returned function takes
export function collide(node: CircleNode) {
  var r = node.radius + 16,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad: Quad, x1: number, y1: number, x2: number, y2: number): Boolean {
      if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = node.radius + quad.point.radius;
          if (l < r) {
              l = (l - r) / l * .5;
              node.x -= x *= l;
              node.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
          }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
};

