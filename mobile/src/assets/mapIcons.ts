/**
 * Map marker icons – parking pin (teardrop with "P") for spots.
 * Black & white theme: light gray default, dark gray when selected.
 */
const SIZE = 96;
const LIGHT_GRAY = '9c9c9c';
const DARK_GRAY = '2d2d2d';

export const PARKING_MARKER_ICON = {
  default: { uri: `https://img.icons8.com/ios-filled/${SIZE}/${LIGHT_GRAY}/parking.png` },
  selected: { uri: `https://img.icons8.com/ios-filled/${SIZE}/${DARK_GRAY}/parking.png` },
};
