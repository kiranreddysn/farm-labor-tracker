import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, ZoomIn, ZoomOut, Check } from "lucide-react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/image-utils";

type ImageUploaderProps = {
  initialImage?: string;
  onImageChange: (imageDataUrl: string | undefined) => void;
};

export function ImageUploader({
  initialImage,
  onImageChange,
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | undefined>(initialImage);

  // Update image when initialImage changes (for editing)
  useEffect(() => {
    if (initialImage) {
      setImage(initialImage);
    }
  }, [initialImage]);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async (e: React.MouseEvent) => {
    // Prevent event propagation to avoid dialog closing
    e.preventDefault();
    e.stopPropagation();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      setShowCamera(true);

      // Use setTimeout to ensure the video element is mounted before setting srcObject
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const takePhoto = (e: React.MouseEvent) => {
    // Prevent event propagation to avoid dialog closing
    e.preventDefault();
    e.stopPropagation();

    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImage(dataUrl);
        setShowCropper(true);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const saveCroppedImage = async (e: React.MouseEvent) => {
    // Prevent event propagation to avoid dialog closing
    e.preventDefault();
    e.stopPropagation();

    try {
      if (image && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        setImage(croppedImage);
        onImageChange(croppedImage);
        setShowCropper(false);
      }
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  };

  const cancelCrop = () => {
    setShowCropper(false);
    if (!initialImage) {
      setImage(undefined);
    } else {
      setImage(initialImage);
    }
  };

  const removeImage = () => {
    setImage(undefined);
    onImageChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {!showCropper && !showCamera && (
        <div className="flex flex-col items-center">
          {image ? (
            <div className="relative mb-4">
              <img
                src={image}
                alt="Worker"
                className="w-32 h-32 rounded-full object-cover border-2 border-green-200"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
              <span className="text-gray-400">No Image</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCameraCapture}
              className="flex items-center gap-1"
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      )}

      {showCamera && (
        <div className="relative w-full max-w-md mx-auto">
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={stopCamera}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={takePhoto}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
            >
              <Camera className="h-4 w-4" />
              Capture
            </Button>
          </div>
        </div>
      )}

      {showCropper && image && (
        <div className="relative w-full max-w-md mx-auto">
          <div className="relative h-64 bg-black rounded-lg overflow-hidden">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.max(1, zoom - 0.1))}
              disabled={zoom <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-32"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={cancelCrop}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={saveCroppedImage}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
