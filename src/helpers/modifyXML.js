const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
// const { decode } = require('html-entities');

const xmlFilePath = path.join(__dirname, '../../public/pano.xml');

const getData = async () => {
  try {
    const data = await fs.promises.readFile(xmlFilePath, 'utf-8');
    const result = await xml2js.parseStringPromise(data);
    
    return result;
  } catch (error) {
    console.error(error);
    return error.message;
  }
};


const updateHotspotAttributes = async (hotspotId, description, status, newInfo) => {
  try {
    const result = await getData();

    // Buscar el panorama con el id "node2"
    const panorama = result.tour.panorama.find(p => p.$.id === 'node3');

    if (panorama) {
      if (panorama.hotspots && panorama.hotspots.length > 0) {
        const hotspots = panorama.hotspots[0].hotspot;
        const hotspot = hotspots.find(h => h.$.id.toLowerCase() === hotspotId.toLowerCase());

        if (hotspot) {
          hotspot.$.description = description;
          hotspot.$.skinid = status;
          hotspot.$.url = newInfo;

          const builder = new xml2js.Builder();
          const xml = builder.buildObject(result);

          await fs.promises.writeFile(xmlFilePath, xml);
          console.log('File updated correctly');
        } else {
          throw new Error(`No hotspot found with the id: ${hotspotId}`);
        }
      } else {
        console.warn('Panorama with id "node3" has no hotspots');
        throw new Error(`Panorama with id "node3" has no hotspots`);
      }
    } else {
      console.warn('Panorama with id "node3" not found');
      throw new Error(`Panorama with id "node3" not found`);
    }
  } catch (error) {
    console.error(error);
    return error.message;
  }
};


const getAllHotspots = async () => {
  try {
    const result = await getData();
    
    // Buscar el panorama con el id "node2"
    const panorama = result.tour.panorama.find(p => p.$.id === 'node3');
    
    if (panorama) {
      if (panorama.hotspots && panorama.hotspots.length > 0) {
        const hotspots = panorama.hotspots[0].hotspot;
        const excludedIds = ['point01', 'point02', 'point03', 'point04', 'point05', 'point25'];
        
        const hotspotArray = hotspots
          .filter(hotspot => !excludedIds.includes(hotspot.$.id.toLowerCase()))
          .map(hotspot => {
            return {
              id: hotspot.$.id || '',
              tilt: hotspot.$.tilt || '',
              url: hotspot.$.url || '',
              skinid: hotspot.$.skinid || '',
              title: hotspot.$.title || '',
              pan: hotspot.$.pan || '',
              description: hotspot.$.description || ''
            };
          })
          .sort((a, b) => {
            const regexAlphaNum = /^([A-Z]*)-?(\d+)$/;  // Regex que admite letras opcionales, guión opcional y números
            const matchA = a.id.match(regexAlphaNum);
            const matchB = b.id.match(regexAlphaNum);
            
            if (matchA && matchB) {
              const [, etapaA, numA] = matchA;
              const [, etapaB, numB] = matchB;
              
              if (etapaA === etapaB) {
                // Si las letras son iguales (o no hay letras), compara los números
                return parseInt(numA) - parseInt(numB);
              } else {
                // Si las letras son diferentes, compara alfabéticamente
                return etapaA.localeCompare(etapaB);
              }
            } else {
              // Si no coincide con el formato esperado, se ordena como cadena de texto estándar
              return a.id.localeCompare(b.id);
            }
          });
          
          
        
        return hotspotArray;
      } else {
        console.warn('Panorama with id "node3" has no hotspots');
        return [];
      }
    } else {
      console.warn('Panorama with id "node3" not found');
      return [];
    }
  } catch (error) {
    console.error(error);
    return error.message;
  }
};


const exportDataToJSON = async (filePath) => {
  try {
    const result = await getData();
    const panorama = result.tour.panorama.find(p => p.$.id === 'node3');

    if (panorama && panorama.hotspots && panorama.hotspots.length > 0) {
      const hotspots = panorama.hotspots[0].hotspot;
      const excludedIds = ['point01', 'point02', 'point03', 'point04', 'point05', 'point25'];

      const hotspotArray = hotspots
        .filter(hotspot => !excludedIds.includes(hotspot.$.id.toLowerCase()))
        .map(hotspot => ({
          id: hotspot.$.id || '',
          tilt: hotspot.$.tilt || '',
          url: hotspot.$.url || '',
          skinid: hotspot.$.skinid || '',
          title: hotspot.$.title || '',
          pan: hotspot.$.pan || '',
          description: hotspot.$.description || ''
        }));

      const jsonData = JSON.stringify(hotspotArray, null, 2);
      await fs.promises.writeFile(filePath, jsonData);
      console.log('Datos exportados correctamente');
    } else {
      console.warn('Panorama with id "node3" has no hotspots');
    }
  } catch (error) {
    console.error(error);
  }
};

const importDataFromJSON = async (filePath) => {
  try {
    const jsonData = await fs.promises.readFile(filePath, 'utf-8');
    const hotspots = JSON.parse(jsonData);

    const result = await getData();
    const panorama = result.tour.panorama.find(p => p.$.id === 'node3');

    if (panorama && panorama.hotspots && panorama.hotspots.length > 0) {
      for (const hotspot of hotspots) {git
        await updateHotspotAttributes(hotspot.id, hotspot.description, hotspot.skinid, hotspot.url);
      }
      console.log('Datos importados correctamente');
    } else {
      console.warn('Panorama with id "node3" has no hotspots');
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  updateHotspotAttributes,
  getAllHotspots, 
  exportDataToJSON,
  importDataFromJSON
};


