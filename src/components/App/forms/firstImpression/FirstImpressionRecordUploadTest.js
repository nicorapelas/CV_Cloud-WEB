import React, { useState, useRef, useContext, useEffect } from 'react';
import { Context as FirstImpressionContext } from '../../../../context/FirstImpressionContext';
import Loader from '../../../common/loader/Loader';
import api from '../../../../api/api';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

const FirstImpressionRecordUploadTest = () => {
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [recordingTime, setRecordingTime] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
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

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 720 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 24 },
          facingMode: 'user',
          aspectRatio: { ideal: 16 / 9 }, // Force landscape for better compatibility
          resizeMode: 'crop-and-scale',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(`Camera access error: ${err.message}`);
    }
  };

  const startRecording = () => {
    if (!stream) {
      setError('Camera not available. Please start camera first.');
      return;
    }

    try {
      recordedChunksRef.current = [];

      // Try to force portrait recording with MediaRecorder constraints
      const options = {
        mimeType: 'video/webm',
        videoBitsPerSecond: 5000000, // 5 Mbps for quality
        audioBitsPerSecond: 128000, // 128 kbps for audio
      };

      // Create a new MediaStream with portrait constraints
      const portraitStream = new MediaStream();

      // Get video track and apply portrait constraints
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const portraitVideoTrack = videoTrack.clone();
        // Try to apply portrait settings to the track
        try {
          const capabilities = portraitVideoTrack.getCapabilities();
          if (capabilities.width && capabilities.height) {
            const settings = {
              width: { ideal: 720, min: 480 },
              height: { ideal: 1280, min: 640 },
              aspectRatio: { ideal: 9 / 16 },
            };
            portraitVideoTrack.applyConstraints(settings);
          }
        } catch (error) {
          console.log(
            'Could not apply portrait constraints to video track:',
            error
          );
        }
        portraitStream.addTrack(portraitVideoTrack);
      }

      // Add audio track
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        portraitStream.addTrack(audioTrack);
      }

      const mediaRecorder = new MediaRecorder(portraitStream, options);

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (recordedChunksRef.current.length === 0) {
          setError('No video data was recorded. Please try again.');
          setIsRecording(false);
          setIsTimerRunning(false);
          setRecordingTime(30);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return;
        }

        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm',
        });
        const videoUrl = URL.createObjectURL(blob);

        console.log('✅ Video recorded successfully');
        console.log('📊 Blob size:', blob.size, 'bytes');
        console.log('🎬 Blob type:', blob.type);
        console.log('🔗 Video URL:', videoUrl);
        console.log('📹 Recorded chunks:', recordedChunksRef.current.length);
        console.log('🎥 Canvas stream active during recording:', isRecording);

        setRecordedVideo({
          blob,
          url: videoUrl,
          mimeType: 'video/webm',
        });

        setIsRecording(false);
        setIsTimerRunning(false);
        setRecordingTime(30);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // Stop camera stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      };

      mediaRecorder.onerror = event => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
        setIsTimerRunning(false);
        setRecordingTime(30);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);
      setIsTimerRunning(true);
      setRecordingTime(30);

      // Note: Recording in landscape for reliable playback
      // Portrait display is handled by CSS

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            stopRecording();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      setError(`Unable to start recording: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const retakeVideo = async () => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo.url);
      setRecordedVideo(null);
      recordedChunksRef.current = [];
    }

    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    await startCamera();
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Loader message="Loading..." />;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Camera Access Error</h3>
        <p>{error}</p>
        <button
          onClick={startCamera}
          style={{ padding: '10px 20px', margin: '10px' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        First Impression Video Test
      </h2>

      <div style={{ marginBottom: '20px' }}>
        {!recordedVideo ? (
          <div style={{ textAlign: 'center' }}>
            <h3>Recording Setup</h3>

            <div
              style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '20px',
              }}
            >
              {/* Landscape Recording Window - Hidden but still recording */}
              <div
                style={{
                  textAlign: 'center',
                  display: 'none', // Always hidden - recording still works!
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>
                  📹 Recording Window
                </h4>
                <div
                  style={{
                    position: 'relative',
                    width: '300px',
                    margin: '0 auto',
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: 'auto',
                      border: '2px solid #28a745',
                      borderRadius: '8px',
                      background: '#000',
                    }}
                  />
                  {isRecording && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(255, 0, 0, 0.8)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    >
                      ⏱️ {formatTime(recordingTime)}
                    </div>
                  )}
                </div>
              </div>

              {/* Portrait Preview Window */}
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>
                  📱 Portrait Preview
                </h4>
                <div
                  style={{
                    width: '300px',
                    margin: '0 auto',
                    aspectRatio: '9/16',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '2px solid #007bff',
                    borderRadius: '8px',
                    background: '#000',
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'absolute',
                      top: '0',
                      left: '0',
                    }}
                  />
                  {isRecording && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(255, 0, 0, 0.8)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    >
                      ⏱️ {formatTime(recordingTime)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!stream && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  maxWidth: '400px',
                  margin: '0 auto',
                }}
              >
                <h3>Camera Not Active</h3>
                <p>Click "Start Camera" to begin</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h3>Recorded Video</h3>
            <div
              style={{
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
                aspectRatio: '9/16', // Portrait aspect ratio
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid #ccc',
                borderRadius: '8px',
                background: '#000',
              }}
            >
              <video
                ref={previewVideoRef}
                src={recordedVideo.url}
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover', // This will crop to fit portrait
                  position: 'absolute',
                  top: '0',
                  left: '0',
                }}
              />
            </div>
            <div style={{ marginTop: '10px' }}>
              <p>Blob size: {Math.round(recordedVideo.blob.size / 1024)} KB</p>
              <p>Type: {recordedVideo.mimeType}</p>
              <p>Display: Portrait (9:16 aspect ratio)</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {!recordedVideo ? (
          <>
            <button
              onClick={stream ? startCamera : startCamera}
              style={{
                padding: '12px 24px',
                margin: '0 10px',
                border: 'none',
                borderRadius: '6px',
                background: stream ? '#28a745' : '#dc3545',
                color: 'white',
                cursor: 'pointer',
              }}
              disabled={isRecording}
            >
              {stream ? '📷 Restart Camera' : '📷 Start Camera'}
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                padding: '12px 24px',
                margin: '0 10px',
                border: 'none',
                borderRadius: '6px',
                background: isRecording ? '#ffc107' : '#dc3545',
                color: isRecording ? '#000' : 'white',
                cursor: 'pointer',
              }}
              disabled={!stream}
            >
              {isRecording ? '⏹️ Stop Recording' : '🎥 Start Recording'}
            </button>
          </>
        ) : (
          <button
            onClick={retakeVideo}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              background: '#6c757d',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            🔄 Retake Video
          </button>
        )}
      </div>

      <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
        <p>
          💡 <strong>Test Component:</strong> This is a simplified version to
          test video playback
        </p>
        <p>
          🎯 <strong>Goal:</strong> Identify what's causing the playback issue
          in the main component
        </p>
      </div>
    </div>
  );
};

export default FirstImpressionRecordUploadTest;
