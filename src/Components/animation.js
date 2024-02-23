const LOADER = document.getElementById("js-loader");

let scene, camera, renderer, controls, composer;

let viewportWidth = window.innerWidth || document.documentElement.clientWidth;

var isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(
  navigator.userAgent
);

let clock = new THREE.Clock();
let delta;

const DRACO_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.5/";

const MODEL_PATH = [{ fileName: "realFinalShoe-v1.glb" }];

let loadedModels = [];

const container = document.getElementById("mainCanvas");

init();

function init() {
  scene = new THREE.Scene();
  var fogExp2 = new THREE.FogExp2(0xffffff, 0.0001);

  scene.fog = fogExp2;
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(0, 0, 20);

  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  const target = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      encoding: THREE.sRGBEncoding,
    }
  );
  target.samples = 8;

  effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);

  const pixelRatio = renderer.getPixelRatio();
  const screenWidth = window.innerWidth * pixelRatio;
  const screenHeight = window.innerHeight * pixelRatio;
  effectFXAA.uniforms["resolution"].value.set(
    1 / screenWidth,
    1 / screenHeight
  );

  composer = new THREE.EffectComposer(renderer, target);
  composer.addPass(new THREE.RenderPass(scene, camera));
  composer.addPass(effectFXAA);
  composer.addPass(new THREE.UnrealBloomPass(undefined, 1, 1, 1));

  // lights
  const ambientLight = new THREE.AmbientLight(0xffffff);
  ambientLight.intensity = 1;
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 40);
  pointLight.intensity = 0.9;
  pointLight.position.set(0, 20, 0);
  scene.add(pointLight);

  let uniforms = {
    vGap: { value: 10.0 }, // vertical gap between layers
    vGap2: { value: 10.0 }, // vertical gap between layers
    hGap: { value: 2.0 }, // vertical gap between layers
    dotSize: { value: 1.0 },
    transition: { value: 0.0 },
    vPlane: { value: -0.1 }, // height of fill layer
    hPlane: { value: -0.1 },
  };

  let commonMaterialV = new THREE.MeshStandardMaterial({
    color: 0xc71b1b,
    toneMapped: false,
    emissive: 0xc71b1b,
    emissiveIntensity: 2.1,
    transparent: true,
    opacity: 0.45,
    wireframe: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });

  commonMaterialV.extensions = { derivatives: true };

  commonMaterialV.onBeforeCompile = (shader) => {
    shader.uniforms.vGap = uniforms.vGap;
    shader.uniforms.vPlane = uniforms.vPlane;
    shader.uniforms.dotSize = uniforms.dotSize;
    shader.vertexShader =
      `
  varying float posX;
  varying float posY;
` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      `#include <fog_vertex>`,
      `#include <fog_vertex>
posX = (modelMatrix * vec4( transformed, 0.15 )).x;
posY = (modelMatrix * vec4( transformed, 0.15 )).y;
`
    );

    shader.fragmentShader =
      `
  uniform float vGap;
  uniform float vPlane;
  uniform float dotSize;
  varying float posX;
  varying float posY;

` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <clipping_planes_pars_fragment>`,
      `#include <clipping_planes_pars_fragment>

//http://madebyevan.com/shaders/grid/
float line(float coord){
  float l = abs(fract(coord - 0.5) - 0.5) / (fwidth(coord) * dotSize);
  return 1. - min(l, 1.);
}
`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <dithering_fragment>`,
      `#include <dithering_fragment>
  float lineX = line(posX / vGap - 0.05);
  float lineY = line(posY / vGap - 0.05);
  float line = min(lineX,lineY);
  if (line < 0.05 && posY > vPlane) discard;

  float e = fwidth(min(posX,posY));
	vec3 col = vec3(75.78,0.106,0.106);
  col = mix(col, gl_FragColor.rgb, step(min(posX,posY), vPlane));
  gl_FragColor.rgb = col;

`
    );
  };

  let commonMaterialH = new THREE.MeshStandardMaterial({
    color: 0xc71b1b,
    toneMapped: false,
    emissive: 0xc71b1b,
    emissiveIntensity: 5,
    transparent: true,
    opacity: 0.75,
    wireframe: false,
    side: THREE.DoubleSide,
  });

  commonMaterialH.extensions = { derivatives: true };

  commonMaterialH.onBeforeCompile = (shader) => {
    shader.uniforms.hGap = uniforms.hGap;
    shader.uniforms.hPlane = uniforms.hPlane;
    shader.uniforms.transition = uniforms.transition;
    shader.vertexShader =
      `
  varying float posY;
` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      `#include <fog_vertex>`,
      `#include <fog_vertex>
posY = (modelMatrix * vec4( transformed, 0.15 )).y;
`
    );

    shader.fragmentShader =
      `
  uniform float hGap;
  uniform float hPlane;
	uniform float transition;
  varying float posY;
` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <clipping_planes_pars_fragment>`,
      `#include <clipping_planes_pars_fragment>

