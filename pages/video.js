import { useEffect } from 'react'

import * as THREE from 'three'
import { ArToolkitContext, ArToolkitSource, ArMarkerControls } from '@ar-js-org/ar.js/three.js/build/ar-threex'

function HomePage () {
  useEffect(() => {
    global.THREE = window.THREE = THREE

    ArToolkitContext.baseURL = '/'

    // init renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize(640, 480)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild(renderer.domElement)

    // array of functions for the rendering loop
    const onRenderFcts = []

    // init scene and camera
    const scene = new THREE.Scene()

    /// ///////////////////////////////////////////////////////////////////////////////
    // Initialize a basic camera
    /// ///////////////////////////////////////////////////////////////////////////////

    // Create a camera
    const camera = new THREE.Camera()
    scene.add(camera)

    /// /////////////////////////////////////////////////////////////////////////////
    //          handle arToolkitSource
    /// /////////////////////////////////////////////////////////////////////////////

    const arToolkitSource = new ArToolkitSource({
      // to read from the webcam
      sourceType: 'webcam'

      // // to read from an image
      // sourceType : 'image',
      // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',

      // to read from a video
      // sourceType : 'video',
      // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
    })

    arToolkitSource.init(function onReady () {
      setTimeout(() => {
        onResize()
      }, 2000)
    })

    // handle resize
    window.addEventListener('resize', function () {
      onResize()
    })

    function onResize () {
      arToolkitSource.onResizeElement()
      arToolkitSource.copyElementSizeTo(renderer.domElement)
      if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
      }
    }
    /// /////////////////////////////////////////////////////////////////////////////
    //          initialize arToolkitContext
    /// /////////////////////////////////////////////////////////////////////////////

    // create atToolkitContext
    const arToolkitContext = new ArToolkitContext({
      cameraParametersUrl: ArToolkitContext.baseURL + 'data/camera_para.dat',
      detectionMode: 'mono'
    })
    // initialize it
    arToolkitContext.init(function onCompleted () {
      // copy projection matrix to camera
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
    })

    // update artoolkit on every frame
    onRenderFcts.push(function () {
      if (arToolkitSource.ready === false) return

      arToolkitContext.update(arToolkitSource.domElement)

      // update scene.visible if the marker is seen
      scene.visible = camera.visible
    })

    /// /////////////////////////////////////////////////////////////////////////////
    //          Create a ArMarkerControls
    /// /////////////////////////////////////////////////////////////////////////////

    // init controls for camera
    const markerControls = new ArMarkerControls(arToolkitContext, camera, {
      type: 'pattern',
      patternUrl: ArToolkitContext.baseURL + 'data/patt.hiro',
      // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
      // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
      changeMatrixMode: 'cameraTransformMatrix'
    })
    // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
    scene.visible = false

    /// ///////////////////////////////////////////////////////////////////////////////
    // add an object in the scene
    /// ///////////////////////////////////////////////////////////////////////////////

    // add a torus knot
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = geometry.parameters.height / 2
    scene.add(mesh)

    const geometry2 = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16)
    const material2 = new THREE.MeshNormalMaterial()
    const mesh2 = new THREE.Mesh(geometry2, material2)
    mesh2.position.y = 0.5
    scene.add(mesh2)

    

    onRenderFcts.push(function (delta) {
      mesh.rotation.x += Math.PI * delta
    })

    /// ///////////////////////////////////////////////////////////////////////////////
    // render the whole thing on the page
    /// ///////////////////////////////////////////////////////////////////////////////

    // render the scene
    onRenderFcts.push(function () {
      renderer.render(scene, camera)
    })

    // run the rendering loop
    let lastTimeMsec = null
    window.requestAnimationFrame(function animate (nowMsec) {
      // keep looping
      window.requestAnimationFrame(animate)
      // measure time
      lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
      const deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
      lastTimeMsec = nowMsec
      // call each update function
      onRenderFcts.forEach(function (onRenderFct) {
        onRenderFct(deltaMsec / 1000, nowMsec / 1000)
      })
    })
  }, [])

  return (
    <div />
  )
}

export default HomePage
