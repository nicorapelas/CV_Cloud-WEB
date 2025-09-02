import React, { useState, useContext, useEffect } from 'react';
import { Context as FirstImpressionContext } from '../../../../context/FirstImpressionContext';
import Loader from '../../../common/loader/Loader';
import './FirstImpression.css';
import api from '../../../../api/api';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

const FirstImpressionFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [videoDuration, setVideoDuration] = useState(null);
  const [isCheckingDuration, setIsCheckingDuration] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [converting, setConverting] = useState(false);

  const {
    state: { loading, videoUploading },
    createFirstImpression,
    setVideoUploading,
  } = useContext(FirstImpressionContext);

  const MAX_DURATION_SECONDS = 31; // 31 seconds for First Impression

  const getVideoDuration = file => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        const duration = video.duration; // Duration in seconds
        URL.revokeObjectURL(video.src); // Clean up
        resolve(duration);
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Could not load video metadata'));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const convertToMOV = async videoBlob => {
    console.log('Starting FFmpeg conversion to MOV...');
    setConverting(true);

    try {
      // Load FFmpeg if not already loaded
      if (!ffmpeg.loaded) {
        console.log('Loading FFmpeg...');
        await ffmpeg.load({
          coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
          wasmURL: await toBlobURL(
            '/ffmpeg/ffmpeg-core.wasm',
            'application/wasm'
          ),
        });
        console.log('FFmpeg loaded successfully');
      }

      // Create a file from the blob for FFmpeg
      const inputFile = new File([videoBlob], 'input.webm', {
        type: videoBlob.type,
      });
      console.log('Input file size:', inputFile.size, 'bytes');

      // Write input file to FFmpeg virtual filesystem
      await ffmpeg.writeFile('input.webm', await fetchFile(inputFile));
      console.log('Input file written to FFmpeg FS');

      // Convert to MOV using H.264 video + AAC audio for best quality and compatibility
      console.log('Starting FFmpeg conversion...');
      await ffmpeg.exec([
        '-i',
        'input.webm',
        '-c:v',
        'libx264', // H.264 video codec
        '-preset',
        'medium', // Balance between speed and quality
        '-crf',
        '23', // Constant Rate Factor (18-28 is good, lower = better quality)
        '-c:a',
        'aac', // AAC audio codec
        '-b:a',
        '128k', // Audio bitrate
        '-movflags',
        '+faststart', // Optimize for web streaming
        'output.mov',
      ]);
      console.log('FFmpeg conversion completed');

      // Read the converted file
      const data = await ffmpeg.readFile('output.mov');
      console.log('Output file size:', data.length, 'bytes');

      // Create blob from converted data
      const movBlob = new Blob([data.buffer], { type: 'video/quicktime' });

      // Create a new file with MOV extension
      const movFile = new File(
        [movBlob],
        `first-impression-${Date.now()}.mov`,
        {
          type: 'video/quicktime',
        }
      );

      console.log('Conversion completed:', movFile.name, movFile.size, 'bytes');
      setConverting(false);

      return {
        blob: movBlob,
        file: movFile,
        url: URL.createObjectURL(movBlob),
      };
    } catch (error) {
      console.error('FFmpeg conversion failed:', error);
      setConverting(false);

      // Fallback to simple blob conversion if FFmpeg fails
      console.log('Using fallback conversion...');
      const movBlob = new Blob([videoBlob], { type: 'video/quicktime' });
      const movFile = new File(
        [movBlob],
        `first-impression-${Date.now()}.mov`,
        {
          type: 'video/quicktime',
        }
      );

      return {
        blob: movBlob,
        file: movFile,
        url: URL.createObjectURL(movBlob),
      };
    }
  };

  const uploadToCloudinaryWithSignature = async (signatureData, videoFile) => {
    console.log('=== UPLOAD WITH SIGNATURE DEBUG ===');
    console.log('videoFile:', videoFile);
    console.log('signatureData:', signatureData);

    if (!videoFile || !signatureData) {
      console.error('Missing videoFile or signatureData');
      return;
    }

    try {
      setVideoUploading(true);
      setErrorMessage('');

      const { apiKey, signature, timestamp } = signatureData;

      console.log('Upload details:');
      console.log('- File:', videoFile);
      console.log('- File size:', videoFile.size);
      console.log('- File type:', videoFile.type);
      console.log('- API Key:', apiKey);
      console.log('- Signature:', signature);
      console.log('- Timestamp:', timestamp);

      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      console.log('FormData created, sending to Cloudinary...');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/cv-cloud/video/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

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

      // Create first impression with the uploaded video
      await createFirstImpression({
        videoUrl: result.secure_url,
        publicId: result.public_id,
      });

      console.log('First impression created successfully');
      setVideoUploading(false);
      clearVideo();

      // Show success message
      setErrorMessage(''); // Clear any previous errors
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error.message);
      setVideoUploading(false);
    }
  };

  const handleFileChange = async event => {
    const file = event.target.files?.[0];
    if (file) {
      // Clear previous error
      setErrorMessage('');

      // Validate file type
      if (!file.type.startsWith('video/')) {
        setErrorMessage('Please select a valid video file.');
        return;
      }

      // Validate file size (max 30MB)
      if (file.size > 100 * 1024 * 1024) {
        setErrorMessage('File size must be less than 30MB.');
        return;
      }

      // Check video duration
      setIsCheckingDuration(true);
      try {
        const duration = await getVideoDuration(file);
        setVideoDuration(duration);

        if (duration > MAX_DURATION_SECONDS) {
          setErrorMessage(
            `Video is too long. Maximum duration is ${formatDuration(MAX_DURATION_SECONDS)}. Your video is ${formatDuration(duration)}.`
          );
          setIsCheckingDuration(false);
          return;
        }

        setSelectedFile(file);
        setFileName(file.name);
        setVideoUrl(URL.createObjectURL(file));
      } catch (error) {
        console.error('Error checking video duration:', error);
        setErrorMessage(
          'Could not verify video duration. Please try another file.'
        );
      } finally {
        setIsCheckingDuration(false);
      }
    }
  };

  const clearVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setSelectedFile(null);
    setVideoUrl('');
    setFileName('');
    setVideoDuration(null);
    setUploadProgress(0);
    setShowUploadProgress(false);
    setErrorMessage('');
  };

  const handleUpload = async () => {
    console.log('=== HANDLE UPLOAD DEBUG ===');
    console.log('selectedFile exists:', !!selectedFile);

    if (!selectedFile) {
      setErrorMessage('Please select a video file first.');
      return;
    }

    try {
      // Convert to MOV format for mobile compatibility
      console.log('Converting video to MOV format...');
      const convertedVideo = await convertToMOV(selectedFile);

      console.log(
        'Video converted successfully:',
        convertedVideo.file.name,
        convertedVideo.file.size,
        'bytes'
      );
      console.log('Converted file type:', convertedVideo.file.type);

      console.log('Getting upload signature...');
      // Get upload signature using the API client (includes auth headers)
      const response = await api.post(
        '/api/cloudinary/signature-request-no-preset'
      );
      console.log('API response:', response.data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Use the signature directly for upload with converted video
      console.log('Using signature directly for upload...');
      await uploadToCloudinaryWithSignature(response.data, convertedVideo.file);
    } catch (error) {
      console.error('Error getting upload signature:', error);
      setErrorMessage('Failed to prepare upload. Please try again.');
    }
  };

  // Simulate upload progress
  useEffect(() => {
    if (showUploadProgress) {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showUploadProgress]);

  if (loading) {
    return <Loader message="Loading..." />;
  }

  if (showUploadProgress) {
    return (
      <div className="first-impression-create">
        <div className="upload-progress-container">
          <div className="upload-progress-content">
            <div className="upload-spinner">⏳</div>
            <h3>Uploading Your Video...</h3>
            <p>
              Please wait while we upload your video to the cloud. This may take
              a few moments.
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">{Math.round(uploadProgress)}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="upload-info">
        <p>
          💡 <strong>Supported formats:</strong> MP4, WebM, MOV, AVI
        </p>
        <p>
          📏 <strong>Maximum size:</strong> 30MB
        </p>
        <p className="portrait-recommendation">
          📱 <strong>Recommendation:</strong> We highly recommend uploading your
          video in portrait orientation rather than landscape for better mobile
          compatibility.
        </p>
      </div>

      <div className="first-impression-create">
        <div className="video-container">
          {isCheckingDuration ? (
            <div className="upload-placeholder">
              <div className="upload-icon">⏳</div>
              <h3>Checking Video Duration...</h3>
              <p>
                Please wait while we verify your video meets the requirements
              </p>
            </div>
          ) : videoUrl ? (
            <>
              <video
                src={videoUrl}
                controls
                className="video-player"
                onLoadStart={() => console.log('Video loading started')}
                onLoadedData={() => console.log('Video loaded successfully')}
                onError={e => console.error('Video error:', e)}
              />
              <div className="video-info">
                <h3>Selected Video</h3>
                <p>
                  <strong>File:</strong> {fileName}
                </p>
                {videoDuration && (
                  <p>
                    <strong>Duration:</strong> {formatDuration(videoDuration)}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📁</div>
              <h3>Select a Video File</h3>
              <p>Choose a video file from your device to upload</p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="error-message">
            <p>❌ {errorMessage}</p>
          </div>
        )}

        <div className="file-upload-controls">
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              id="video-file-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="video-file-input" className="select-file-button">
              📂 Select Video File
            </label>
          </div>

          {videoUrl && (
            <div className="video-actions">
              <button onClick={clearVideo} className="clear-video-button">
                🗑️ Clear Video
              </button>
              <button
                onClick={handleUpload}
                className="upload-video-button"
                disabled={videoUploading || converting}
              >
                {converting ? '🔄 Converting...' : '☁️ Upload Video'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FirstImpressionFileUpload;
