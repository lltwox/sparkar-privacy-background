const Materials = require('Materials'),
      Textures = require('Textures'),
      Reactive = require('Reactive'),
      NativeUI = require('NativeUI'),
      Shaders = require('Shaders'),
      TouchGestures = require('TouchGestures'),
      Diagnostics = require('Diagnostics'),

      blur = require('./blur'),
      pixelate = require('./pixelate'),
      addNoise = require('./add-noise'),
      darken = require('./darken'),
      brighten = require('./brighten');

const BG_PROCESSORS = [
  pixelate,
  blur,
  addNoise,
  darken,
  brighten
];

const DEFAULT_SLIDER_VALUE = 0.5;
const DEFAULT_INDEX = 1;

const initSlider = () => {
  const slider = NativeUI.slider;
  slider.visible = true;
  slider.value = DEFAULT_SLIDER_VALUE;

  return slider;
}

const initPicker = async () => {
  const [
    pixelateIcon,
    blurIcon,
    addNoiseIcon,
    darkenIcon,
    brightenIcon
  ] = await Promise.all([
    Textures.findFirst('pixelate'),
    Textures.findFirst('blur'),
    Textures.findFirst('add-noise'),
    Textures.findFirst('darken'),
    Textures.findFirst('brighten')
  ]);
  const picker = NativeUI.picker;
  picker.configure({
    selectedIndex: DEFAULT_INDEX,
    items: [
      { image_texture: pixelateIcon },
      { image_texture: blurIcon },
      { image_texture: addNoiseIcon },
      { image_texture: darkenIcon },
      { image_texture: brightenIcon },
    ]
  });
  picker.visible = true;

  return picker;
}

(async () => {
  const cameraTexture = (await Textures.findFirst('camera')).signal;
  const segmentationTexture = (await Textures.findFirst('segmentationMask')).signal;
  const bgMaterial = await Materials.findFirst('background');
  const slider = await initSlider();
  const picker = await initPicker();

  let savedSliderValue = -1;
  let processingEnabled = true;
  let selectedIndex = DEFAULT_INDEX;
  const updateBg = () => {
    let img = processingEnabled
      ? BG_PROCESSORS[selectedIndex](cameraTexture, slider.value, segmentationTexture)
      : cameraTexture
    ;

    bgMaterial.setTextureSlot(
      Shaders.DefaultMaterialTextures.DIFFUSE,
      Reactive.pack4(img.x, img.y, img.z, 1)
    );
  };

  slider.value.gt(0).monitor().subscribe((event) => {
    processingEnabled = event.newValue;
    if (event.newValue) {
      savedSliderValue = -1;
    } else if (savedSliderValue == -1) {
      savedSliderValue = DEFAULT_SLIDER_VALUE;
    }
    updateBg();
  });

  picker.selectedIndex.monitor().subscribeWithSnapshot({
    sliderValue: slider.value
  }, (event, snapshot) => {
    selectedIndex = event.newValue;
    if (snapshot.sliderValue == 0) {
      // changing slider value will always trigger bg update
      slider.value = DEFAULT_SLIDER_VALUE;
    } else {
      updateBg();
    }
  });

  TouchGestures.onTap().subscribeWithSnapshot({
    sliderValue: slider.value
  }, (gesture, snapshot) => {
    if (savedSliderValue === -1) {
      savedSliderValue = snapshot.sliderValue;
      slider.value = 0;
    } else {
      slider.value = savedSliderValue;
      savedSliderValue = -1;
    }
  });

  updateBg();
})();