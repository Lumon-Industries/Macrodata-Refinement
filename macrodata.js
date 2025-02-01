// TODO: add more file names
const files = [
  'Siena',
  'Nanning',
  'Narva',
  'Ocula',
  'Kingsport',
  'Labrador',
  'Le Mars',
  'Longbranch',
  'Moonbeam',
  'Minsk',
  'Dranesville',
];

const emptyBins = [
  {WO: 0, FC: 0, DR: 0, MA: 0},
  {WO: 0, FC: 0, DR: 0, MA: 0},
  {WO: 0, FC: 0, DR: 0, MA: 0},
  {WO: 0, FC: 0, DR: 0, MA: 0},
  {WO: 0, FC: 0, DR: 0, MA: 0}
 ];

class MacrodataFile {
  constructor() {
    this.localStorageKey = 'macrodata';
    const file = JSON.parse(localStorage.getItem(this.localStorageKey)) ?? this.assignFile();
    this.fileName = file.fileName;
    this.storedBins = file.storedBins;
    this.coordinates = file.coordinates;
  }

  assignFile() {
    // quick fix to ensure you don't get the same filename twice in a row
    const allFilesButPrevious = files.filter(file => file !== this.fileName);
    const fileName = allFilesButPrevious[Math.floor(Math.random() * allFilesButPrevious.length)];
    const coordinates = this.#generateCoordinates();
    console.log('assigning', fileName);
    const macrodata = {
      fileName,
      storedBins: emptyBins,
      coordinates
    }
    localStorage.setItem(this.localStorageKey, JSON.stringify(macrodata));
    return macrodata;
  }

  updateProgress(bins) {
    const updatedFile = {
      fileName: this.fileName,
      storedBins: bins,
      coordinates: this.coordinates
    }
    localStorage.setItem(this.localStorageKey, JSON.stringify(updatedFile));
  }

  resetFile() {
    localStorage.removeItem(this.localStorageKey);
    const file = this.assignFile();
    this.fileName = file.fileName;
    this.storedBins = file.storedBins;
    this.coordinates = file.coordinates;
  }

  // private member fn to pick coordinates
  #generateCoordinates() {
    function randHex() {
      return floor(random(0, 256)).toString(16).toUpperCase();
    }
    let x = randHex() + randHex() + randHex();
    let y = randHex() + randHex() + randHex();
    
    return `0x${x} : 0x${y}`;
  }
}
