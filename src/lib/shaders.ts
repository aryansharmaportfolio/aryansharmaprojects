// This file defines the GPU instructions for your "Rockstar" render engine.

export const VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    // Flip Y axis because WebGL texture coordinates are inverted relative to images
    vUv.y = 1.0 - vUv.y; 
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const FRAGMENT_SHADER = `
  precision mediump float;

  uniform sampler2D uTexture;
  uniform float uScroll;
  uniform float uTime;
  uniform vec2 uResolution;

  varying vec2 vUv;

  // --- UTILITY: Pseudo-random noise generator ---
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    // 1. Get the Image Color
    vec4 texColor = texture2D(uTexture, vUv);
    vec3 color = texColor.rgb;

    // 2. FILM GRAIN (The "Expensive" Texture feel)
    // We generate noise based on pixel position and time
    float noise = random(vUv + uTime * 0.1);
    // Mix 3% noise into the image for that cinematic grit
    color += (noise - 0.5) * 0.03;

    // 3. DYNAMIC FADE TO DARK GREY
    // Your background color is #2b2b2b. In normalized RGB (0-1), that is approx 0.168.
    vec3 targetColor = vec3(0.168, 0.168, 0.168);

    // Calculate fade progress
    // We want the fade to start slightly earlier (0.6) and finish at 1.0
    float fadeStart = 0.6;
    float fadeProgress = smoothstep(fadeStart, 1.0, uScroll);

    // DITHERING: Instead of a flat fade, we use noise to break up the transition
    // This creates that high-end "dissolve" look
    float ditherThreshold = fadeProgress + (noise * 0.1); 
    float mixFactor = smoothstep(0.0, 1.0, ditherThreshold);

    // Apply the mix
    vec3 finalColor = mix(color, targetColor, mixFactor);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
