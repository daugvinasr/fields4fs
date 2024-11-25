import type { Point, Shape } from "@/types/types.ts";

function findOutlineCoordinates(array: boolean[][]): Point[] {
  if (array.length === 0 || array[0].length === 0) {
    return [];
  }

  const height = array.length;
  const width = array[0].length;
  const tempOutline: Point[] = [];
  const outline: Point[] = [];

  // Find starting point
  let startX = 0,
    startY = 0;
  let found = false;
  for (let y = 0; y < height && !found; y++) {
    for (let x = 0; x < width && !found; x++) {
      if (array[y][x]) {
        startX = x;
        startY = y;
        found = true;
      }
    }
  }

  if (!found) return [];

  // Directions: right, down-right, down, down-left, left, up-left, up, up-right
  const dx = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];

  let currentX = startX;
  let currentY = startY;
  let dir = 7; // Start by looking up-right

  const visited = new Set<string>();

  while (true) {
    tempOutline.push([currentX, currentY]);
    visited.add(`${currentX},${currentY}`);

    let pointFound = false;
    const startDir = (dir + 6) % 8;

    for (let i = 0; i < 8 && !pointFound; i++) {
      const checkDir = (startDir + i) % 8;
      const newX = currentX + dx[checkDir];
      const newY = currentY + dy[checkDir];

      if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
        if (array[newY][newX]) {
          currentX = newX;
          currentY = newY;
          dir = checkDir;
          pointFound = true;
        }
      }
    }

    if (
      !pointFound ||
      (tempOutline.length > 1 && currentX === startX && currentY === startY)
    ) {
      break;
    }
  }

  // Reduce points by keeping every 5th point
  for (let i = 0; i < tempOutline.length; i += 5) {
    outline.push(tempOutline[i]);
  }

  // Include last point if not already included
  if (tempOutline.length > 0 && (tempOutline.length - 1) % 5 !== 0) {
    outline.push(tempOutline[tempOutline.length - 1]);
  }

  return outline;
}

function floodFill(
  array: boolean[][],
  visited: boolean[][],
  startX: number,
  startY: number,
  pixels: Point[],
): void {
  const height = array.length;
  const width = array[0].length;
  const stack: Point[] = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;

    if (
      x < 0 ||
      x >= width ||
      y < 0 ||
      y >= height ||
      visited[y][x] ||
      !array[y][x]
    ) {
      continue;
    }

    visited[y][x] = true;
    pixels.push([x, y]);

    // Add all 8 neighboring pixels to the stack
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        stack.push([x + dx, y + dy]);
      }
    }
  }
}

export function findShapes(array: boolean[][]): Shape[] {
  const height = array.length;
  const width = array[0].length;
  const visited = Array(height)
    .fill(null)
    .map(() => Array(width).fill(false));
  const shapes: Shape[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (array[y][x] && !visited[y][x]) {
        const pixels: Point[] = [];
        floodFill(array, visited, x, y, pixels);

        const tempArray = Array(height)
          .fill(null)
          .map(() => Array(width).fill(false));
        pixels.forEach(([px, py]) => (tempArray[py][px] = true));

        const outline = findOutlineCoordinates(tempArray);

        if (pixels.length >= 50) {
          shapes.push({ pixels, outline });
        }
      }
    }
  }

  return shapes;
}
