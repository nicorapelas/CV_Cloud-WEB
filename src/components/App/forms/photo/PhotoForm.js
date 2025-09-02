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
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = e => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
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
      <div className="form-header">
        <div className="form-header-icon">📷</div>
        <h2>Profile Photo</h2>
        <p>Upload and manage your profile photos</p>
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
          <input
            type="file"
            id="photo-file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <small className="form-help-text">
            Supported formats: JPG, PNG, GIF. Max size: 10MB.
          </small>
        </div>

        {previewUrl && (
          <div className="photo-preview">
            <img src={previewUrl} alt="Preview" />
          </div>
        )}

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
                      <>
                        <button
                          onClick={() =>
                            handleDeletePhoto(photo._id, photo.publicId)
                          }
                          className="photo-action-button delete-confirm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={handleDeleteCancel}
                          className="photo-action-button cancel"
                        >
                          Cancel
                        </button>
                      </>
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
