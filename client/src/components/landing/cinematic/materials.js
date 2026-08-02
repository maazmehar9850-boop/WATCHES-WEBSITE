import * as THREE from 'three';

/** Premium shared materials */
export const metal = new THREE.MeshStandardMaterial({
  color: '#e2e6ec',
  metalness: 0.94,
  roughness: 0.16,
});

export const goldMetal = new THREE.MeshStandardMaterial({
  color: '#D4AF37',
  metalness: 0.96,
  roughness: 0.2,
  emissive: '#D4AF37',
  emissiveIntensity: 0.12,
});

export const dialMat = new THREE.MeshStandardMaterial({
  color: '#0a0a0c',
  metalness: 0.45,
  roughness: 0.42,
});

export const glassMat = new THREE.MeshStandardMaterial({
  color: '#f2f6ff',
  metalness: 0.05,
  roughness: 0.04,
  transparent: true,
  opacity: 0.28,
});

export const strapMat = new THREE.MeshStandardMaterial({
  color: '#1a1a1e',
  metalness: 0.35,
  roughness: 0.55,
});