//http://madebyevan.com/shaders/grid/
float line(float coord){
  float l = smoothstep(0.45, 0.55, abs(fract(coord - 0.4) - 0.4) / fwidth(coord));
  return 1.0 - min(l, 1.0);
}
`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <dithering_fragment>`,
      `#include <dithering_fragment>
  float line = line(posY / hGap - 0.05);
  if (line < 0.05 && posY > hPlane) discard;

	vec3 col1 = vec3(20.0, 0.65, 0.0);
	vec3 col2 = vec3(75.78, 0.106, 0.106);
  float e = fwidth(posY);
	vec3 col = mix(col1, col2, transition);
  col = mix(col, gl_FragColor.rgb, step(posY, hPlane));
  gl_FragColor.rgb = col;
`
    );
  };

  let commonMaterialHLines = new THREE.MeshStandardMaterial({
    color: 0xc71b1b,
    toneMapped: false,
    emissive: 0xc71b1b,
    emissiveIntensity: 2.5,
    transparent: true,
    opacity: 0.75,
    wireframe: false,
    side: THREE.DoubleSide,
  });

  commonMaterialHLines.extensions = { derivatives: true };

  commonMaterialHLines.onBeforeCompile = (shader) => {
    shader.uniforms.vGap2 = uniforms.vGap2;
    shader.uniforms.hPlane = uniforms.hPlane;
    shader.vertexShader =
      `
  varying float posY;
` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      `#include <fog_vertex>`,
      `#include <fog_vertex>
posY = (modelMatrix * vec4( transformed, 0.15 )).y;
`
    );

    shader.fragmentShader =
      `
  uniform float vGap2;
  uniform float hPlane;
  varying float posY;
` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <clipping_planes_pars_fragment>`,
      `#include <clipping_planes_pars_fragment>

