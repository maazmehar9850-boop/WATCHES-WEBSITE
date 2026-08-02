import * as THREE from 'three';

/** Shared materials — MeshStandard only (no physical/transmission = less GPU). */
export const metal = new THREE.MeshStandardMaterial({
  color: '#d0d4da',
  metalness: 0.88,
  roughness: 0.18,
});

export const goldMetal = new THREE.MeshStandardMaterial({
  color: '#D4AF37',
  metalness: 0.92,
  roughness: 0.24,
  emissive: '#D4AF37',
  emissiveIntensity: 0.08,
});

export const dialMat = new THREE.MeshStandardMaterial({
  color: '#0c0c0e',
  metalness: 0.4,
  roughness: 0.5,
});

export const glassMat = new THREE.MeshStandardMaterial({
  color: '#e8eef8',
  metalness: 0.1,
  roughness: 0.05,
  transparent: true,
  opacity: 0.22,
});

export const boxMat = new THREE.MeshStandardMaterial({
  color: '#121214',
  metalness: 0.2,
  roughness: 0.65,
});

export const boxGold = new THREE.MeshStandardMaterial({
  color: '#D4AF37',
  metalness: 0.9,
  roughness: 0.3,
  emissive: '#D4AF37',
  emissiveIntensity: 0.2,
});
