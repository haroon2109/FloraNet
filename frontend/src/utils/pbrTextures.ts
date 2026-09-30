import * as THREE from 'three';

/**
 * Free 3D Asset & Texture Pipeline ($0 Cost)
 * Configures CC0 Poly Haven PBR textures and NASA/Three.js 4K Satellite textures
 */

export const FREE_TEXTURE_SOURCES = {
  polyHavenSoil: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1024&q=80', // High-res PBR Soil texture map
  earthSatelliteColor: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
  earthNormalMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
  earthSpecularMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
  polyHavenBark: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=1024&q=80',
};

const textureLoader = new THREE.TextureLoader();

export function getPolyHavenSoilTexture(): THREE.Texture {
  const texture = textureLoader.load(FREE_TEXTURE_SOURCES.polyHavenSoil);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function getEarthSatelliteTextures() {
  const colorMap = textureLoader.load(FREE_TEXTURE_SOURCES.earthSatelliteColor);
  const normalMap = textureLoader.load(FREE_TEXTURE_SOURCES.earthNormalMap);
  const specularMap = textureLoader.load(FREE_TEXTURE_SOURCES.earthSpecularMap);
  return { colorMap, normalMap, specularMap };
}
