export const getCroppedImg = (imageSrc, croppedAreaPixels, aspectRatio) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");

      // Output size
      const outputWidth = aspectRatio === 1 ? 600 : 1200; // square for profile, wide for cover
      const scale = image.width / image.naturalWidth;

      canvas.width = outputWidth;
      canvas.height = outputWidth / aspectRatio;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        croppedAreaPixels.x / scale,
        croppedAreaPixels.y / scale,
        croppedAreaPixels.width / scale,
        croppedAreaPixels.height / scale,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob((blob) => {
        const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
        resolve({ file, url: URL.createObjectURL(blob) });
      }, "image/jpeg");
    };

    image.onerror = (err) => reject(err);
  });
};
