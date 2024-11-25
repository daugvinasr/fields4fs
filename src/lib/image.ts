export async function loadImageToBoolArray(file: File): Promise<boolean[][]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Initialize 2D boolean array
      const boolArray: boolean[][] = Array(height)
        .fill(null)
        .map(() => Array(width).fill(false));

      // Process pixels
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4; // each pixel has 4 values (r,g,b,a)
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check if pixel is not black
          boolArray[y][x] = !(r === 0 && g === 0 && b === 0);
        }
      }

      resolve(boolArray);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Create object URL from File
    img.src = URL.createObjectURL(file);
  });
}
