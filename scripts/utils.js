const Shaders = require('Shaders'),
      CameraInfo = require('CameraInfo'),
      Reactive = require('Reactive');

module.exports.RESOLUTION = Reactive.pack2(
  CameraInfo.previewSize.width,
  CameraInfo.previewSize.height
);

module.exports.texture2D = (texture, uv) => Shaders.composition(texture, uv);
module.exports.vec2 = (value) => Reactive.pack2(value, value);