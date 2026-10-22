// import { useEffect, useRef, useState } from "react";

// import CameraModal from "./CameraModal";

// function ImageUpload({ image, onImageChange }) {
//   const fileInputRef = useRef(null);

//   const [cameraOpen, setCameraOpen] = useState(false);
//   const [dragging, setDragging] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState("");

//   useEffect(() => {
//     if (!image) {
//       setPreviewUrl("");
//       return undefined;
//     }

//     const objectUrl = URL.createObjectURL(image);

//     setPreviewUrl(objectUrl);

//     return () => {
//       URL.revokeObjectURL(objectUrl);
//     };
//   }, [image]);

//   function handleFile(file) {
//     if (!file) {
//       return;
//     }

//     if (!file.type.startsWith("image/")) {
//       return;
//     }

//     onImageChange(file);
//   }

//   function handleInputChange(event) {
//     const file = event.target.files?.[0];

//     handleFile(file);

//     event.target.value = "";
//   }

//   function handleDrop(event) {
//     event.preventDefault();

//     setDragging(false);

//     const file = event.dataTransfer.files?.[0];

//     handleFile(file);
//   }

//   function handleDragOver(event) {
//     event.preventDefault();

//     setDragging(true);
//   }

//   function handleDragLeave(event) {
//     event.preventDefault();

//     setDragging(false);
//   }

//   function openCamera() {
//     setCameraOpen(true);
//   }

//   function closeCamera() {
//     setCameraOpen(false);
//   }

//   function handleCameraCapture(file) {
//     if (!file) {
//       return;
//     }

//     handleFile(file);

//     setCameraOpen(false);
//   }

//   if (image) {
//     return (
//       <>
//         <div className="image-upload-preview">
//           <div className="image-preview-wrapper">
//             {previewUrl && <img src={previewUrl} alt="Jewellery preview" />}
//           </div>

//           <div className="image-preview-details">
//             <span>{image.name || "Captured jewellery image"}</span>

//             <button type="button" onClick={() => onImageChange(null)}>
//               Remove
//             </button>
//           </div>

//           <button
//             type="button"
//             className="change-image-button"
//             onClick={() => fileInputRef.current?.click()}
//           >
//             Change Image
//           </button>

//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/jpeg,image/png,image/webp,image/bmp"
//             hidden
//             onChange={handleInputChange}
//           />
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <div
//         className={`image-upload-box ${dragging ? "dragging" : ""}`}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//       >
//         <div className="upload-icon">↑</div>

//         <h3>Upload jewellery image</h3>

//         <p>Drag & drop your image here</p>

//         <span className="upload-or">or</span>

//         <div className="upload-actions">
//           <button type="button" onClick={() => fileInputRef.current?.click()}>
//             Browse Image
//           </button>

//           <button type="button" onClick={openCamera}>
//             Take Photo
//           </button>
//         </div>

//         <small>JPG, JPEG, PNG, WEBP or BMP</small>

//         <input
//           ref={fileInputRef}
//           type="file"
//           accept="image/jpeg,image/png,image/webp,image/bmp"
//           hidden
//           onChange={handleInputChange}
//         />
//       </div>

//       {cameraOpen && (
//         <CameraModal onCapture={handleCameraCapture} onClose={closeCamera} />
//       )}
//     </>
//   );
// }

// export default ImageUpload;

// ######################################
// ######################################
// image crop
// ######################################

import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import CameraModal from "./CameraModal";

function createCroppedImage(imageUrl, cropPixels, fileName) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Unable to prepare the cropped image."));
          return;
        }

        canvas.width = Math.round(cropPixels.width);
        canvas.height = Math.round(cropPixels.height);

        context.drawImage(
          image,
          cropPixels.x,
          cropPixels.y,
          cropPixels.width,
          cropPixels.height,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Unable to create the cropped image."));
              return;
            }

            const safeName = (fileName || "jewellery-image")
              .replace(/\.[^.]+$/, "")
              .replace(/[^\w-]+/g, "_");

            resolve(
              new File([blob], `${safeName}_cropped.jpg`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              }),
            );
          },
          "image/jpeg",
          0.95,
        );
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      reject(new Error("Unable to load this image for cropping."));
    };

    image.src = imageUrl;
  });
}

