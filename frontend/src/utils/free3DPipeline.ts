/**
 * FloraNet $0 Cost Free 3D Asset & Texture Pipeline Specification
 *
 * 1. 3D Models (.GLB / .GLTF):
 *    - Sources: Poly Pizza (poly.pizza) & Sketchfab (sketchfab.com, CC-BY license)
 *    - Optimization: Compressed via glTF-Transform & gltf.pmnd.rs into Draco Meshopt formats.
 *
 * 2. Photorealistic Textures & PBR Maps:
 *    - Poly Haven (polyhaven.com, 100% Free / CC0): PBR soil textures, bark, earth bump maps.
 *    - Three.js Solar System Textures: 4K satellite earth color, normal, and night-light textures.
 */

export interface Free3DPipelineConfig {
  dracoDecoderPath: string;
  polyPizzaCatalog: {
    maizePlant: string;
    soybeanPlant: string;
    tractorModel: string;
  };
  polyHavenTextures: {
    loamSoilPBR: string;
    darkHumusPBR: string;
    claySubsoilPBR: string;
  };
}

export const free3DPipelineConfig: Free3DPipelineConfig = {
  dracoDecoderPath: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/',
  polyPizzaCatalog: {
    maizePlant: 'poly-pizza/maize-lowpoly.glb',
    soybeanPlant: 'poly-pizza/soybean-lowpoly.glb',
    tractorModel: 'poly-pizza/farm-tractor.glb',
  },
  polyHavenTextures: {
    loamSoilPBR: 'poly-haven/loam_soil_4k',
    darkHumusPBR: 'poly-haven/dark_humus_4k',
    claySubsoilPBR: 'poly-haven/clay_subsoil_4k',
  },
};
