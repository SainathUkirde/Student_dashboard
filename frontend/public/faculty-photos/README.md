# Faculty Photos

Place teacher photos in this folder. Name each file as:
`firstname-lastname.jpg` (lowercase, hyphen-separated)

## Expected files

| Teacher Name        | Filename                  | Photo from conversation |
|---------------------|---------------------------|------------------------|
| Aparna Kulkarni     | aparna-kulkarni.jpg       | Image 1 (red bg, long dark hair) |
| Ritu Dudhmal        | ritu-dudhmal.jpg          | Image 2 (white bg, formal headshot, bindi) |
| Pankaj Vishwakarma  | pankaj-vishwakarma.jpg    | Image 3 (light bg, male) |
| Vaishali Wangikar   | vaishali-wangikar.jpg     | Image 4 (cream bg, saree) |
| Sayali Kalbhor      | *(leave absent — kept as initials SK)* | — |
| Laxmi Kale          | laxmi-kale.jpg            | — |
| S. Bidkar           | s-bidkar.jpg              | — |
| A. Joshi            | a-joshi.jpg               | — |

## Notes
- Photos are cropped into a circle using `object-fit: cover; object-position: center top`
  so that the face is visible in the circular avatar.
- If a photo file is missing, the initials-circle fallback is shown automatically.
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp` (update the filename extension in
  `TeacherAvatar.jsx → nameToPhotoFile()` if using a different extension).
