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

const macrodataKey = 'macrodata';

const emptyBins = [
  {WO: 0, FC: 0, DR: 0, MA: 0},
  {WO: 0, FC: 0, DR: 0, MA: 0},
  {WO: 0, FC: 0, DR: 0, MA: 0},
  {WO: 0, FC: 0, DR: 0, MA: 0},
  {WO: 0, FC: 0, DR: 0, MA: 0}
 ];

// would it be better to wrap this functionality in a class?

const fetchFile = (filename) => {
  if (storageAvailable("localStorage")) {
    const res = localStorage.getItem(macrodataKey);
    if (res) {
      console.log('found', res);
      return JSON.parse(res);
    } else {
      return assignFile();
    }
  }
}

const assignFile = () => {
  if (storageAvailable("localStorage")) {
    const filename = files[Math.floor(Math.random() * files.length)];
    console.log('assigning', filename);
    const macrodata = {
      file: filename,
      bins: emptyBins
    }
    localStorage.setItem(macrodataKey, JSON.stringify(macrodata));
    return macrodata;
  }
}

const updateFileProgress = (macrodataFile) => {
  localStorage.setItem(macrodataKey, JSON.stringify(macrodataFile));
}

const resetFileStorage = () => {
  localStorage.removeItem(macrodataKey);
}