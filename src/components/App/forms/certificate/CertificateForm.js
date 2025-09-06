import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as CertificateContext } from '../../../../context/CertificateContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import { Trash, Pencil, Loader, Eye } from 'lucide-react';

import LoaderModal from '../../../common/loader/Loader';
import api from '../../../../api/api';
import './CertificateForm.css';

const CertificateForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);
  const {
    state: { certificates, loading: contextLoading, error, uploadSignature },
    fetchCertificates,
    createCertificate,
    editCertificate,
    deleteCertificate,
    clearErrors,
    createUploadSignature,
  } = useContext(CertificateContext);

  const { lastUpdate, hasRecentUpdate, authenticateUser, sendUserActivity } =
    useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewModal, setViewModal] = useState({
    show: false,
    certificate: null,
  });

  // Ref to track last refresh to prevent multiple rapid refreshes
  const lastRefreshTimestamp = useRef(null);

  useEffect(() => {
    const { show } = viewModal;
    if (show) {
      let timer = setTimeout(() => {
        setViewModal({
          show: false,
          certificate: null,
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [viewModal]);

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

  // Update form data when certificates from context changes
  useEffect(() => {
    if (certificates && certificates.length > 0) {
      // If we have data, clear the form for new entry
      setFormData({
        title: '',
      });
      setEditingId(null);
    }
  }, [certificates]);

  // Update form visibility when certificates changes
  useEffect(() => {
    console.log('certificates', certificates);

    // Show form when there are no certificates, hide when there are certificates and not editing
    if (!certificates || certificates.length === 0) {
      setShowForm(true);
    } else if (certificates.length > 0 && !editingId) {
      setShowForm(false);
    }
  }, [certificates, editingId]);

  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'certificate') {
      console.log('Real-time update received for certificates');
      if (hasRecentUpdate) {
        handleRefresh();
      }
    }
  }, [lastUpdate, hasRecentUpdate]);

  // Fetch certificates on component mount
  useEffect(() => {
    fetchCertificates();
  }, []);

  // Scroll to first error field
  const scrollToError = () => {
    const firstErrorField = document.querySelector('.certificate-form .error');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Scroll to top of form
  const scrollToTop = () => {
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Upload file to Cloudinary
  const uploadToCloudinary = async (
    signatureData,
    file,
    resourceType = 'raw'
  ) => {
    console.log('=== UPLOAD TO CLOUDINARY DEBUG ===');
    console.log('file:', file);
    console.log('signatureData:', signatureData);
    console.log('resourceType:', resourceType);

    if (!file || !signatureData) {
      console.error('Missing file or signatureData');
      throw new Error('Missing file or signature data');
    }

    try {
      const { apiKey, signature, timestamp } = signatureData;

      console.log('Upload details:');
      console.log('- File:', file);
      console.log('- File size:', file.size);
      console.log('- File type:', file.type);
      console.log('- API Key:', apiKey);
      console.log('- Signature:', signature);
      console.log('- Timestamp:', timestamp);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      console.log('FormData created, sending to Cloudinary...');

      const uploadUrl =
        resourceType === 'raw'
          ? 'https://api.cloudinary.com/v1_1/cv-cloud/raw/upload'
          : 'https://api.cloudinary.com/v1_1/cv-cloud/image/upload';

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Cloudinary response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary upload failed:', errorText);
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log('Cloudinary upload successful:', result);

      // Return appropriate data based on file type
      if (resourceType === 'raw') {
        return {
          pdfUrl: result.secure_url,
          publicId: result.public_id,
        };
      } else {
        return {
          photoUrl: result.secure_url,
          publicId: result.public_id,
        };
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    const now = Date.now();
    if (
      lastRefreshTimestamp.current &&
      now - lastRefreshTimestamp.current < 2000
    ) {
      return; // Prevent multiple rapid refreshes
    }
    lastRefreshTimestamp.current = now;

    setIsRefreshing(true);
    try {
      await fetchCertificates();
      setSuccessMessage('Certificates refreshed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error refreshing certificates:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Certificate title is required';
    }

    if (!uploadedFile) {
      newErrors.file = 'Certificate document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      scrollToError();
      return;
    }

    try {
      // File upload is required - handle it first
      let fileData = null;
      setIsUploading(true);
      setUploadProgress(0);

      try {
        console.log('Starting file upload process...');
        console.log('File type:', uploadedFile.type);
        console.log('File size:', uploadedFile.size);

        // Get upload signature using API client
        console.log('Getting upload signature...');
        const signatureResponse = await api.post(
          '/api/cloudinary/signature-request-no-preset'
        );

        if (signatureResponse.data.error) {
          throw new Error(signatureResponse.data.error);
        }

        const signature = signatureResponse.data;
        console.log('Signature received:', signature);

        // Upload to Cloudinary using the signature
        console.log('Starting Cloudinary upload...');
        if (uploadedFile.type === 'application/pdf') {
          console.log('Uploading PDF to Cloudinary...');
          fileData = await uploadToCloudinary(signature, uploadedFile, 'raw');
        } else if (uploadedFile.type.startsWith('image/')) {
          console.log('Uploading image to Cloudinary...');
          fileData = await uploadToCloudinary(signature, uploadedFile, 'image');
        } else {
          throw new Error('Unsupported file type');
        }
        console.log('Upload completed, fileData:', fileData);

        setUploadProgress(100);
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        setErrors(prev => ({
          ...prev,
          file: 'Failed to upload file. Please try again.',
        }));
        setIsUploading(false);
        return;
      }

      const certificateData = {
        ...formData,
        ...(fileData && fileData),
      };

      if (editingId) {
        await editCertificate(editingId, certificateData);
        setSuccessMessage('Certificate updated successfully!');
      } else {
        await createCertificate(certificateData);
        setSuccessMessage('Certificate added successfully!');
      }

      // Clear form
      setFormData({
        title: '',
      });
      setUploadedFile(null);
      setFilePreview(null);
      setEditingId(null);
      setErrors({});
      setIsUploading(false);
      setUploadProgress(0);

      // Send user activity
      sendUserActivity('certificate', editingId ? 'updated' : 'created');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving certificate:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle edit
  const handleEdit = certificate => {
    setFormData({
      title: certificate.title || '',
    });
    setEditingId(certificate._id);
    setShowForm(true);
    scrollToTop();
  };

  // Handle delete click - show confirmation
  const handleDeleteClick = certificateId => {
    setDeletingId(certificateId);
  };

  // Confirm delete
  const confirmDelete = async certificate => {
    try {
      await deleteCertificate({
        id: certificate._id,
        publicId: certificate.publicId,
      });
      setSuccessMessage('Certificate deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Send user activity
      sendUserActivity('certificate', 'deleted');
    } catch (error) {
      console.error('Error deleting certificate:', error);
      setErrors({ submit: 'Failed to delete certificate. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeletingId(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setFormData({
      title: '',
    });
    setUploadedFile(null);
    setFilePreview(null);
    setEditingId(null);
    setErrors({});
    setShowForm(false);
  };

  // Modal handling
  const openViewModal = certificate => {
    console.log('Opening modal for certificate:', certificate);
    console.log('Photo URL:', certificate.photoUrl);
    console.log('PDF URL:', certificate.pdfUrl);

    // If it's an image (not a placeholder), automatically open it in a new tab
    if (
      certificate.photoUrl &&
      !certificate.photoUrl.startsWith('https://example.com') &&
      (certificate.photoUrl.startsWith('data:') ||
        certificate.photoUrl.startsWith('http://') ||
        certificate.photoUrl.startsWith('https://'))
    ) {
      try {
        window.open(certificate.photoUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Error opening image:', error);
      }
    }

    // If it's a PDF (not a placeholder), automatically open it in a new tab
    if (
      certificate.pdfUrl &&
      !certificate.pdfUrl.startsWith('https://example.com')
    ) {
      try {
        window.open(certificate.pdfUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Error opening PDF:', error);
      }
    }

    setViewModal({ show: true, certificate });
  };

  const closeViewModal = () => {
    setViewModal({ show: false, certificate: null });
  };

  // File upload handling
  const handleFileSelect = e => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        file: 'Please select a PDF or image file (JPEG, PNG)',
      }));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'File size must be less than 5MB' }));
      return;
    }

    setUploadedFile(file);
    setErrors(prev => ({ ...prev, file: null }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
    setErrors(prev => ({ ...prev, file: null }));
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
      // Simulate file input change
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  };

  // Format date for display
  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (contextLoading) {
    return <LoaderModal loading={contextLoading} />;
  }

  return (
    <div className="certificate-form" ref={formTopRef}>
      <div className="certificate-form-header">
        <div className="certificate-form-header-icon">🏆</div>
        <div className="certificate-form-header-content">
          <h2>Certificates & Achievements</h2>
          <p>
            Add your professional certifications, licenses, and achievements
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="success-message" style={{ marginTop: '20px' }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginTop: '20px' }}>
          {error}
        </div>
      )}

      {/* Add Certificate Section */}
      <div className="certificate-add-section">
        <div className="section-header">
          <h3>Add New Certificate</h3>
          <button
            type="button"
            className="toggle-form-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Hide Form' : 'Add Certificate'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group full-width">
              <label htmlFor="title">Certificate Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="e.g., AWS Certified Solutions Architect"
              />
              {errors.title && (
                <span className="error-text">{errors.title}</span>
              )}
            </div>

            {/* File Upload Section */}
            <div className="form-group full-width">
              <label htmlFor="file">Certificate Document *</label>
              <div className="file-upload-container">
                {!uploadedFile ? (
                  <div
                    className="file-upload-area"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="file-input"
                    />
                    <div className="file-upload-content">
                      <div className="file-upload-icon">📄</div>
                      <p className="file-upload-text">
                        <strong>Click to upload</strong> or drag and drop
                      </p>
                      <p className="file-upload-hint">
                        PDF, JPEG, or PNG (max 5MB) -{' '}
                        <span className="required-text">Required</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="file-preview-container">
                    {filePreview ? (
                      <div className="image-preview">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="preview-image"
                        />
                        <div className="file-info">
                          <p className="file-name">{uploadedFile.name}</p>
                          <p className="file-size">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="pdf-preview">
                        <div className="pdf-icon">📄</div>
                        <div className="file-info">
                          <p className="file-name">{uploadedFile.name}</p>
                          <p className="file-size">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={removeFile}
                    >
                      Remove
                    </button>
                  </div>
                )}
                {errors.file && (
                  <span className="error-text">{errors.file}</span>
                )}

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="upload-progress-container">
                    <div className="upload-progress-bar">
                      <div
                        className="upload-progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="upload-progress-text">
                      Uploading file... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={contextLoading || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader className="spinner" />
                    Uploading... {uploadProgress}%
                  </>
                ) : contextLoading ? (
                  <>
                    <Loader className="spinner" />
                    {editingId ? 'Updating...' : 'Adding...'}
                  </>
                ) : editingId ? (
                  'Update Certificate'
                ) : (
                  'Add Certificate'
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Certificates List */}
      {certificates && certificates.length > 0 && (
        <div className="certificates-list">
          <div className="list-header">
            <h3>Your Certificates</h3>
            <button
              type="button"
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? <Loader className="spinner" /> : 'Refresh'}
            </button>
          </div>

          {certificates.map(certificate => (
            <div key={certificate._id} className="certificate-item">
              <div className="certificate-content">
                <div className="certificate-title-section">
                  <h4 className="certificate-title">{certificate.title}</h4>
                </div>

                <div className="certificate-details-section">
                  {certificate.pdfUrl && (
                    <p className="file-type">
                      <strong>📄 PDF Document</strong>
                    </p>
                  )}
                  {certificate.photoUrl && (
                    <p className="file-type">
                      <strong>📸 Photo Document</strong>
                    </p>
                  )}
                  {certificate.lastUpdate && (
                    <p className="last-update">
                      <strong>Last Updated:</strong>{' '}
                      {formatDate(certificate.lastUpdate)}
                    </p>
                  )}
                </div>

                <div className="certificate-actions-section">
                  {deletingId === certificate._id ? (
                    <div className="delete-confirmation">
                      <div className="delete-confirmation-text-container">
                        <span className="delete-confirmation-text">
                          Delete this certificate?
                        </span>
                      </div>
                      <div className="delete-confirmation-buttons">
                        <button
                          type="button"
                          className="confirm-delete-button"
                          onClick={() => confirmDelete(certificate)}
                        >
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          className="cancel-delete-button"
                          onClick={cancelDelete}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="certificate-actions">
                      <button
                        type="button"
                        className="action-btn view-btn"
                        onClick={() => openViewModal(certificate)}
                        title="View Certificate"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(certificate)}
                        title="Edit Certificate"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteClick(certificate._id)}
                        title="Delete Certificate"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Certificates Message */}
      {certificates && certificates.length === 0 && !showForm && (
        <div className="no-certificates">
          <p>
            No certificates added yet. Add your first certificate to get
            started!
          </p>
        </div>
      )}

      {/* View Certificate Modal */}
      {viewModal.show && viewModal.certificate && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewModal.certificate.title}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeViewModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="document-links">
                {viewModal.certificate.pdfUrl && (
                  <div className="document-link-item">
                    <h4>📄 PDF Document</h4>
                    {viewModal.certificate.pdfUrl.startsWith(
                      'https://example.com'
                    ) ? (
                      <div className="document-placeholder">
                        <p>PDF Document Ready</p>
                        <p className="placeholder-note">
                          This is a placeholder URL. In production, the actual
                          PDF will be available here.
                        </p>
                      </div>
                    ) : (
                      <div className="document-action">
                        <p>✅ PDF opened in new tab automatically!</p>
                        <p className="pdf-opened-note">
                          If the PDF didn't open, click the button below:
                        </p>
                        <a
                          href={viewModal.certificate.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                        >
                          Open PDF in New Tab
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {viewModal.certificate.photoUrl && (
                  <div className="document-link-item">
                    <h4>📸 Photo Document</h4>
                    {viewModal.certificate.photoUrl.startsWith(
                      'https://example.com'
                    ) ? (
                      <div className="document-placeholder">
                        <p>Photo Document Ready</p>
                        <p className="placeholder-note">
                          This is a placeholder URL. In production, the actual
                          image will be available here.
                        </p>
                      </div>
                    ) : viewModal.certificate.photoUrl.startsWith('data:') ||
                      viewModal.certificate.photoUrl.startsWith('http://') ||
                      viewModal.certificate.photoUrl.startsWith('https://') ? (
                      <div className="document-action">
                        <p>✅ Image opened in new tab automatically!</p>
                        <p className="image-opened-note">
                          If the image didn't open, click the button below:
                        </p>
                        <a
                          href={viewModal.certificate.photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                        >
                          Open Image in New Tab
                        </a>
                      </div>
                    ) : (
                      <div className="document-action">
                        <p>
                          Click the button below to view the image in a new tab:
                        </p>
                        <a
                          href={viewModal.certificate.photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                        >
                          Open Image in New Tab
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeViewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateForm;
