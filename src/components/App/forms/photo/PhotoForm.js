import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as PhotoContext } from '../../../../context/PhotoContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import Loader from '../../../common/loader/Loader';
import './PhotoForm.css';

const PhotoForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);

  const {
    state: {
      photos,
      assignedPhotoUrl,
      loading: contextLoading,
      error: contextError,
      uploadSignature,
    },
    fetchPhotos,
    fetchAssignedPhoto,
    createPhoto,
    createUploadSignature,
    clearUploadSignature,
    assignPhoto,
    deletePhoto,
  } = useContext(PhotoContext);

  // Real-time context
  const { lastUpdate, hasRecentUpdate } = useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    photoUrl: '',
    publicId: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Scroll to top when component mounts
  useEffect(() => {
    // Cross-browser compatible scroll to top
    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        // Modern browsers with smooth scrolling support
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback for older browsers or Firefox issues
        window.scrollTo(0, 0);
      }
    };

    // Small delay to ensure component is fully rendered
    setTimeout(scrollToTop, 100);
  }, []);

  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      fetchPhotos();
      fetchAssignedPhoto();
    }
  }, [user, fetchPhotos, fetchAssignedPhoto]);

  // Handle real-time updates
  useEffect(() => {
    if (hasRecentUpdate('photo')) {
      console.log('🔄 PhotoForm: Real-time update detected, refreshing data');
      fetchPhotos();
      fetchAssignedPhoto();
    }
  }, [lastUpdate, hasRecentUpdate, fetchPhotos, fetchAssignedPhoto]);

  // Handle upload signature for Cloudinary upload
  useEffect(() => {
    if (uploadSignature) {
      uploadToCloudinary();
    }
  }, [uploadSignature]);

  // Handle file selection
  const handleFileSelect = async e => {
    const file = e.target.files[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Image compression utility function
  const compressImage = (file, maxWidth = 1200, quality = 0.3) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          blob => {
            if (blob) {
              // Create a new file with the compressed blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Process selected file (shared by file input and drag & drop)
  const processSelectedFile = async file => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ file: 'Please select an image file' });
      return;
    }

    // Validate file size (max 10MB for Cloudinary)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ file: 'File size must be less than 10MB' });
      return;
    }

    setErrors({});

    try {
      // Show compression progress
      setUploading(true);

      // Compress the image (resize to max 1200px width, 30% quality, convert to JPEG)
      const compressedFile = await compressImage(file, 1200, 0.3);

      console.log('Image compression results:');
      console.log('Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log(
        'Compressed size:',
        (compressedFile.size / 1024 / 1024).toFixed(2),
        'MB'
      );
      console.log(
        'Compression ratio:',
        ((1 - compressedFile.size / file.size) * 100).toFixed(1),
        '%'
      );

      setSelectedFile(compressedFile);

      // Create preview URL from compressed file
      const reader = new FileReader();
      reader.onload = e => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Image compression error:', error);
      setErrors({ file: 'Failed to process image. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop functionality
  const handleDragOver = e => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = e => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processSelectedFile(file);
    }
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async () => {
    if (!selectedFile || !uploadSignature) return;

    try {
      const { apiKey, signature, timestamp } = uploadSignature;
      const data = new FormData();

      data.append('file', selectedFile);
      data.append('api_key', apiKey);
      data.append('signature', signature);
      data.append('timestamp', timestamp);
      data.append('upload_preset', 'photo');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/cv-cloud/image/upload',
        {
          method: 'POST',
          body: data,
        }
      );

      const result = await response.json();

      if (result.error) {
        clearUploadSignature();
        setErrors({ upload: 'Unable to upload image, please try again later' });
        return;
      }

      // Create photo with Cloudinary URL
      await createPhoto({
        title: formData.title,
        photoUrl: result.url,
        publicId: result.public_id,
      });

      clearUploadSignature();
      setSuccessMessage('Photo uploaded successfully!');
      setFormData({ title: '', photoUrl: '', publicId: '' });
      setSelectedFile(null);
      setPreviewUrl('');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      clearUploadSignature();
      setErrors({ upload: 'Unable to upload image, please try again later' });
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    if (!selectedFile) {
      setErrors({ file: 'Please select a photo to upload' });
      return;
    }

    if (!formData.title.trim()) {
      setErrors({ title: 'Please enter a title for the photo' });
      return;
    }

    setUploading(true);
    setErrors({});

    try {
      // Get upload signature from server
      await createUploadSignature();
    } catch (error) {
      console.error('Error getting upload signature:', error);
      setErrors({ upload: 'Failed to prepare upload. Please try again.' });
      setUploading(false);
    }
  };

  // Handle photo assignment
  const handleAssignPhoto = async photoId => {
    try {
      await assignPhoto(photoId);
      setSuccessMessage('Photo assigned successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error assigning photo:', error);
      setErrors({ assign: 'Failed to assign photo. Please try again.' });
    }
  };

  // Handle photo deletion
  const handleDeletePhoto = async (photoId, publicId) => {
    try {
      await deletePhoto({ id: photoId, publicId });
      setSuccessMessage('Photo deleted successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting photo:', error);
      setErrors({ delete: 'Failed to delete photo. Please try again.' });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (photoId, publicId) => {
    setDeletingPhotoId(photoId);
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeletingPhotoId(null);
  };

  // Camera functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user', // Front camera
        },
      });

      setCameraStream(stream);
      setShowCamera(true);

      // Wait for the video element to be ready
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Ensure the video loads and plays
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(console.error);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrors({
        camera: 'Unable to access camera. Please check permissions.',
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(
      async blob => {
        if (blob) {
          // Create a file from the blob
          const timestamp = Date.now();
          const fileName = `camera-photo-${timestamp}.jpg`;
          const file = new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          // Process the captured photo
          await processSelectedFile(file);

          // Stop camera
          stopCamera();
        }
      },
      'image/jpeg',
      0.8
    );
  };

  // Handle video element when camera becomes visible
  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = cameraStream;

      video.onloadedmetadata = () => {
        video.play().catch(console.error);
      };

      video.onerror = e => {
        console.error('Video error:', e);
      };
    }
  }, [showCamera, cameraStream]);

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  if (contextLoading) {
    return <Loader message={uploading ? 'Uploading image...' : 'Loading...'} />;
  }

  return (
    <div className="photo-form-container" ref={formTopRef}>
      <div className="photo-form-header">
        <div className="photo-form-header-icon">📷</div>
        <div className="photo-form-header-content">
          <h2>Profile Photo</h2>
          <p>Upload and manage your profile photos</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="form-success-message">{successMessage}</div>
      )}

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <div className="form-errors">
          {Object.values(errors).map((error, index) => (
            <div key={index} className="form-error-message">
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="photo-upload-form">
        <div className="form-group">
          <label htmlFor="photo-file">Select Photo:</label>

          {/* Camera Interface */}
          {showCamera && (
            <div className="photo-form-camera-container">
              <div className="photo-form-camera-preview">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="photo-form-camera-video"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
              <div className="photo-form-camera-controls">
                <button
                  type="button"
                  className="photo-form-camera-button capture"
                  onClick={capturePhoto}
                >
                  📸 Capture Photo
                </button>
                <button
                  type="button"
                  className="photo-form-camera-button cancel"
                  onClick={stopCamera}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}

          {/* File Upload Interface */}
          {!showCamera && (
            <div className="file-upload-container">
              {uploading && !selectedFile ? (
                <div className="file-upload-area compressing">
                  <div className="file-upload-content">
                    <div className="file-upload-icon">⚙️</div>
                    <p className="file-upload-text">
                      <strong>Compressing image...</strong>
                    </p>
                    <p className="file-upload-hint">
                      Please wait while we optimize your image for upload
                    </p>
                  </div>
                </div>
              ) : !selectedFile ? (
                <div className="photo-form-upload-options">
                  <div
                    className="file-upload-area"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="photo-file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="file-input"
                      disabled={uploading}
                    />
                    <div className="file-upload-content">
                      <div className="file-upload-icon">📁</div>
                      <p className="file-upload-text">
                        <strong>Click to upload</strong> or drag and drop
                      </p>
                      <p className="file-upload-hint">
                        JPG, PNG, or GIF (max 10MB) -{' '}
                        <span className="required-text">Required</span>
                      </p>
                      <p className="file-upload-compression-note">
                        Images will be automatically compressed for optimal
                        upload
                      </p>
                    </div>
                  </div>

                  <div className="photo-form-upload-divider">
                    <span>OR</span>
                  </div>

                  <button
                    type="button"
                    className="photo-form-camera-upload-button"
                    onClick={startCamera}
                    disabled={uploading}
                  >
                    <div className="photo-form-camera-upload-content">
                      <div className="photo-form-camera-upload-icon">📷</div>
                      <p className="photo-form-camera-upload-text">
                        <strong>Take Photo</strong>
                      </p>
                      <p className="photo-form-camera-upload-hint">
                        Use your camera to take a new photo
                      </p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="file-preview-container">
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                  <div className="file-preview-info">
                    <p className="file-name">{selectedFile.name}</p>
                    <p className="file-size">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      <span className="compression-badge">Compressed</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                      setErrors({});
                    }}
                    disabled={uploading}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="photo-title">Photo Title:</label>
          <input
            type="text"
            id="photo-title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a title for your photo"
            disabled={uploading}
            maxLength={100}
          />
          <small className="form-help-text">
            {formData.title.length}/100 characters
          </small>
        </div>

        <button
          type="submit"
          className="form-button"
          disabled={uploading || !selectedFile || !formData.title.trim()}
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </form>

      {/* Currently Assigned Photo */}
      {assignedPhotoUrl && assignedPhotoUrl !== 'noneAssigned' && (
        <div className="assigned-photo-section">
          <h3>Currently Assigned Photo</h3>
          <div className="assigned-photo">
            <img src={assignedPhotoUrl} alt="Assigned Photo" />
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos && photos.length > 0 && (
        <div className="photo-grid-section">
          <h3>Your Photos</h3>
          <div className="photo-grid">
            {photos.map(photo => (
              <div key={photo._id} className="photo-item">
                <img src={photo.photoUrl} alt={photo.title} />
                <div className="photo-actions">
                  <h4>{photo.title}</h4>
                  <div className="photo-buttons">
                    {deletingPhotoId !== photo._id && (
                      <button
                        onClick={() => handleAssignPhoto(photo._id)}
                        className="photo-action-button assign"
                        disabled={assignedPhotoUrl === photo.photoUrl}
                      >
                        {assignedPhotoUrl === photo.photoUrl
                          ? 'Assigned'
                          : 'Assign'}
                      </button>
                    )}
                    {deletingPhotoId === photo._id ? (
                      <div className="delete-confirmation">
                        <div className="delete-confirmation-text-container">
                          <span className="delete-confirmation-text">
                            Delete this photo?
                          </span>
                        </div>
                        <div className="delete-confirmation-buttons">
                          <button
                            onClick={() =>
                              handleDeletePhoto(photo._id, photo.publicId)
                            }
                            className="confirm-delete-button"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={handleDeleteCancel}
                            className="cancel-delete-button"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleDeleteConfirm(photo._id, photo.publicId)
                        }
                        className="photo-action-button delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Photos Message */}
      {(!photos || photos.length === 0) && (
        <div className="no-photos-message">
          <p>No photos uploaded yet. Upload your first photo above!</p>
        </div>
      )}
    </div>
  );
};

export default PhotoForm;
