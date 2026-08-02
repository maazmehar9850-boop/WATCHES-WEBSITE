import * as THREE from 'three';

/** Shared materials — reuse across watch parts to cut GPU state changes. */
export const metal = new THREE.MeshStandardMaterial({
  color: '#c5c8ce',
  metalness: 0.92,
  roughness: 0.22,
});

export const goldMetal = new THREE.MeshStandardMaterial({
  color: '#D4AF37',
  metalness: 0.95,
  roughness: 0.28,
});

export const dialMat = new THREE.MeshStandardMaterial({
  color: '#121214',
  metalness: 0.35,
  roughness: 0.55,
});

export const glassMat = new THREE.MeshPhysicalMaterial({
  color: '#ffffff',
  metalness: 0,
  roughness: 0.05,
  transmission: 0.92,
  thickness: 0.35,
  transparent: true,
  opacity: 0.85,
});

export const boxMat = new THREE.MeshStandardMaterial({
  color: '#0e0e10',
  metalness: 0.15,
  roughness: 0.72,
});

export const boxGold = new THREE.MeshStandardMaterial({
  color: '#D4AF37',
  metalness: 0.9,
  roughness: 0.32,
  emissive: '#D4AF37',
  emissiveIntensity: 0.15,
});
