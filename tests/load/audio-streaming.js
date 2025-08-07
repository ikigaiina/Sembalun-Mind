import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics for audio streaming
const audioLoadErrors = new Rate('audio_load_errors');
const audioStreamingLatency = new Counter('audio_streaming_latency');

export const options = {
  stages: [
    // Gradual ramp up to 3000 concurrent audio streams
    { duration: '3m', target: 500 },
    { duration: '5m', target: 1500 },
    { duration: '7m', target: 3000 },
    // Maintain peak load for stress testing
    { duration: '15m', target: 3000 },
    // Ramp down
    { duration: '5m', target: 500 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // Audio loading should have less than 2% error rate
    'audio_load_errors': ['rate<0.02'],
    // Audio should start within 1 second for 95% of requests
    'http_req_duration': ['p(95)<1000'],
    // Average audio load time should be under 300ms
    'http_req_duration': ['avg<300'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4173';

// Sample audio files for meditation
const audioFiles = [
  '/audio/meditation-bell.mp3',
  '/audio/guided-meditation-5min.mp3',
  '/audio/breathing-guide.mp3',
  '/audio/nature-sounds.mp3',
  '/audio/tibetan-bowls.mp3',
  '/audio/ocean-waves.mp3',
  '/audio/forest-sounds.mp3',
  '/audio/rain-meditation.mp3',
];

export default function() {
  // Simulate loading the meditation page first
  let response = http.get(`${BASE_URL}/meditation`);
  check(response, {
    'Meditation page loads': (r) => r.status === 200,
  });
  
  sleep(1);
  
  // Select random audio file to stream
  const selectedAudio = audioFiles[Math.floor(Math.random() * audioFiles.length)];
  const audioUrl = `${BASE_URL}${selectedAudio}`;
  
  // Test audio file loading with range requests (important for large files)
  const startTime = Date.now();
  
  // Initial request to check audio availability
  response = http.get(audioUrl, {
    headers: {
      'Range': 'bytes=0-1023', // First 1KB
    },
  });
  
  const audioLoadTime = Date.now() - startTime;
  audioStreamingLatency.add(audioLoadTime);
  
  check(response, {
    'Audio file accessible': (r) => r.status === 206 || r.status === 200,
    'Audio loads quickly': (r) => audioLoadTime < 500,
    'Partial content supported': (r) => r.status === 206 || r.headers['Accept-Ranges'] === 'bytes',
  });
  
  audioLoadErrors.add(!(response.status === 206 || response.status === 200));
  
  if (response.status === 206 || response.status === 200) {
    // Simulate progressive audio loading
    const chunkRequests = [
      'bytes=1024-8191',   // Next 7KB
      'bytes=8192-32767',  // Next 24KB  
      'bytes=32768-131071', // Next 96KB
    ];
    
    for (let chunk of chunkRequests) {
      response = http.get(audioUrl, {
        headers: {
          'Range': chunk,
        },
      });
      
      check(response, {
        [`Audio chunk ${chunk} loads`]: (r) => r.status === 206,
        [`Audio chunk ${chunk} has content`]: (r) => r.body.length > 0,
      });
      
      audioLoadErrors.add(response.status !== 206);
      
      // Small delay between chunks to simulate streaming
      sleep(0.1);
    }
  }
  
  // Test service worker audio caching
  response = http.get(audioUrl);
  check(response, {
    'Full audio file accessible': (r) => r.status === 200,
    'Audio has correct content-type': (r) => 
      r.headers['Content-Type'] && (
        r.headers['Content-Type'].includes('audio/') ||
        r.headers['Content-Type'].includes('application/octet-stream')
      ),
  });
  
  audioLoadErrors.add(response.status !== 200);
  
  // Simulate user pausing and resuming (common meditation app behavior)
  sleep(Math.random() * 2 + 1);
  
  // Test audio seeking (random position)
  if (response.headers['Content-Length']) {
    const fileSize = parseInt(response.headers['Content-Length']);
    const seekPosition = Math.floor(Math.random() * (fileSize * 0.8)); // Seek to random position
    
    response = http.get(audioUrl, {
      headers: {
        'Range': `bytes=${seekPosition}-${seekPosition + 4095}`, // 4KB from seek position
      },
    });
    
    check(response, {
      'Audio seeking works': (r) => r.status === 206,
      'Seeked content has data': (r) => r.body.length > 0,
    });
    
    audioLoadErrors.add(response.status !== 206);
  }
  
  // Test concurrent audio requests (user might load multiple sessions)
  const concurrentRequests = audioFiles.slice(0, 3).map(file => {
    return {
      method: 'GET',
      url: `${BASE_URL}${file}`,
      headers: {
        'Range': 'bytes=0-2047', // First 2KB of each file
      },
    };
  });
  
  const responses = http.batch(concurrentRequests);
  responses.forEach((response, index) => {
    check(response, {
      [`Concurrent audio ${index} loads`]: (r) => r.status === 206 || r.status === 200,
    });
    audioLoadErrors.add(!(response.status === 206 || response.status === 200));
  });
  
  // Simulate meditation session duration (shorter for testing)
  sleep(Math.random() * 3 + 2);
}

export function handleSummary(data) {
  const summary = {
    total_requests: data.metrics.http_reqs.count,
    audio_load_errors: data.metrics.audio_load_errors.count,
    error_rate: (data.metrics.audio_load_errors.rate * 100).toFixed(2) + '%',
    avg_response_time: data.metrics.http_req_duration.avg.toFixed(2) + 'ms',
    p95_response_time: data.metrics.http_req_duration['p(95)'].toFixed(2) + 'ms',
    p99_response_time: data.metrics.http_req_duration['p(99)'].toFixed(2) + 'ms',
    max_response_time: data.metrics.http_req_duration.max.toFixed(2) + 'ms',
  };
  
  return {
    'audio-streaming-summary.json': JSON.stringify(summary, null, 2),
    stdout: `
Audio Streaming Load Test Results:
=================================
Total Requests: ${summary.total_requests}
Audio Load Errors: ${summary.audio_load_errors} (${summary.error_rate})
Average Response Time: ${summary.avg_response_time}
95th Percentile: ${summary.p95_response_time}
99th Percentile: ${summary.p99_response_time}
Max Response Time: ${summary.max_response_time}

Test Status: ${summary.error_rate < 2 && parseFloat(summary.avg_response_time) < 300 ? '✅ PASSED' : '❌ FAILED'}
`,
  };
}