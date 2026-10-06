import { useEffect, useRef, useState } from "react";

function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [error, setError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        setError("");
        setCameraReady(false);

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not supported by this browser.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });

          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          try {
            await videoRef.current.play();
          } catch (playError) {
            console.error("Video play error:", playError);
          }

          if (mounted) {
            setCameraReady(true);
          }
        }
      } catch (cameraError) {
        console.error("Camera error:", cameraError);

        if (mounted) {
          setError(
            "Unable to access the camera. Please allow camera permission and try again.",
          );
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;

      stopCamera();
    };
  }, []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    setCameraReady(false);
  }

  function closeCamera() {
    stopCamera();
    onClose?.();
  }

  function capturePhoto() {
    if (isCapturing) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      setError("Camera is still starting. Please wait a moment and try again.");

      return;
    }

    try {
      setIsCapturing(true);

      const canvas = document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create image canvas.");
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsCapturing(false);

            setError("Unable to capture the photo. Please try again.");

            return;
          }

          const file = new File([blob], `jewellery-${Date.now()}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          /*
           * IMPORTANT:
           *
           * Stop the camera BEFORE closing the modal.
           */
          stopCamera();

          /*
           * Send the captured File to AddJewelleryPage.
           */
          onCapture?.(file);

          /*
           * Close the camera popup.
           */
          onClose?.();
        },
        "image/jpeg",
        0.92,
      );
    } catch (captureError) {
      console.error("Capture error:", captureError);

      setIsCapturing(false);

      setError("Unable to capture the photo. Please try again.");
    }
  }

  return (
    <div
      className="camera-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeCamera();
        }
      }}
    >
      <div className="camera-modal">
        {/* HEADER */}

        <div className="camera-header">
          <div>
            <span>Camera</span>

            <h2>Take a jewellery photo</h2>
          </div>

          <button
            type="button"
            className="camera-close"
            onClick={closeCamera}
            disabled={isCapturing}
            aria-label="Close camera"
          >
            ×
          </button>
        </div>

        {/* CAMERA */}

        {error ? (
          <div className="camera-error">
            <p>{error}</p>

            <button
              type="button"
              className="camera-error-button"
              onClick={closeCamera}
            >
              Close Camera
            </button>
          </div>
        ) : (
          <div className="camera-preview">
            <video ref={videoRef} playsInline muted autoPlay />

            <div className="camera-frame" />

            {!cameraReady && (
              <div className="camera-loading">
                <div className="camera-loading-spinner" />

                <span>Starting camera...</span>
              </div>
            )}
          </div>
        )}

        {/* CONTROLS */}

        {!error && (
          <div className="camera-controls">
            <button
              type="button"
              className="camera-capture"
              onClick={capturePhoto}
              disabled={!cameraReady || isCapturing}
              aria-label="Take photo"
            >
              <span />
            </button>

            <span className="camera-capture-label">
              {isCapturing ? "Capturing..." : "Tap to capture"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraModal;