//http://madebyevan.com/shaders/grid/
float line(float coord){
  float l = abs(fract(coord - 0.75) - 0.75) / fwidth(coord);
  return 1. - min(l, 1.);
}
`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <dithering_fragment>`,
      `#include <dithering_fragment>
  float line = line(posY / vGap2 - 0.05);
  if (line < 0.05 && posY > hPlane) discard;

	vec3 col = vec3(30.0, 0.65, 0.0);
  float e = fwidth(posY);
  col = mix(col, gl_FragColor.rgb, step(posY, hPlane));
  gl_FragColor.rgb = col;
`
    );
  };

  loadModelFile = (fileName, path) => {
    return new Promise((resolve) => {
      let loader = new THREE.GLTFLoader();
      let dracoLoader = new THREE.DRACOLoader();

      dracoLoader.setDecoderPath(DRACO_PATH);
      dracoLoader.setDecoderConfig({ type: "js" });

      loader.setDRACOLoader(dracoLoader);

      loader.load(`${path}${fileName}`, (gltf) => {
        //console.info("GLTF file load complete");

        model = gltf.scene;
        modelClone = gltf.scene.clone();

        model.traverse((o) => {
          if (o.isNode) {
            o.castShadow = true;
            o.receiveShadow = true;
            o.frustumCulled = false;
            var material = o.material;
          } else if (o.isMesh && o.name === "jordanShoeOriginal") {
            //o.material = material.clone();
            o.visible = false;
            o.material.transparent = true;
            o.material.opacity = 0;
            o.renderOrder = 0;
            o.material.side = THREE.FrontSide;
            o.material.color = new THREE.Color(0xf5f5f5);
          } else if (o.isMesh && o.name === "jordanShoeOriginalBlack") {
            o.visible = false;
            o.material.transparent = true;
            o.material.opacity = 0;
            o.material.depthTest = true;
            o.material.depthWrite = false;
            o.renderOrder = 0;
            o.material.blending = THREE.AdditiveBlending;
            o.material.side = THREE.FrontSide;
          }
        });

        modelClone.traverse((o) => {
          if (o.isNode) {
            o.castShadow = false;
            o.receiveShadow = false;
            o.frustumCulled = false;
          } else if (o.isMesh && o.name === "jordanShoeOriginal") {
            o.material = commonMaterialH;
            o.material.opacity = 0;
            o.renderOrder = 0;
          } else if (o.isMesh && o.name === "jordanShoeOriginalBlack") {
            o.material = commonMaterialV;
            o.material.depthTest = true;
            o.material.depthWrite = true;
          }
        });

        var box3 = new THREE.Box3().setFromObject(model);
        var size = new THREE.Vector3();
        box3.getSize(size);
        var scale = 6.5 / size.y;

        const size2 = 100;
        const divisions = 100;
        const halfSize = size2 / 2;
        const cellSize = size2 / divisions;

        const vertices = [];
        const colors = [];

        for (let i = 0; i <= divisions; i++) {
          const y = i * cellSize - halfSize;
          const color = new THREE.Color();

          if (i < divisions / 2) {
            color.setHex(0x00ccff); // blue
          } else {
            color.setHex(0xc71b1b); // red
          }

          for (let j = 0; j <= divisions; j++) {
            const x = j * cellSize - halfSize;
            vertices.push(x, 0, y);
            colors.push(color.r, color.g, color.b);
          }
        }

        const indices = [];
        for (let i = 0; i < divisions; i++) {
          for (let j = 0; j < divisions; j++) {
            const a = i * (divisions + 1) + j;
            const b = a + 1;
            const c = a + (divisions + 1);
            const d = c + 1;
            indices.push(a, c, b, b, c, d);
          }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vertices, 3)
        );
        geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colors, 3)
        );
        geometry.setIndex(indices);

        const material = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 1,
        });

        grid = new THREE.LineSegments(geometry, material);
        grid.position.set(0, -3, 0);

        grid.rotation.y = Math.PI * 0.5;

        scene.add(grid);

        jordanShoeOriginalBlack = gltf.scene.getObjectByName(
          "jordanShoeOriginalBlack"
        );
        jordanShoeOriginalBlackClone = modelClone.getObjectByName(
          "jordanShoeOriginalBlack"
        );
        jordanShoeOriginal = gltf.scene.getObjectByName("jordanShoeOriginal");

        clonedMeshOriginalBlack = jordanShoeOriginalBlackClone.clone();
        clonedMeshOriginalBlack.material = commonMaterialHLines;
        clonedMeshOriginalBlack.material.transparent = true;
        clonedMeshOriginalBlack.material.blending = THREE.NormalBlending;

        scene.add(clonedMeshOriginalBlack);
        clonedMeshOriginalBlack.position.y = -5;
        clonedMeshOriginalBlack.rotation.y = 0.9;
        clonedMeshOriginalBlack.scale.set(0.25, 0, 0.15);

        modelGroup = new THREE.Group();
        modelGroup.add(model, modelClone);

        modelGroup.scale.setScalar(scale);
        scene.add(modelGroup);
        createAnimation();
        modelGroup.position.y = -3;

        if (matchMedia) {
          const windowSize = window.matchMedia("(max-width: 767px)");
          windowSize.addListener(widthChange);
          widthChange(windowSize);
        }
        function widthChange(windowSize) {
          if (windowSize.matches) {
            modelGroup.scale.setScalar(scale * 0.92);
            modelGroup.position.y = -3;
          } else {
            modelGroup.scale.setScalar(scale);
            modelGroup.position.y = -3;
          }
        }
        resolve({ fileName: fileName, gltf: gltf });
      });
    });
  };

  load3DModels = (list, destination, path = "/wp-content/uploads/models/") => {
    let promises = [];

    for (let j in list) {
      let mt = list[j];

      promises.push(this.loadModelFile(mt.fileName, path));
    }

    return Promise.all(promises).then((result) => {
      return new Promise((resolve) => {
        resolve(destination);
      });
    });
  };

  load3DModels(MODEL_PATH, loadedModels).then((gltf) => {
    animate();
  });

  gsap.registerPlugin(ScrollTrigger, SplitText);

  uniforms.vGap.value = 10.0;
  uniforms.vGap2.value = 1.0;
  uniforms.hGap.value = 15.0;
  uniforms.vPlane.value = -5.5;
  uniforms.hPlane.value = -10.0;

  function createAnimation() {
    let matchMedia = gsap.matchMedia();

    matchMedia.add("(max-width: 767px)", (context) => { //mobile
      let splitChars;
      let splitLines;

      gsap.set(".introHeadline", { autoAlpha: 1 });
      splitChars = new SplitText("h1", { type: "chars, words" });

      let textSections = document.querySelectorAll(".sectionTrig");

      textSections.forEach((element) => {
        let copy = element.querySelector(".copy");
        let sectionOpac = element.querySelector(".textBlock");
        let headline = element.querySelector(".headlineAnim");
        let moreInfo = element.querySelector(".moreInfo");
        let splitLines = new SplitText(copy, { type: "lines" }).lines;
        let digitext = document.querySelector(".digitext");
        let triggerTl = gsap
          .timeline()

          .to(sectionOpac, 0.5, { opacity: 1, y: 10 }, 0)
          .from(headline, 0.15, { opacity: 0, ease: "back(4)" }, 0.25)
          .from(splitLines, { opacity: 0, ease: "back(4)", stagger: 0.15 }, 0.5)
          .from(moreInfo, 0.5, { opacity: 0 }, 0.15)

          .to(digitext, 0.15, { opacity: 0, ease: "back(4)" }, 0.25)
          .from(
            digitext.chars,
            { opacity: 0, ease: "back(8)", stagger: 0.007 },
            0.025
          );

        ScrollTrigger.create({
          trigger: element,
          start: "top 90%",
          toggleActions: "play none none reverse",
          animation: triggerTl,
          reverse: true,
        });
      });

      const originalEndingPosition = new THREE.Vector3(0, -2.5, 22);
      const originalEndingRotation = new THREE.Vector3(
        -0.049995839572194,
        0,
        0
      );

      let shoeAnimate = gsap.timeline({
        scrollTrigger: {
          trigger: "#mainCanvas",
          start: "top top",
          end: function () {
            //count height of selections: #contact and footer
            let totalHeight = 0;
            let contact = document.getElementById("contact");
            let footer = document.getElementsByTagName("footer")[0];
            let contactHeight = contact.clientHeight;
            let footerHeight = footer.clientHeight;
            totalHeight = contactHeight + footerHeight;
            console.log(totalHeight);
            return "+=" + (document.body.clientHeight - totalHeight);
          },
          scrub: 2,
          markers: false,
          pin: true,
        },
        onStart: () => {
          controls.enabled = false;
        },
        onUpdate: () => {
          controls.enabled = false;
        },
        onReverseComplete: function () {
          originalEndingPosition.x = camera.position.x;
          originalEndingPosition.y = camera.position.y;
          originalEndingPosition.z = camera.position.z;
          originalEndingRotation.x = camera.rotation.x;
          originalEndingRotation.y = camera.rotation.y;
          originalEndingRotation.z = camera.rotation.z;
        },
      });

      shoeAnimate
        .fromTo("#mainCanvas", 0.5, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
        .to(
          splitChars.chars,
          { opacity: 0, ease: "back(8)", stagger: 0.007 },
          0.025
        )
        .fromTo(
          modelClone.rotation,
          0.5,
          { y: 36 },
          { y: 0, ease: "expo.in)" },
          0.25
        )
        .fromTo(
          modelClone.scale,
          1,
          { x: 0.04, y: 15, z: -2 },
          { x: 1, y: 1, z: 1, ease: "expo.in)" },
          0
        )
        .fromTo(grid.material, 1.5, { opacity: 0 }, { opacity: 1 }, 7.1)
        .fromTo(grid.position, 1, { z: -65 }, { z: 0 }, 1.5) // Grid Comes Out Of Depth
        .fromTo(grid.position, 1.42, { y: 15 }, { y: -3, ease: "none" }, 6.25) // Grid Move Down 7.57s
        .to(uniforms.vGap, 3, { value: 0.5, ease: "power4.out" }, 0) // Dots Animation commonMaterialV 3.5s
        .fromTo(
          clonedMeshOriginalBlack.rotation,
          1.5,
          { y: 1.25 },
          { y: 0, ease: "power4.out" },
          0
        )
        .to(
          clonedMeshOriginalBlack.scale,
          1.25,
          { x: 0.025, z: 0.025, ease: "power4.out" },
          0.25
        ) // Model Bottom To Original Size 0.85s
        .to(
          clonedMeshOriginalBlack.scale,
          0.15,
          { y: 0.005, ease: "power4.out" },
          0.05
        ) // Model Bottom Let Y Move Up Minimal 0.85s
        .to(
          clonedMeshOriginalBlack.scale,
          1.35,
          { y: 0.025, ease: "power4.out" },
          1.45
        ) // Model Up 2.19s
        .to(clonedMeshOriginalBlack.material, 1.55, { opacity: 0 }, 0.5)
        .to(clonedMeshOriginalBlack, 0, { visible: false }, 3)
        .to(clonedMeshOriginalBlack.position, 1.5, { y: -3 }, 0.4)
        .fromTo(
          uniforms.dotSize,
          1.25,
          { value: 2.0 },
          { value: 3, ease: "power4.out" },
          2
        ) // Dots Animation commonMaterialV 5s
        .to(uniforms.dotSize, 1, { value: 2.0, ease: "power4.out" }, 3.25) // Dots Animation commonMaterialV 5s
        .to(commonMaterialV, 3, { emissiveIntensity: 5 }, 1) // 4s
        .to(commonMaterialV, { duration: 0, wireframe: true }, 4) // Set Wireframe 4.4s
        .to(uniforms.vPlane, 2.4, { value: 6.5 }, 4.6) // Fill layer 6.8s
        .to(commonMaterialV, { duration: 2, opacity: 0 }, 5.3) // Wireframe To Opacity '0'
        .to(jordanShoeOriginalBlack, { duration: 0, visible: true }, 5.35) // Set Black Shoe Mesh To Visible
        .fromTo(
          jordanShoeOriginalBlack.material,
          { opacity: 0 },
          { opacity: 1, duration: 1.5 },
          "<+=1.1"
        ) // Set Black Material Opacity From 0 To 1
        .to(commonMaterialH, { duration: 1.15, opacity: 1 }, 6.65) // Horizontal Lines To Opacity '1'
        .to(uniforms.hGap, 1.25, { value: 0.0, ease: "power4.out" }, 6.6) // Horizontal Lines In 7.85s
        .to(uniforms.hGap, 2, { value: -5.0, ease: "power4.out" }, 7.55) // Horizontal Lines Out 9.7
        .to(commonMaterialH, { duration: 0.2, opacity: 0 }, 7.65) // Horizontal Material Opacity To 0 - 7.8
        .to(
          jordanShoeOriginalBlack.material,
          { duration: 0.1, depthWrite: true, opacity: 1 },
          7.54
        ) // Set Black Shoe To Not Transparent - Timing corresponds With Horizontal Lines 'Explosion'
        .to(jordanShoeOriginalBlack, { duration: 0, visible: false }, 7.54) // Set Black Shoe Mesh To NOT Visible
        .to(jordanShoeOriginal, { visible: true }, 7.55) // Set Final Material Visibility
        .to(jordanShoeOriginal.material, 0, { opacity: 1 }, 7.55) // Final Material Opacity to 1

        .to(modelGroup.rotation, 3.5, { y: -4, ease: "sine.out" }, 2) // 1st Long Rotation 5.6s
        .to(camera.position, 1.5, { y: -1.75, z: 2, ease: "none" }, 0.9) // Zoom In 1st 2.4s
        .to(camera.position, 0.5, { x: 2.5, ease: "none" }, 2) // Keeps Model In Middle When Zooming and Turning 2.5s
        .to(modelGroup.rotation, 3.5, { x: -1.25, ease: "none" }, 1.5) // Shoe Tilt Heel 1st 5s
        .to(camera.position, 2, { x: -1, y: 0, z: 20, ease: "none" }, 2.5) // Shoe Goes Up 4.5s
        .to(modelGroup.rotation, 2.1, { x: 0, ease: "none" }, 4.75) // Shoe Tilt Heel BACK 7.9s
        .to(camera.position, 3, { x: 0, z: 22, ease: "none" }, 5.5) // Camera Zooms Out - Related to: Camera.position2nd Shoe Goes Up  9.5s
        .to(modelGroup.rotation, 0.65, { y: -5.6, ease: "power2.in" }, 6.85) // 2nd Rotation Rotation 5.6s
        .to(modelGroup.position, 1.25, { x: -1.15, y: -0.5, ease: "none" }, 4) // Move Shoe To Middle Height When Shoe Goes Up 5.25s
        .to(modelGroup.position, 1.08, { y: -3, ease: "none" }, 6.5) // Move Shoe Down To Original Height 7.58s
        .to(camera.position, 0.95, { y: 0.5 }, 6.5) // Move Camera Down 7.45s
        .to(scene.rotation, 1.25, { y: 6.25, ease: "sine.in" }, 8) // 9.25s
        .to(grid.rotation, 1.5, { y: 1 }, 8.5) // 10s
        // .to(grid.position, 1, { y: 10, ease: 'expo.in' }, 8) // Let Grid Move Up 9s
        .to(grid.material, 1.25, { opacity: 0, ease: "power4.out" }, 8.25) // Grid Fades Out 9.5s
        .to(modelGroup.rotation, 0.9, { x: 0.5, y: -5.25, z: -0.25 }, 9)
        .to(camera.position, 1, { y: -3.25 }, 9); // Move Model Up 11s
      // .to(
      //   ".contactPadding",
      //   0.1,
      //   { paddingTop: "0%", transformOrigin: "bottom bottom" },
      //   9.85
      // );

      shoeAnimate.eventCallback("onStart", () => {
        controls.enabled = false;
      });

      shoeAnimate.eventCallback("onComplete", () => {
        controls.enabled = true;
      });

      shoeAnimate.eventCallback("onReverseStart", () => {
        controls.enabled = false;
      });

      shoeAnimate.eventCallback("onReverseComplete", () => {
        controls.enabled = false;
      });

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.enableDamping = false;
      controls.autoRotate = false;

      controls.addEventListener("end", () => {
        if (
          camera.position.x !== originalEndingPosition.x ||
          camera.position.y !== originalEndingPosition.y ||
          camera.position.z !== originalEndingPosition.z ||
          camera.rotation.x !== originalEndingRotation.x ||
          camera.rotation.y !== originalEndingRotation.y ||
          camera.rotation.z !== originalEndingRotation.z
        ) {
          gsap.to(camera.position, {
            duration: 1,
            x: originalEndingPosition.x,
          });
          gsap.to(camera.position, {
            duration: 1,
            y: originalEndingPosition.y,
          });
          gsap.to(camera.position, {
            duration: 1,
            z: originalEndingPosition.z,
          });
          gsap.to(camera.rotation, {
            duration: 1,
            x: originalEndingRotation.x,
          });
          gsap.to(camera.rotation, {
            duration: 1,
            y: originalEndingRotation.y,
          });
          gsap.to(camera.rotation, {
            duration: 1,
            z: originalEndingRotation.z,
          });
        }
      });
    });

    matchMedia.add("(min-width: 768px)", (context) => { //desktop
      let splitChars;
      let splitLines;

      gsap.set(".introHeadline", { autoAlpha: 1 });
      splitChars = new SplitText("h1", { type: "chars, words" });

      let textSections = document.querySelectorAll(".sectionTrig");

      textSections.forEach((element) => {
        let copy = element.querySelector(".copy");
        let sectionOpac = element.querySelector(".textBlock");
        let headline = element.querySelector(".headlineAnim");
        let moreInfo = element.querySelector(".moreInfo");
        let splitLines = new SplitText(copy, { type: "lines" }).lines;
        let digitext = document.querySelector(".digitext");
        let triggerTl = gsap
          .timeline() // Add paused: true option to prevent immediate animation

          .to(sectionOpac, 0.5, { opacity: 1, y: 10 }, 0)
          .from(headline, 0.15, { opacity: 0, ease: "back(4)" }, 0.25)
          .from(splitLines, { opacity: 0, ease: "back(4)", stagger: 0.15 }, 0.5)
          .from(moreInfo, 5, { opacity: 0 }, 0.5)

          .to(digitext, 0.15, { opacity: 0, ease: "back(4)" }, 0.25)
          .from(
            digitext.chars,
            { opacity: 0, ease: "back(8)", stagger: 0.007 },
            0.025
          );

        ScrollTrigger.create({
          trigger: element,
          start: "top 90%",
          toggleActions: "play none none reverse",
          animation: triggerTl,
        });

        // Add the `visibilitychange` listener
        digitext.addEventListener("visibilitychange", () => {
          if (digitext.isIntersectingViewport) {
            // Element is visible, so fade in
            gsap.to(digitext, 0.15, { opacity: 1, progress: 1 });
          } else {
            // Element is invisible, so fade out
            gsap.to(digitext, 0.15, { opacity: 0 });
          }
        });
      });

      const originalEndingPosition = new THREE.Vector3(0, -1.75, 15);
      const originalEndingRotation = new THREE.Vector3(0, 0, 0);

      let shoeAnimate = gsap.timeline({
        scrollTrigger: {
          trigger: "#mainCanvas",
          start: "top top",
          end: "bottom -400%",
          // end: "+=5500",
          scrub: 2.5,
          markers: false,
          pin: true,
        },
        onStart: () => {
          controls.enabled = false;
        },
        onReverseComplete: function () {},
        onComplete: () => {
          originalEndingPosition.x = camera.position.x;
          originalEndingPosition.y = camera.position.y;
          originalEndingPosition.z = camera.position.z;
          originalEndingRotation.x = camera.rotation.x;
          originalEndingRotation.y = camera.rotation.y;
          originalEndingRotation.z = camera.rotation.z;
        },
      });

      shoeAnimate
        .fromTo("#mainCanvas", { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
        .to(
          splitChars.chars,
          { opacity: 0, ease: "back(8)", stagger: 0.007 },
          0.025
        )
        .fromTo(
          modelClone.rotation,
          0.5,
          { y: 36 },
          { y: 0, ease: "expo.in)" },
          0
        ) // Intro Rotation 0.5s
        .fromTo(
          modelClone.scale,
          1,
          { x: 0.04, y: 15, z: -2 },
          { x: 1, y: 1, z: 1, ease: "expo.in)" },
          0
        )
        .fromTo(grid.material, 1.5, { opacity: 0 }, { opacity: 1 }, 7.1)
        .fromTo(grid.position, 1, { z: -65 }, { z: 0 }, 1.5) // Grid Comes Out Of Depth
        .fromTo(grid.position, 1.42, { y: 15 }, { y: -3, ease: "none" }, 6.25) // Grid Move Down 7.57s
        .to(uniforms.vGap, 3, { value: 0.5, ease: "power4.out" }, 0) // Dots Animation commonMaterialV 3.5s
        .fromTo(
          clonedMeshOriginalBlack.rotation,
          1.5,
          { y: 1.25 },
          { y: 0, ease: "power4.out" },
          0
        )
        .to(
          clonedMeshOriginalBlack.scale,
          1.25,
          { x: 0.045, z: 0.045, ease: "power4.out" },
          0.25
        ) // Model Bottom To Original Size 0.85s
        .to(
          clonedMeshOriginalBlack.scale,
          0.15,
          { y: 0.005, ease: "power4.out" },
          0.05
        ) // Model Bottom Let Y Move Up Minimal 0.85s
        .to(
          clonedMeshOriginalBlack.scale,
          1.35,
          { y: 0.045, ease: "power4.out" },
          1.45
        ) // Model Up 2.19s
        .to(clonedMeshOriginalBlack.material, 1.55, { opacity: 0 }, 0.5)
        .to(clonedMeshOriginalBlack, 0, { visible: false }, 3)
        .to(clonedMeshOriginalBlack.position, 1.5, { y: -2 }, 0.4)
        .fromTo(
          uniforms.dotSize,
          1.25,
          { value: 2.0 },
          { value: 5, ease: "power4.out" },
          2
        ) // Dots Animation commonMaterialV 5s
        .to(uniforms.dotSize, 1, { value: 2.0, ease: "power4.out" }, 3.25) // Dots Animation commonMaterialV 5s
        .to(commonMaterialV, 3, { emissiveIntensity: 5 }, 1) // 4s
        .to(commonMaterialV, { duration: 0, wireframe: true }, 4) // Set Wireframe 4.4s
        .to(uniforms.vPlane, 2.4, { value: 6.5 }, 4.6) // Fill layer 6.8s
        .to(commonMaterialV, { duration: 2, opacity: 0 }, 5.3) // Wireframe To Opacity '0'
        .to(jordanShoeOriginalBlack, { duration: 0, visible: true }, 5.35) // Set Black Shoe Mesh To Visible
        .fromTo(
          jordanShoeOriginalBlack.material,
          { opacity: 0 },
          { opacity: 1, duration: 1.5 },
          "<+=1.1"
        ) // Set Black Material Opacity From 0 To 1
        .to(commonMaterialH, { duration: 1.15, opacity: 1 }, 6.65) // Horizontal Lines To Opacity '1'
        .to(uniforms.hGap, 1.25, { value: 0.0, ease: "power4.out" }, 6.6) // Horizontal Lines In 7.85s
        .to(uniforms.hGap, 2, { value: -5.0, ease: "power4.out" }, 7.55) // Horizontal Lines Out 9.7
        .to(commonMaterialH, { duration: 0.2, opacity: 0 }, 7.65) // Horizontal Material Opacity To 0 - 7.8
        .to(
          jordanShoeOriginalBlack.material,
          { duration: 0.1, depthWrite: true, opacity: 1 },
          7.54
        ) // Set Black Shoe To Not Transparent - Timing corresponds With Horizontal Lines 'Explosion'
        .to(jordanShoeOriginalBlack, { duration: 0, visible: false }, 7.54) // Set Black Shoe Mesh To NOT Visible
        .to(jordanShoeOriginal, { visible: true }, 7.55) // Set Final Material Visibility
        .to(jordanShoeOriginal.material, 0, { opacity: 1 }, 7.55) // Final Material Opacity to 1

        .to(modelGroup.rotation, 3.5, { y: -4, ease: "sine.out" }, 2) // 1st Long Rotation 5.5s
        .to(camera.position, 1.5, { y: -0.75, z: 2, ease: "none" }, 0.9) // Zoom In 1st 2.4s
        .to(camera.position, 1, { x: 1.5, ease: "none" }, 2) // Keeps Model In Middle When Zooming and Turning
        .to(modelGroup.rotation, 3.25, { x: -1.25, ease: "none" }, 1.25) // Shoe Tilt Heel 1st 5s
        .to(camera.position, 2, { x: -1, y: 1.5, z: 13, ease: "none" }, 3.5) // Shoe Goes Up 5.5s
        .to(modelGroup.rotation, 2.42, { x: 0, ease: "none" }, 4.75) // Shoe Tilt Heel BACK 7.9s
        .to(camera.position, 4, { x: 0, z: 15, ease: "none" }, 5.5) // Camera Zooms Out - Related to: Camera.position2nd Shoe Goes Up  9.5s
        .to(modelGroup.rotation, 0.65, { y: -5.6, ease: "power2.in" }, 6.85) // 2nd Rotation Rotation 5.6s
        .to(modelGroup.position, 1.25, { y: 0.75, ease: "none" }, 4) // Move Shoe To Middle When Shoe Goes Up 5.25s
        .to(modelGroup.position, 1.25, { y: -1, ease: "none" }, 5.25)
        .to(modelGroup.position, 1.08, { y: -3, ease: "none" }, 6.5) // Move Shoe Down To Original Height 7.58s
        .to(camera.position, 0.95, { y: 0.5 }, 6.5) // Move Camera Down 7.45s
        .to(
          scene.rotation,
          1.25,
          {
            y: 6.25,
            ease: "sine.in",
            onComplete: function () {
              controls.enabled = true;
            },
          },
          8
        ) // 9.25s
        .to(grid.rotation, 1.5, { y: 1 }, 8.5) // 10s
        // .to(grid.position, 1, { y: 10,  ease: 'expo.in' }, 8) // Let Grid Move Up 9s
        .to(grid.material, 1.25, { opacity: 0, ease: "power4.out" }, 8.25) // Grid Fades Out 9.5s
        .to(camera.position, 0.95, { y: -1.75 }, 9)
        .to(
          modelGroup.rotation,
          0.9,
          {
            x: 0.5,
            y: -5.25,
            z: -0.25,
            onComplete: function () {
              controls.enabled = true;
            },
          },
          9.5
        );

      shoeAnimate.eventCallback("onStart", () => {
        controls.enabled = false;
      });

      shoeAnimate.eventCallback("onComplete", () => {
        controls.enabled = true;
      });

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.enableDamping = false;
      controls.autoRotate = false;

      controls.addEventListener("end", () => {
        if (
          camera.position.x !== originalEndingPosition.x ||
          camera.position.y !== originalEndingPosition.y ||
          camera.position.z !== originalEndingPosition.z ||
          camera.rotation.x !== originalEndingRotation.x ||
          camera.rotation.y !== originalEndingRotation.y ||
          camera.rotation.z !== originalEndingRotation.z
        ) {
          gsap.to(camera.position, {
            duration: 1,
            x: originalEndingPosition.x,
          });
          gsap.to(camera.position, {
            duration: 1,
            y: originalEndingPosition.y,
          });
          gsap.to(camera.position, {
            duration: 1,
            z: originalEndingPosition.z,
          });
          gsap.to(camera.rotation, {
            duration: 1,
            x: originalEndingRotation.x,
          });
          gsap.to(camera.rotation, {
            duration: 1,
            y: originalEndingRotation.y,
          });
          gsap.to(camera.rotation, {
            duration: 1,
            z: originalEndingRotation.z,
          });
        }
      });
    });
  }
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  if (resize(renderer)) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  delta = clock.getDelta();
  composer.render();
}

function resize(renderer) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);

  effectFXAA.uniforms["resolution"].value.set(1 / width, 1 / height);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Oud
jQuery(document).ready(function ($) {
  // On button click
  $("#AR, #VR, #models, #tours").click(function () {
    // Get the id of the button clicked
    var id = $(this).attr("id");

    // Convert ids to classes
    if (id === "AR") {
      id = ".AR";
    } else if (id === "VR") {
      id = ".VR";
    } else if (id === "models") {
      id = ".x3D";
    } else if (id === "tours") {
      id = ".tour";
    }

    // Remove active class from all projects
    $(".AR, .VR, .x3D, .tour").removeClass("active");

    // Add active class to the projects with the relevant class
    $(id).addClass("active");
  });
});

// Nieuw
// jQuery(document).ready(function($) {

//     // On button click
//     $('#AR, #VR, #models, #tours').click(function() {

//         // Get the id of the button clicked
//         var id = $(this).attr('id');

//         // Convert ids to classes
//         if(id === 'AR') {
//             id = '.AR';
//         } else if(id === 'VR') {
//             id = '.VR';
//         } else if(id === 'models') {
//             id = '.x3D';
//         } else if(id === 'tours') {
//             id = '.tour';
//         }

//         // Fade out all projects and then hide them
//         $('.AR, .VR, .x3D, .tour').not(id).stop().fadeTo(1000, 0).delay(500).queue(function(next){
//             $(this).css('display', 'none');
//             next();
//         });

//         // Unhide the projects with the relevant class and then fade them in
//         $(id).css('display', 'block').stop().fadeTo(1000, 1);
//     });
// });
