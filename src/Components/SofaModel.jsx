import React, { useEffect, useMemo, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, PerspectiveCamera, CameraControls, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import SofaChair from '../assets/glb/Sofa_Seat.glb';
import * as THREE from 'three';
import Blaat from '../assets/images/tunnel4k.hdr';

const getPathsToTextures = (item, type, color) => {
  let textures = {}
  if(item) {
      if(item.map) {
        if(color) textures['map'] = require(`../assets/images/${color.color}`);
        else textures['map'] = require(`../assets/texture/${item.map}`);
      }
      if(item.normalMap) textures['normalMap'] = require(`../assets/texture/${item.normalMap}`);
      if(item.metalnessMap) textures['metalnessMap'] = require(`../assets/texture/${item.metalnessMap}`);
      if(item.roughnessMap) textures['roughnessMap'] = require(`../assets/texture/${item.roughnessMap}`);
  } else {
      if( type == 'leg') textures['map'] = require(`../assets/texture/WoodFineDark001_COL_4K.jpg`);
      else  textures['map'] = require(`../assets/texture/FabricVelourPlain003_COL_8K.jpg`);
  }
  return textures
}

function SofaChairMesh(props) {
  const gltf = useLoader(GLTFLoader, SofaChair);
   const meshRef = useRef();
  const preload = useMemo(() => getPathsToTextures(props.selectedChairMaterial, 'chair', props.selectedSofaColor), [props])

  let materials  = useTexture(preload);
  materials.map.wrapS = THREE.RepeatWrapping;
  materials.map.wrapT = THREE.RepeatWrapping;
  if(props.selectedChairMaterial.name === 'Sofa Velvet')
      materials.map.repeat.set(1, 1);
    else 
      materials.map.repeat.set(2, 2);


  if(materials.normalMap) {
    materials.normalMap.wrapS = THREE.RepeatWrapping;
    materials.normalMap.wrapT = THREE.RepeatWrapping;
    if(props.selectedChairMaterial.name === 'Sofa Velvet')
      materials.normalMap.repeat.set(1, 1);
    else 
      materials.normalMap.repeat.set(3.5, 3.5);
  }
  if(materials.metalnessMap) {
    materials.metalnessMap.wrapS = THREE.RepeatWrapping;
    materials.metalnessMap.wrapT = THREE.RepeatWrapping;
    if(props.selectedChairMaterial.name === 'Sofa Velvet')
      materials.metalnessMap.repeat.set(1, 1);
    else 
      materials.metalnessMap.repeat.set(2, 2);
  }
  if(materials.roughnessMap) {
    materials.roughnessMap.wrapS = THREE.RepeatWrapping;
    materials.roughnessMap.wrapT = THREE.RepeatWrapping;
    if(props.selectedChairMaterial.name === 'Sofa Velvet')
      materials.roughnessMap.repeat.set(1, 1);
    else 
      materials.roughnessMap.repeat.set(2, 2);
    
  }
  // use memo to create a material only once
  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: materials.map, 
    normalMap: materials.normalMap ? materials.normalMap : '',
    normalScale: props.selectedChairMaterial.name === 'Sofa Velvet' ? new THREE.Vector3( 0.3, 0.3 ) : new THREE.Vector3( 0.1, 0.1 ),
    metalnessMap: materials.metalnessMap ? materials.metalnessMap : '',
    roughnessMap: materials.roughnessMap ? materials.roughnessMap : '',
    
    }), [materials]);

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        // assign the material to each mesh
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
        
      }
    });
  }, [gltf, material]);

  const sofaChair = useMemo(() => {
    return  <mesh ref={meshRef}>
              <primitive object={gltf.scene} scale={0.21} />
             </mesh>
     }, [meshRef, gltf ]) 

  return sofaChair;
}

function SofaLegMesh(props) {
  const legType = props.legType && props.legType.name === 'Vierkant' 
                  ? require('../assets/glb/Sofa_Legs_Square.glb') 
                  : require('../assets/glb/Sofa_Legs_Round.glb') ;
  const gltf = useLoader(GLTFLoader, legType);

  const meshRef = useRef();

  let materials  = useTexture(getPathsToTextures(props.selectedLegMaterial, 'leg', props.legColor))
  // use memo to create a material only once
  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: materials.map, 
    normalMap: materials.normalMap ? materials.normalMap : '',
    metalnessMap: materials.metalnessMap ? materials.metalnessMap : '',
    metalness: props.selectedLegMaterial.name === 'Chroom' ? 1 : '',
    emissive: props.selectedLegMaterial.name === 'Chroom' ? new THREE.Color(0.1, 0.1, 0.1): '',
    roughnessMap: materials.roughnessMap ? materials.roughnessMap : '',
    }), [materials]);


  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        // assign the material to each mesh
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [gltf, material]);

  useThree(({ camera }) => {
    camera.position.y = 30;
    camera.lookAt(0, 0, 0);
  });

  const sofaLeg = useMemo(() => {
    return <mesh ref={meshRef}>
            <primitive object={gltf.scene} scale={0.12} />
           </mesh>
  }, [meshRef, gltf]);

  return sofaLeg;
}

function SofaModel(props) {

  useEffect(() => {

    if(cameraControlRef.current) {
      if(props.zoom === 0) cameraControlRef.current.reset(true);
      else cameraControlRef.current.zoom(props.zoom, props.zoom, true);
    }

  }, [props.zoom])


  const { selectedSofaColor, selectedLegMaterial, selectedChairMaterial, legType, legColor } = props;
  
  const SofaChairMeshRender = useMemo(() => <SofaChairMesh  selectedChairMaterial={selectedChairMaterial} selectedSofaColor={selectedSofaColor}/>, [selectedSofaColor, selectedChairMaterial])
  const SofaLegMeshRender = useMemo(() => <SofaLegMesh  selectedLegMaterial={selectedLegMaterial} legType={legType} legColor={legColor}/>, [selectedLegMaterial, legType, legColor ])
  
  const cameraControlRef = useRef(null);
  return (
    <Canvas
    style={{ width: '100%', height: '60vh', border: 'none' }}
    camera={{
      position: [0, 120, 60], // Move the camera back and up for better view
      fov: 50,
      near: 1,
      far: 1000,
    }}
  >
      	<CameraControls ref={cameraControlRef} />
        <Environment  files ={Blaat}  />
      <ambientLight intensity={0.5} />
      {/* <directionalLight
        position={[2.5, 1.5, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={10}
      /> */}
      {/* <spotLight
        position={[0, 0, -2]}
        intensity={0.3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={10}
      /> */}
      
      <group scale={[1.2, 1.2, 1.2]} position={[0, isMobile ? -15: 1.5, 0]}>
        { SofaChairMeshRender }
        { SofaLegMeshRender }
      </group>
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.1} // Reduce damping to make rotation smoother
        rotateSpeed={0.5} // Increase rotation speed for faster rotation
        minPolarAngle={Math.PI / 4} // Allow looking from the bottom of the sofa
        maxPolarAngle={(3 * Math.PI) / 4} // Allow looking from the top of the sofa
        minDistance={20} // Adjust the minimum and maximum distance for better zoom control
        maxDistance={100}
      />
    </Canvas>
    
  );
}

export default SofaModel;