function ImageUpload({ image, onImageChange }) {
  const fileInputRef = useRef(null);
  const cropAreaRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [cropSourceFile, setCropSourceFile] = useState(null);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [cropError, setCropError] = useState("");

  // Preview of the image already confirmed by the user.
  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  // Temporary URL for the image currently being cropped.
  useEffect(() => {
    if (!cropSourceFile) {
      setCropImageUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(cropSourceFile);
    setCropImageUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [cropSourceFile]);

  function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCropError("Please select a valid image file.");
      return;
    }

    setCropError("");
    setCropSourceFile(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropOpen(true);
  }

  function handleInputChange(event) {
    const file = event.target.files?.[0];
    handleFile(file);

    // Allows selecting the same file again.
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);

    handleFile(event.dataTransfer.files?.[0]);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setDragging(false);
  }

  function handleCropComplete(_croppedArea, croppedPixels) {
    setCroppedAreaPixels(croppedPixels);
  }

  function cancelCrop() {
    if (cropLoading) return;

    setCropOpen(false);
    setCropSourceFile(null);
    setCroppedAreaPixels(null);
    setCropError("");
  }

  async function applyCrop() {
    if (!cropImageUrl || !croppedAreaPixels || cropLoading) {
      setCropError("Adjust the crop area before continuing.");
      return;
    }

    setCropLoading(true);
    setCropError("");

    try {
      const croppedFile = await createCroppedImage(
        cropImageUrl,
        croppedAreaPixels,
        cropSourceFile?.name,
      );

      // Pass the cropped JPEG File to the existing SearchPage.
      onImageChange(croppedFile);

      setCropOpen(false);
      setCropSourceFile(null);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error("Image cropping error:", error);
      setCropError(
        error.message || "Unable to crop the image. Please try again.",
      );
    } finally {
      setCropLoading(false);
    }
  }

  function openCamera() {
    setCameraOpen(true);
  }

  function closeCamera() {
    setCameraOpen(false);
  }

  function handleCameraCapture(file) {
    if (file) {
      handleFile(file);
      setCameraOpen(false);
    }
  }

  return (
    <>
      {image ? (
        <div className="image-upload-preview">
          <div className="image-preview-wrapper">
            {previewUrl && (
              <img src={previewUrl} alt="Cropped jewellery preview" />
            )}
          </div>

          <div className="image-preview-details">
            <span title={image.name}>
              {image.name || "Cropped jewellery image"}
            </span>

            <button
              type="button"
              onClick={() => {
                onImageChange(null);
                setCropError("");
              }}
            >
              Remove
            </button>
          </div>

          <div className="image-preview-actions">
            <button
              type="button"
              className="change-image-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Image
            </button>

            <button
              type="button"
              className="recrop-image-button"
              onClick={() => {
                setCropError("");
                setCropSourceFile(image);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setCroppedAreaPixels(null);
                setCropOpen(true);
              }}
            >
              Adjust Crop
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/bmp"
            hidden
            onChange={handleInputChange}
          />
        </div>
      ) : (
        <div
          className={`image-upload-box ${dragging ? "dragging" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="upload-icon">↑</div>

          <h3>Upload jewellery image</h3>
          <p>Drag &amp; drop your image here</p>

          <span className="upload-or">or</span>

          <div className="upload-actions">
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              Browse Image
            </button>

            <button type="button" onClick={openCamera}>
              Take Photo
            </button>
          </div>

          <small>JPG, JPEG, PNG, WEBP or BMP</small>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/bmp"
            hidden
            onChange={handleInputChange}
          />

          {cropError && (
            <p className="crop-inline-error" role="alert">
              {cropError}
            </p>
          )}
        </div>
      )}

      {cameraOpen && (
        <CameraModal onCapture={handleCameraCapture} onClose={closeCamera} />
      )}

      {cropOpen && cropImageUrl && (
        <div
          className="crop-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cancelCrop();
            }
          }}
        >
          <section
            className="crop-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crop-modal-title"
          >
            <header className="crop-modal-header">
              <div>
                <span className="crop-eyebrow">IMAGE EDITOR</span>
                <h2 id="crop-modal-title">Crop your jewellery</h2>
                <p>Position the jewellery inside the frame.</p>
              </div>

              <button
                type="button"
                className="crop-close-button"
                aria-label="Cancel cropping"
                onClick={cancelCrop}
                disabled={cropLoading}
              >
                ×
              </button>
            </header>

            <div className="crop-editor">
              <Cropper
                image={cropImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                minZoom={1}
                maxZoom={4}
                cropShape="rect"
                showGrid
                restrictPosition
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            <div className="crop-controls">
              <label htmlFor="jewellery-crop-zoom">
                Zoom
                <span>{zoom.toFixed(1)}×</span>
              </label>

              <input
                id="jewellery-crop-zoom"
                type="range"
                min="1"
                max="4"
                step="0.1"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                disabled={cropLoading}
              />

              <p>
                Drag to reposition the image. Use the slider to zoom in or out.
              </p>
            </div>

            {cropError && (
              <p className="crop-error" role="alert">
                {cropError}
              </p>
            )}

            <footer className="crop-modal-actions">
              <button
                type="button"
                className="crop-cancel-button"
                onClick={cancelCrop}
                disabled={cropLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="crop-apply-button"
                onClick={applyCrop}
                disabled={cropLoading || !croppedAreaPixels}
              >
                {cropLoading ? "Preparing Image..." : "Apply Crop"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

export default ImageUpload;
