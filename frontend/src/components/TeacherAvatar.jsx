import React, { useState } from 'react';

/**
 * Converts a teacher's full name to the expected photo filename.
 * e.g. "Aparna Kulkarni" → "aparna-kulkarni.jpg"
 */
function nameToPhotoFile(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\./g, '')       // remove dots (e.g. "A. Joshi" → "a joshi")
    .replace(/\s+/g, '-')     // spaces → hyphens
    + '.jpg';
}

/**
 * Returns initials from a name (up to 2 chars).
 * e.g. "Aparna Kulkarni" → "AK"
 */
function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Per-teacher fine-tuned object-position values.
 * These are screenshot images with black borders around a circular photo,
 * so we need to zoom in and position precisely to show the face.
 * Format: "X% Y%" where Y% moves up (smaller) or down (larger).
 *
 * We also set a scale factor to zoom in past the black border.
 */
const PHOTO_CROP = {
  // Red bg, long hair — face is centred in a circle sitting in lower-middle of screenshot
  'aparna-kulkarni.jpg':    { position: 'center 52%', scale: 2.6 },
  // White bg, formal — face is centred in a circle sitting in lower-middle of screenshot
  'ritu-dudhmal.jpg':       { position: 'center 50%', scale: 2.8 },
  // Light bg, male — face is centred in a circle sitting in lower-middle of screenshot
  'pankaj-vishwakarma.jpg': { position: 'center 50%', scale: 2.8 },
  // Cream bg, saree — face is centred in a circle sitting in lower-middle of screenshot
  'vaishali-wangikar.jpg':  { position: 'center 48%', scale: 2.8 },
};

/**
 * TeacherAvatar — shows a teacher's photo in a circular avatar.
 * Falls back to the initials-circle if the photo is missing or fails to load.
 */
export default function TeacherAvatar({
  name = '',
  photoUrl,
  size = 68,
  fontSize = 20,
  gradient = 'linear-gradient(135deg, #4338ca, #7c3aed)',
  borderColor = '#eef2ff',
  boxShadow = '0 6px 20px rgba(67,56,202,0.21)',
  style = {},
}) {
  const filename = nameToPhotoFile(name);
  const derivedSrc = photoUrl || `/faculty-photos/${filename}`;
  const initials = getInitials(name);
  const crop = PHOTO_CROP[filename] || { position: 'center center', scale: 1 };

  const [imgFailed, setImgFailed] = useState(false);

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    border: `3px solid ${borderColor}`,
    boxShadow,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  if (!imgFailed) {
    return (
      <div style={{ ...baseStyle, background: gradient, position: 'relative' }}>
        <img
          src={derivedSrc}
          alt={name}
          onError={() => setImgFailed(true)}
          style={{
            position: 'absolute',
            width: `${crop.scale * 100}%`,
            height: `${crop.scale * 100}%`,
            objectFit: 'cover',
            objectPosition: crop.position,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'block',
          }}
        />
      </div>
    );
  }

  // Fallback: initials circle
  return (
    <div style={{
      ...baseStyle,
      background: gradient,
      fontFamily: 'Manrope, Inter, sans-serif',
      fontSize,
      fontWeight: 800,
      color: '#fff',
    }}>
      {initials}
    </div>
  );
}
