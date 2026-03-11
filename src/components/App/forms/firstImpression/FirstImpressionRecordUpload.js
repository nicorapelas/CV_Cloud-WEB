import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { Context as FirstImpressionContext } from '../../../../context/FirstImpressionContext';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as NavContext } from '../../../../context/NavContext';
import { useNavigate } from 'react-router-dom';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { uploadMessages } from './uploadingMessagesArray';
import Loader from '../../../common/loader/Loader';
import keys from '../../../../config/keys';
import './FirstImpression.css';

const FirstImpressionRecordUpload = ({ onUploadingChange }) => {
  const {
    state: { videoDemoUrl, firstImpressionStatus, loading: contextLoading },
    fetchFirsImpressionStatus,
    fetchDemoVideoUrl,
    fetchFirstImpression,
  } = useContext(FirstImpressionContext);
  const {
    state: { user, loading: authLoading },
  } = useContext(AuthContext);
  const { setNavTabSelected } = useContext(NavContext);
  const navigate = useNavigate();

  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [mediaStream, setMediaStream] = useState(null);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Timing and messaging state
  const [uploadStartTime, setUploadStartTime] = useState(null);
  const [conversionStartTime, setConversionStartTime] = useState(null);
  const [uploadTimes, setUploadTimes] = useState({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentStage, setCurrentStage] = useState('');

  // Refs
  const videoRef = useRef(null);
  const playbackVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingMimeTypeRef = useRef('video/webm');
  const ffmpegRef = useRef(new FFmpeg());
  const demoUrlFetchedRef = useRef(false);
  const [pendingDemoOpen, setPendingDemoOpen] = useState(false);

  // Monitor videoDemoUrl changes for demo opening

  // Watch for videoDemoUrl changes and open demo if pending
  useEffect(() => {
    if (pendingDemoOpen && videoDemoUrl) {
      setPendingDemoOpen(false);
      openDemoVideo();
    }
  }, [videoDemoUrl, pendingDemoOpen]);

  // Check for auto-play demo flag from Dashboard navigation
  useEffect(() => {
    const autoPlayDemo = sessionStorage.getItem('autoPlayDemo');
    if (autoPlayDemo === 'true') {
      sessionStorage.removeItem('autoPlayDemo'); // Clear the flag

      // Wait 1 second for the component to fully load, then trigger demo
      setTimeout(() => {
        playDemo();
      }, 1000);
    }
  }, []); // Run once on component mount

  // Timeout for pending demo open (in case fetch fails)
  useEffect(() => {
    if (pendingDemoOpen) {
      const timeout = setTimeout(() => {
        setPendingDemoOpen(false);
        alert('Demo video fetch timed out. Please try again.');
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [pendingDemoOpen]);

  // Remove automatic demo URL fetch to prevent re-renders
  // We'll fetch it only when the user clicks the demo button

  // Notify parent component when uploading state changes
  useEffect(() => {
    if (onUploadingChange) {
      onUploadingChange(isUploading);
    }
  }, [isUploading, onUploadingChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  // Ensure playback video gets the correct source
  useEffect(() => {
    if (recordedVideo && playbackVideoRef.current) {
      playbackVideoRef.current.src = recordedVideo.url;
      playbackVideoRef.current.load(); // Force reload the video
    }
  }, [recordedVideo]);

  // Get current message based on elapsed time - memoized to prevent re-renders
  const getCurrentMessage = useCallback(elapsed => {
    const seconds = Math.floor(elapsed / 1000);

    if (seconds < 5) {
      return { text: uploadMessages[0].message, stage: 'preparing' };
    } else if (seconds < 15) {
      return { text: uploadMessages[1].message, stage: 'converting' };
    } else if (seconds < 30) {
      return { text: uploadMessages[2].message, stage: 'uploading' };
    } else if (seconds < 45) {
      return { text: uploadMessages[3].message, stage: 'processing' };
    } else {
      return { text: uploadMessages[4].message, stage: 'finalizing' };
    }
  }, []); // Empty dependency array since uploadMessages is imported and won't change

  // Dynamic message updates
  useEffect(() => {
    if (isUploading && uploadStartTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - uploadStartTime;
        const message = getCurrentMessage(elapsed);
        setCurrentMessage(message.text);
        setCurrentStage(message.stage);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isUploading, uploadStartTime, getCurrentMessage]);

  // Countdown timer effect - moved after stopRecording is defined
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(30); // Start countdown from 30
      const interval = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            // Call stopRecording directly without dependency
            if (mediaRecorderRef.current && isRecording) {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setRecordingTime(0); // Reset when not recording
    }
  }, [isRecording]);

  // Start camera with optimized settings
  const startCamera = async () => {
    try {
      setError('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 180, max: 240 },
          height: { ideal: 320, max: 360 },
          frameRate: { ideal: 10, max: 15 },
          facingMode: 'user',
          aspectRatio: { ideal: 9 / 16 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setMediaStream(stream);

      // Wait a bit for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Add event listeners to track video element state
          videoRef.current.addEventListener('loadedmetadata', () => {
            // Video is ready to play
          });

          videoRef.current.addEventListener('canplay', () => {
            // Force the video to play
            if (videoRef.current) {
              videoRef.current.play().catch(err => {
                console.error('Video play failed:', err);
              });
            }
          });

          videoRef.current.addEventListener('error', e => {
            console.error('Video error:', e);
          });
        }
      }, 100);

      setIsCameraStarted(true);
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  // Start recording
  const startRecording = () => {
    if (!mediaStream) return;

    // Try mime types that support both video and audio (opus). Firefox fails when only video codec
    // is specified but the stream has audio - it needs e.g. video/webm;codecs=vp8,opus.
    const mimeTypesToTry = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ];
    let selectedMimeType = null;
    let mediaRecorder = null;
    for (const mimeType of mimeTypesToTry) {
      if (!MediaRecorder.isTypeSupported(mimeType)) continue;
      const options = {
        mimeType,
        videoBitsPerSecond: 250000, // Very low bitrate for minimal file size
      };
      try {
        const recorder = new MediaRecorder(mediaStream, options);
        recorder.start(); // Firefox can throw here if audio+video codec combo is unsupported
        selectedMimeType = mimeType;
        mediaRecorder = recorder;
        break;
      } catch (e) {
        // This mime type fails with this stream (e.g. "audio track cannot be recorded"), try next
        continue;
      }
    }
    if (!selectedMimeType || !mediaRecorder) {
      setError('Video recording is not supported in this browser. Please try Chrome or Firefox with a recent version.');
      return;
    }

    recordingMimeTypeRef.current = selectedMimeType;
    recordedChunksRef.current = [];

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blobType = recordingMimeTypeRef.current;
      const blob = new Blob(recordedChunksRef.current, { type: blobType });
      const url = URL.createObjectURL(blob);

      // Clear the camera stream from the video element to prepare for playback
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setRecordedVideo({ blob, url });
    };

    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Reset recording
  const resetRecording = () => {
    setRecordedVideo(null);
    setError('');
    setUploadProgress('');
    setCurrentMessage('');
    setCurrentStage('');

    // Properly refresh the video element
    if (videoRef.current && mediaStream) {
      // Clear any existing source
      videoRef.current.srcObject = null;

      // Small delay to ensure cleanup, then restore stream
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          // Check if media stream is still active
          if (mediaStream.active) {
            videoRef.current.srcObject = mediaStream;

            // Force video to reload and play
            videoRef.current.load();
            videoRef.current.play().catch(err => {});
          } else {
            // Stream is inactive, restart camera
            startCamera();
          }
        }
      }, 100);
    } else {
      // No media stream, restart camera
      startCamera();
    }
  };

  // Convert video to MOV using FFmpeg
  const convertToMOV = async videoBlob => {
    const ffmpeg = ffmpegRef.current;

    try {
      setConversionStartTime(Date.now());
      setUploadProgress('Converting video format...');

      // Load FFmpeg
      if (!ffmpeg.loaded) {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            'text/javascript'
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            'application/wasm'
          ),
        });
      } else {
        console.log('FFmpeg already loaded');
      }

      // Write input file
      await ffmpeg.writeFile('input.webm', await fetchFile(videoBlob));

      // Convert to MOV with optimized settings
      await ffmpeg.exec([
        '-i',
        'input.webm',
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-crf',
        '28',
        '-c:a',
        'aac',
        '-b:a',
        '64k',
        '-movflags',
        '+faststart',
        'output.mov',
      ]);

      // Read output file
      const data = await ffmpeg.readFile('output.mov');
      const convertedBlob = new Blob([data.buffer], {
        type: 'video/quicktime',
      });

      // Clean up
      await ffmpeg.deleteFile('input.webm');
      await ffmpeg.deleteFile('output.mov');

      return convertedBlob;
    } catch (error) {
      console.error('Conversion error:', error);
      throw new Error('Failed to convert video format');
    }
  };

  // Upload to Cloudinary with signature
  const uploadToCloudinaryWithSignature = async videoBlob => {
    try {
      setUploadProgress('Getting upload signature...');

      // Get upload signature from server (same as mobile app)
      // Web videos are converted to MOV first, so they're typically small - use preset
      const signatureResponse = await fetch(
        `${keys.serverUrl}/api/cloudinary/signature-request-no-preset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({ useEagerAsync: false }), // Small video - use preset
        }
      );

      if (!signatureResponse.ok) {
        const errorText = await signatureResponse.text();
        console.error('Signature request failed:', errorText);
        throw new Error(
          `Failed to get upload signature: ${signatureResponse.status} ${errorText}`
        );
      }

      const signatureData = await signatureResponse.json();

      const {
        signature,
        timestamp,
        apiKey,
        uploadPreset,
        eager,
        eagerAsync,
        folder,
      } = signatureData;
      const cloudName = 'cv-cloud'; // Same as mobile app

      // Create form data (same as mobile app - parameters must be in correct order)
      const formData = new FormData();
      // Add metadata first (important for Cloudinary signature validation)
      formData.append('api_key', apiKey || '951976751434437');
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      // For small videos: add upload preset (includes incoming transformation)
      if (uploadPreset) {
        formData.append('upload_preset', uploadPreset);
      }

      // For large videos: add eager transformations (NO preset to avoid conflicts)
      if (eager) {
        formData.append('eager', eager);
      }
      if (eagerAsync === true) {
        formData.append('eager_async', 'true');
      }

      // For large videos: add folder manually (not from preset)
      if (folder) {
        formData.append('folder', folder);
      }

      // Add file last
      formData.append('file', videoBlob);

      setUploadProgress('Uploading to cloud...');

      // Upload to Cloudinary
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Cloudinary upload failed:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      return {
        videoUrl: uploadResult.secure_url || uploadResult.url,
        publicId: uploadResult.public_id,
      };
    } catch (error) {
      throw new Error('Failed to upload video');
    }
  };

  // Handle complete upload process
  const handleUpload = async () => {
    if (!recordedVideo) {
      setError('No video recorded. Please record a video first.');
      return;
    }

    if (authLoading) {
      setError('Please wait while we verify your authentication...');
      return;
    }

    if (!user) {
      setError('You must be logged in to upload videos.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setUploadStartTime(Date.now());
      setUploadProgress('Starting upload process...');

      // Convert video format
      const convertedBlob = await convertToMOV(recordedVideo.blob);

      // Upload to cloud
      const { videoUrl, publicId } =
        await uploadToCloudinaryWithSignature(convertedBlob);

      // Save to database
      setUploadProgress('Saving to database...');
      const response = await fetch(`${keys.serverUrl}/api/first-impression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          videoUrl,
          publicId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save video');
      }

      // Update status and fetch the full object so selector can render view/remove
      await fetchFirsImpressionStatus();
      await fetchFirstImpression();
      setUploadProgress('Upload completed successfully!');
      // Navigate back to CV Dashboard after success (state tells Dashboard not to redirect HR users to HRDashboard)
      setTimeout(() => {
        navigate('/app/dashboard', { state: { fromCVBuilder: true } });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Play demo video
  const playDemo = async () => {
    // If we don't have a demo URL, try to fetch it
    if (!videoDemoUrl) {
      try {
        setPendingDemoOpen(true);
        await fetchDemoVideoUrl();
        // The useEffect will handle opening the demo when the URL is received
        return;
      } catch (error) {
        console.error('Error fetching demo URL:', error);
        setPendingDemoOpen(false);
        alert('Demo video not available. Please try again later.');
        return;
      }
    }

    openDemoVideo();
  };

  // Helper function to open the demo video
  const openDemoVideo = () => {
    // Handle the server response structure: { url: "..." }
    let demoUrl = null;
    if (typeof videoDemoUrl === 'string') {
      demoUrl = videoDemoUrl;
    } else if (videoDemoUrl && videoDemoUrl.url) {
      demoUrl = videoDemoUrl.url;
    } else if (videoDemoUrl && videoDemoUrl.videoUrl) {
      demoUrl = videoDemoUrl.videoUrl;
    }

    if (!demoUrl) {
      alert('Demo video URL not found. Please try again later.');
      return;
    }

    try {
      const demoWindow = window.open('', '_blank', 'width=800,height=600');
      if (demoWindow) {
        demoWindow.document.write(`
          <html>
            <head>
              <title>First Impression Demo</title>
              <style>
                body { margin:0; padding:20px; background:#000; display:flex; align-items:center; justify-content:center; min-height:100vh; }
                video { max-width:100%; max-height:100%; border-radius:8px; }
              </style>
            </head>
            <body>
              <video controls autoplay>
                <source src="${demoUrl}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </body>
          </html>
        `);
        demoWindow.document.close();
      } else {
        // Fallback if popup blocked
        window.open(demoUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening demo:', error);
      alert('Error opening demo video. Please try again.');
    }
  };

  const countDownTimer = () => {
    if (!isRecording || recordingTime <= 0) return null;

    return (
      <div
        className={`count-down-timer ${recordingTime <= 5 ? 'warning' : ''}`}
      >
        <div className="count-down-timer-text">{recordingTime}</div>
        <div className="count-down-timer-label">
          {recordingTime <= 5 ? 'Auto-stop in' : 'Recording time left'}
        </div>
      </div>
    );
  };

  return (
    <div className="first-impression-form">
      <div className="first-impression-form-container">
        <div className="first-impression-form-header">
          <div className="first-impression-form-header-icon">🎥</div>
          <div className="first-impression-form-header-content">
            <div className="header-title-row">
              <h2>First Impression</h2>
              <button className="demo-button-small" onClick={playDemo}>
                🎬 Watch Demo
              </button>
            </div>
            <p>
              Record a short video introduction to showcase your personality
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && <div className="error-message">{error}</div>}

        {/* Recording Interface */}
        <div className="recording-interface">
          {!recordedVideo ? (
            <>
              {/* Countdown Timer */}
              {countDownTimer()}

              {/* Camera Preview */}
              <div className="camera-container">
                {isCameraStarted ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div className="camera-placeholder">
                    <p>Click to start your camera</p>
                    <button onClick={startCamera} className="start-camera-btn">
                      📹 Start Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              {isCameraStarted && (
                <div className="recording-controls">
                  {!isRecording ? (
                    <button onClick={startRecording} className="record-btn">
                      🔴 Start Recording
                    </button>
                  ) : (
                    <button onClick={stopRecording} className="stop-btn">
                      ⏹️ Stop Recording
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Loading Modal during Upload */}
              {isUploading && (
                <Loader
                  message={
                    typeof currentMessage === 'string'
                      ? currentMessage
                      : currentMessage?.text || 'Processing your video...'
                  }
                />
              )}

              {/* Video Preview - only show when not uploading */}
              {!isUploading && (
                <>
                  <div className="playback-container">
                    <video
                      ref={playbackVideoRef}
                      src={recordedVideo.url}
                      controls
                      className="recorded-video"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button
                      onClick={() => {
                        resetRecording();
                      }}
                      className="retry-btn"
                    >
                      🔄 Retry
                    </button>
                    <button
                      onClick={handleUpload}
                      className="upload-btn"
                      disabled={isUploading}
                    >
                      {isUploading ? '⏳ Uploading...' : '☁️ Upload to Cloud'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstImpressionRecordUpload;
