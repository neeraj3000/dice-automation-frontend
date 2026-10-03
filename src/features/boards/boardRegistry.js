// Add a job board to the UI by adding an entry here (and a backend plugin in app/boards/).
export const BOARD_REGISTRY = [
  { key: 'dice', name: 'Dice', tagline: 'Tech and IT roles', enabled: true },
  { key: 'indeed', name: 'Indeed', tagline: 'Coming soon', enabled: false },
  { key: 'linkedin', name: 'LinkedIn', tagline: 'Coming soon', enabled: false },
];
export const getBoardMeta = (key) => BOARD_REGISTRY.find((b) => b.key === key);
