import React, { useState, useRef, useContext, useEffect } from 'react';
import { Context as FirstImpressionContext } from '../../../../context/FirstImpressionContext';
import Loader from '../../../common/loader/Loader';
import './FirstImpression.css';
import api from '../../../../api/api';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

const FirstImpressionRecordUpload = () => {
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);

  const [recordingTime, setRecordingTime] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState(null);
  const [converting, setConverting] = useState(false);

  const videoRef = useRef(null);
  const portraitVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const previewVideoRef = useRef(null);

  const {
    state: { loading, uploadSignature, videoUploading },
    createUploadSignature,
    clearUploadSignature,
    createFirstImpression,
    setVideoUploading,
  } = useContext(FirstImpressionContext);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordedVideo) {
        URL.revokeObjectURL(recordedVideo.url);
      }
    };
  }, []);

  useEffect(() => {
    if (recordingTime === 0) {
      stopRecording();
      setIsRecording(false);
      setIsTimerRunning(false);
      setRecordingTime(30);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [recordingTime]);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
        setStream(null);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (portraitVideoRef.current) {
        portraitVideoRef.current.srcObject = null;
      }

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 720, min: 480 },
            height: { ideal: 1280, min: 640 },
            frameRate: { ideal: 30, min: 24 },
            facingMode: 'user',
            aspectRatio: { ideal: 9 / 16 }, // Portrait aspect ratio (9:16)
            // Force portrait orientation
            resizeMode: 'crop-and-scale',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (audioError) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 720, min: 480 },
            height: { ideal: 1280, min: 640 },
            frameRate: { ideal: 30, min: 24 },
            facingMode: 'user',
            aspectRatio: { ideal: 9 / 16 }, // Portrait aspect ratio (9:16)
            // Force portrait orientation
            resizeMode: 'crop-and-scale',
          },
          audio: false,
        });
      }

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Debug camera stream dimensions
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Camera stream dimensions:', {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
            aspectRatio: (
              videoRef.current.videoWidth / videoRef.current.videoHeight
            ).toFixed(2),
          });
        };
      }

      if (portraitVideoRef.current) {
        portraitVideoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError(
          'Camera access denied. Please allow camera permissions and try again.'
        );
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else if (err.name === 'NotSupportedError') {
        setError(
          'Camera not supported in this browser. Please try a different browser.'
        );
      } else if (err.name === 'AbortError') {
        setError('Camera access was interrupted. Please try again.');
      } else {
        setError(
          `Unable to access camera: ${err.message}. Please check permissions.`
        );
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startRecording = () => {
    if (!stream) {
      setError('Camera not available. Please start camera first.');
      return;
    }

    try {
      recordedChunksRef.current = [];

      // Use the original stream directly (like our working test component)
      let options = {};
      const mimeTypes = [
        'video/webm;codecs=vp9,opus', // WebM VP9 with audio
        'video/webm;codecs=vp8,opus', // WebM VP8 with audio
        'video/webm;codecs=vp9', // WebM VP9 - video only
        'video/webm;codecs=vp8', // WebM VP8 - video only
        'video/webm', // WebM - basic fallback
        'video/mp4;codecs=h264,aac', // MP4 with H.264 + AAC
        'video/mp4;codecs=h264', // MP4 with H.264
        'video/mp4', // MP4 - best quality and mobile compatibility
        'video/quicktime;codecs=h264,aac', // MOV with H.264 + AAC
        'video/quicktime', // MOV - good for cross-platform
        'video/ogg;codecs=theora,vorbis',
        'video/ogg',
      ];

      // Find the first supported MIME type
      for (const mimeType of mimeTypes) {
        const isSupported = MediaRecorder.isTypeSupported(mimeType);
        if (isSupported) {
          options = { mimeType };
          break;
        }
      }

      // Add high quality settings to options
      const recorderOptions = {
        ...options,
        videoBitsPerSecond: 5000000, // 5 Mbps for high quality
        audioBitsPerSecond: 128000, // 128 kbps for audio
      };

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);

      // Log what the browser actually supports
      // console.log('MediaRecorder state:', mediaRecorder.state)
      // console.log('MediaRecorder MIME type:', mediaRecorder.mimeType)
      // console.log('MediaRecorder created successfully')
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          // console.log('Data chunk received:', event.data.size, 'bytes')
        }
      };

      mediaRecorder.onstop = () => {
        // console.log('Recording stopped. Chunks:', recordedChunksRef.current.length)

        if (recordedChunksRef.current.length === 0) {
          // console.error('No video data recorded!')
          setError('No video data was recorded. Please try again.');
          setIsRecording(false);
          setIsTimerRunning(false);
          setRecordingTime(30);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return;
        }

        // Filter out empty chunks
        const validChunks = recordedChunksRef.current.filter(
          chunk => chunk.size > 0
        );
        // console.log('Valid chunks:', validChunks.length, 'out of', recordedChunksRef.current.length)

        if (validChunks.length === 0) {
          // console.error('No valid video data recorded!')
          setError('No valid video data was recorded. Please try again.');
          setIsRecording(false);
          setIsTimerRunning(false);
          setRecordingTime(30);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return;
        }

        // Determine the correct MIME type for the blob
        let mimeType = 'video/quicktime'; // Default to MOV for cross-platform compatibility
        if (validChunks[0].type) {
          mimeType = validChunks[0].type;
        }

        // Create blob with proper error handling
        let blob;
        try {
          blob = new Blob(validChunks, { type: mimeType });
          // console.log('Created blob:', blob.size, 'bytes, type:', blob.type)

          if (blob.size === 0) {
            throw new Error('Blob size is 0 - no valid video data');
          }
        } catch (blobError) {
          console.error('Error creating blob:', blobError);
          // Try with default type if specified type fails
          try {
            blob = new Blob(validChunks, { type: 'video/webm' });
            console.log(
              'Created blob with fallback type:',
              blob.size,
              'bytes, type:',
              blob.type
            );
          } catch (fallbackError) {
            // console.error('Fallback blob creation also failed:', fallbackError)
            setError('Failed to create video file. Please try again.');
            setIsRecording(false);
            setIsTimerRunning(false);
            setRecordingTime(30);
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            return;
          }
        }

        // Create blob URL with explicit type
        const videoUrl = URL.createObjectURL(blob);
        // console.log('Created video URL:', videoUrl)
        // console.log('Blob URL test - can access:', !!videoUrl)

        // Test if we can fetch the blob URL
        fetch(videoUrl);
        // .then(response => {
        //   console.log('✅ Blob URL fetch successful:', response.status, response.statusText)
        //   console.log('Content-Type:', response.headers.get('content-type'))
        // })
        // .catch(error => {
        //   console.error('❌ Blob URL fetch failed:', error)
        // })

        // Create a File object with appropriate extension based on MIME type
        const getFileExtension = mimeType => {
          if (mimeType.includes('quicktime')) return 'mov';
          if (mimeType.includes('mp4')) return 'mp4';
          if (mimeType.includes('webm')) return 'webm';
          if (mimeType.includes('ogg')) return 'ogg';
          return 'mov'; // Default to MOV for cross-platform compatibility
        };

        const fileExtension = getFileExtension(mimeType);
        const videoFile = new File(
          [blob],
          `first-impression-${Date.now()}.${fileExtension}`,
          { type: mimeType }
        );
        // console.log('Created video file:', videoFile.name, videoFile.size, 'bytes')

        // Simple test video creation
        const testVideo = document.createElement('video');
        testVideo.src = videoUrl;
        testVideo.onloadedmetadata = () => {
          console.log(
            '✅ Test video loaded successfully. Duration:',
            testVideo.duration
          );
          console.log(
            '📐 Video dimensions:',
            testVideo.videoWidth,
            'x',
            testVideo.videoHeight
          );
          console.log(
            '📐 Aspect ratio:',
            (testVideo.videoWidth / testVideo.videoHeight).toFixed(2)
          );
        };

        // Set the recorded video with both blob and file
        const videoData = {
          url: videoUrl,
          blob: blob,
          file: videoFile,
          mimeType: mimeType,
        };
        // console.log('Setting recorded video:', videoData)
        setRecordedVideo(videoData);
        setIsRecording(false);
        setIsTimerRunning(false);
        setRecordingTime(30);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // Stop the camera stream when recording is complete
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      };

      mediaRecorder.onerror = event => {
        // console.error('MediaRecorder error:', event)
        setError('Recording failed. Please try again.');
        setIsRecording(false);
        setIsTimerRunning(false);
        setRecordingTime(30);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsTimerRunning(true);
      setRecordingTime(30); // Start countdown from 30 seconds

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            // Auto-stop recording when timer reaches 0
            stopRecording();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      // console.error('Error starting recording:', err)
      setError(
        `Unable to start recording: ${err.message}. Please try a different browser or check camera permissions.`
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const retakeVideo = async () => {
    // Clean up existing video
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo.url);
      setRecordedVideo(null);
      recordedChunksRef.current = [];
    }

    // Ensure any existing stream is properly stopped
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        // console.log('Stopped track:', track.kind)
      });
      setStream(null);
    }

    // Clear any existing video elements
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (portraitVideoRef.current) {
      portraitVideoRef.current.srcObject = null;
    }

    // Wait a moment for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Start fresh camera
    await startCamera();
  };

  const uploadToCloudinary = async () => {
    // console.log('=== UPLOAD DEBUG ===')
    // console.log('recordedVideo:', recordedVideo)
    // console.log('uploadSignature:', uploadSignature)

    if (!recordedVideo || !uploadSignature) {
      // console.error('Missing video or signature:', { recordedVideo: !!recordedVideo, uploadSignature: !!uploadSignature })
      return;
    }

    try {
      const { apiKey, signature, timestamp } = uploadSignature;
      // console.log('Upload signature received:', { apiKey: !!apiKey, signature: !!signature, timestamp })

      const data = new FormData();

      // Use the file object for better compatibility
      // console.log('File being uploaded:', recordedVideo.file)
      // console.log('File name:', recordedVideo.file.name)
      // console.log('File size:', recordedVideo.file.size)
      // console.log('File type:', recordedVideo.file.type)

      data.append('file', recordedVideo.file);
      data.append('api_key', apiKey);
      data.append('signature', signature);
      data.append('timestamp', timestamp);

      setShowUploadProgress(true);
      setUploadStatus('Uploading to cloud...');

      // console.log('Sending request to Cloudinary...')
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/cv-cloud/video/upload',
        {
          method: 'POST',
          body: data,
        }
      );

      // console.log('Response status:', response.status)
      // console.log('Response headers:', response.headers)

      const result = await response.json();
      // console.log('Cloudinary response:', result)

      if (result.error) {
        // console.error('Cloudinary upload error:', result.error)
        clearUploadSignature();
        alert('Unable to upload video, please try again later');
        setShowUploadProgress(false);
        return;
      }

      // Create first impression with Cloudinary URL
      await createFirstImpression({
        videoUrl: result.url,
        publicId: result.public_id,
      });

      clearUploadSignature();
      setShowUploadProgress(false);
      setUploadStatus('');

      // Show success message
      alert('Video uploaded successfully!');

      // Clean up
      if (recordedVideo) {
        URL.revokeObjectURL(recordedVideo.url);
        setRecordedVideo(null);
      }
    } catch (error) {
      // console.error('Error uploading to Cloudinary:', error)
      clearUploadSignature();
      alert('Unable to upload video, please try again later');
      setShowUploadProgress(false);
    }
  };

  const uploadToCloudinaryWithSignature = async (
    signatureData,
    videoData = recordedVideo
  ) => {
    // console.log('=== UPLOAD WITH SIGNATURE DEBUG ===')
    // console.log('videoData:', videoData)
    // console.log('signatureData:', signatureData)

    if (!videoData || !signatureData) {
      // console.error('Missing videoData or signatureData')
      return;
    }

    try {
      setVideoUploading(true);
      setError(null);
      setShowUploadProgress(true);
      setUploadStatus('Uploading to cloud...');

      const { apiKey, signature, timestamp } = signatureData;
      const { file } = videoData;

      // console.log('Upload details:')
      // console.log('- File:', file)
      // console.log('- File size:', file.size)
      // console.log('- File type:', file.type)
      // console.log('- API Key:', apiKey)
      // console.log('- Signature:', signature)
      // console.log('- Timestamp:', timestamp)

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      // console.log('FormData created, sending to Cloudinary...')

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/cv-cloud/video/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      // console.log('Cloudinary response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text();
        // console.error('Cloudinary upload failed:', errorText)
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      // console.log('Cloudinary upload successful:', result)

      // Create first impression with the uploaded video
      await createFirstImpression({
        videoUrl: result.secure_url,
        publicId: result.public_id,
      });

      // console.log('First impression created successfully')
      setVideoUploading(false);
      setRecordedVideo(null);
      clearUploadSignature();

      // Show completion
      setUploadStatus('Upload complete! 🎉');

      // Wait 2 seconds to show completion before hiding
      setTimeout(() => {
        setShowUploadProgress(false);
        setUploadStatus('');
        // Show success message
        alert('Video uploaded successfully!');
      }, 2000);
    } catch (error) {
      // console.error('Upload error:', error)
      setError(error.message);
      setVideoUploading(false);
      setShowUploadProgress(false);
      setUploadStatus('');
    }
  };

  const handleUpload = async () => {
    // console.log('=== HANDLE UPLOAD DEBUG ===')
    // console.log('recordedVideo exists:', !!recordedVideo)

    if (!recordedVideo) {
      alert('Please record a video first.');
      return;
    }

    try {
      // Show upload progress
      setShowUploadProgress(true);
      setUploadStatus(
        'Converting video format... This will take 2 or so minutes, depending on your network speed.'
      );

      // Convert to MOV format for mobile compatibility
      // console.log('Converting video to MOV format...')
      const convertedVideo = await convertToMOV(recordedVideo.blob);

      // Update recordedVideo with converted data
      const updatedVideo = {
        ...recordedVideo,
        blob: convertedVideo.blob,
        file: convertedVideo.file,
        url: convertedVideo.url,
        mimeType: 'video/quicktime',
      };

      //console.log('Video converted successfully:', updatedVideo.file.name, updatedVideo.file.size, 'bytes')
      // console.log('Converted file type:', updatedVideo.file.type)
      // console.log('Converted blob type:', updatedVideo.blob.type)

      setUploadStatus('Preparing upload... Almost done!');

      // console.log('Getting upload signature...')
      // Get upload signature using the API client (includes auth headers)
      const response = await api.post(
        '/api/cloudinary/signature-request-no-preset'
      );
      // console.log('API response:', response.data)

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setUploadStatus('Uploading to cloud... Final step!');

      // Use the signature directly for upload with converted video
      // console.log('Using signature directly for upload...')
      await uploadToCloudinaryWithSignature(response.data, updatedVideo);
    } catch (error) {
      // console.error('Error getting upload signature:', error)
      setShowUploadProgress(false);
      setUploadStatus('');
      alert('Failed to prepare upload. Please try again.');
    }
  };

  // Auto-upload when signature is received
  useEffect(() => {
    // console.log('=== UPLOAD SIGNATURE EFFECT DEBUG ===')
    // console.log('uploadSignature changed:', uploadSignature)

    if (uploadSignature) {
      // console.log('Signature received, starting upload...')
      uploadToCloudinary();
      setVideoUploading(true);
    }
  }, [uploadSignature]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualPlay = () => {
    if (previewVideoRef.current) {
      previewVideoRef.current.play();
    }
  };

  const handleRetryVideo = () => {
    if (recordedVideo && recordedVideo.blob) {
      // Create a new blob URL
      const newUrl = URL.createObjectURL(recordedVideo.blob);
      console.log('Creating new blob URL:', newUrl);

      // Revoke the old URL
      URL.revokeObjectURL(recordedVideo.url);

      // Update the recorded video with new URL
      setRecordedVideo(prev => ({
        ...prev,
        url: newUrl,
      }));
    }
  };

  const convertToMOV = async webmBlob => {
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
      const inputFile = new File([webmBlob], 'input.webm', {
        type: 'video/webm',
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
      const movBlob = new Blob([webmBlob], { type: 'video/quicktime' });
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

  const handleDownload = () => {
    if (recordedVideo) {
      console.log('Download - recordedVideo.mimeType:', recordedVideo.mimeType);

      const getFileExtension = mimeType => {
        console.log('Getting extension for MIME type:', mimeType);
        if (mimeType.includes('quicktime')) return 'mov';
        if (mimeType.includes('mp4')) return 'mp4';
        if (mimeType.includes('webm')) return 'webm';
        if (mimeType.includes('ogg')) return 'ogg';
        return 'mov';
      };

      const fileExtension = getFileExtension(recordedVideo.mimeType);
      console.log('Selected file extension:', fileExtension);

      const a = document.createElement('a');
      a.href = recordedVideo.url;
      a.download = `first-impression-${Date.now()}.${fileExtension}`;
      console.log('Download filename:', a.download);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (loading) {
    return <Loader message="Loading..." />;
  }

  if (error) {
    return (
      <div className="first-impression-create">
        <div className="error-message">
          <h3>Camera Access Error</h3>
          <p>{error}</p>
          <button onClick={startCamera} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showUploadProgress) {
    return (
      <div className="first-impression-create">
        <div className="upload-progress-container">
          <div className="upload-progress-content">
            <div className="upload-logo">
              <img
                src="/icon-512.png"
                alt="CV Cloud Logo"
                className="upload-logo-image"
              />
            </div>
            <h3>Uploading Your Video...</h3>
            <p>{uploadStatus}</p>
            <div className="bouncing-loader">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log(
    'Rendering component - recordedVideo:',
    !!recordedVideo,
    recordedVideo?.url
  );

  return (
    <div className="first-impression-form">
      <div className="camera-container">
        {!recordedVideo ? (
          <>
            {/* Two-Window Recording Setup */}
            <div className="recording-setup">
              <div className="recording-windows">
                {/* Hidden Recording Window - Still records but invisible */}
                <div className="recording-window hidden">
                  <h4>📹 Recording Window (Hidden)</h4>
                  <div className="video-container">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="camera-stream"
                    />
                    {isRecording && (
                      <div
                        className={`recording-timer ${recordingTime <= 5 && 'warning'}`}
                      >
                        <div className="timer-text">
                          ⏱️ {formatTime(recordingTime)} remaining
                        </div>
                        {recordingTime <= 5 && (
                          <div className="warning-text">
                            ⚠️ Recording will stop soon!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Visible Portrait Preview Window */}
                <div className="portrait-preview-window">
                  <div className="portrait-video-container">
                    <video
                      ref={portraitVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="portrait-camera-stream"
                    />
                    {isRecording && (
                      <div
                        className={`recording-timer portrait ${recordingTime <= 5 && 'warning'}`}
                      >
                        <div className="timer-text">
                          ⏱️ {formatTime(recordingTime)} remaining
                        </div>
                        {recordingTime <= 5 && (
                          <div className="warning-text">
                            ⚠️ Recording will stop soon!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!stream && (
                <div className="camera-overlay">
                  <div>
                    <h3>Camera Not Active</h3>
                    <p>Click "Start Camera" to begin</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {console.log(
              'Rendering video element with src:',
              recordedVideo.url
            )}
            <div className="playback-container">
              <div className="portrait-playback-container">
                <video
                  ref={previewVideoRef}
                  src={recordedVideo.url}
                  controls
                  className="portrait-video-player"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {recordedVideo && (
        <div className="video-info">
          <h3>Recorded Video</h3>
          <p>Your video has been recorded successfully!</p>
          <div className="video-warning">
            <p>⚠️ Video preview may not work in all browsers</p>
            <p>
              If the video is not playing, download the video to verify it
              recorded correctly
            </p>
            <button onClick={handleDownload} className="download-button">
              📥 Download & Verify
            </button>
          </div>
          {/* <div className="video-debug">
            <p>File size: {Math.round(recordedVideo.blob.size / 1024)} KB</p>
            <p>Type: {recordedVideo.mimeType}</p>
            <p>Duration: {Math.round(recordedVideo.blob.size / 100000)} seconds (estimated)</p>
            <button 
              onClick={handleManualPlay}
              className="manual-play-button"
            >
              ▶️ Try Play
            </button>
            <button 
              onClick={handleDownload}
              className="download-button"
            >
              📥 Download & Verify
            </button>
            <button 
              onClick={handleRetryVideo}
              className="manual-play-button"
              style={{ marginLeft: '8px' }}
            >
              🔄 Retry Video
            </button>
            <button 
              onClick={async () => {
                if (recordedVideo && recordedVideo.blob) {
                  try {
                    const convertedVideo = await convertToMOV(recordedVideo.blob)
                    setRecordedVideo(prev => ({
                      ...prev,
                      ...convertedVideo,
                      mimeType: 'video/quicktime'
                    }))
                    console.log('Video converted to MOV format')
                  } catch (error) {
                    console.error('Failed to convert video:', error)
                    setError('Failed to convert video to MOV format')
                  }
                }
              }}
              className="manual-play-button"
              style={{ marginLeft: '8px' }}
              disabled={converting}
            >
              {converting ? '🔄 Converting...' : '🎬 Convert to MOV'}
            </button>
          </div> */}
        </div>
      )}

      <div className="camera-controls">
        {!recordedVideo ? (
          <>
            <button
              onClick={stream ? stopCamera : startCamera}
              className={`camera-toggle-button ${!stream ? 'off' : ''}`}
              disabled={isRecording}
            >
              {stream ? '📷 Stop Camera' : '📷 Start Camera'}
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`record-toggle-button ${isRecording ? 'recording' : ''}`}
              disabled={!stream}
            >
              {isRecording ? '⏹️ Stop Recording' : '🎥 Start Recording'}
            </button>
          </>
        ) : (
          <div className="video-controls">
            <button onClick={retakeVideo} className="retake-button">
              🔄 Retake Video
            </button>
            <button
              onClick={handleUpload}
              className="new-recording-button"
              disabled={videoUploading}
            >
              ☁️ Upload to Cloudinary
            </button>
          </div>
        )}
      </div>

      <div className="recording-info">
        <p>
          💡 <strong>Tip:</strong> Record a video using your webcam, then
          preview and upload it.
        </p>
      </div>
    </div>
  );
};

export default FirstImpressionRecordUpload;
