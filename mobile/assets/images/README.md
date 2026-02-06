# Map marker images

To use **your own** parking pin (e.g. the teardrop pin with "P" from your screenshot, in black):

1. Save your black parking pin as `parking-pin.png` in this folder.
2. In `src/assets/mapIcons.ts`, switch to local assets:
   - `default: require('../../assets/images/parking-pin.png')` (path from `src/assets/mapIcons.ts`)
   - (and optionally a second image for the selected state)

The app currently uses Icons8’s parking icon (black by default, green when selected).
