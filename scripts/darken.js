const Shaders = require('Shaders'),
      Reactive = require('Reactive'),
      util = require('./utils');

module.exports = (textures, amount) => {
  const uv = Shaders.functionVec2();
  const color = util.texture2D(textures.camera, uv);

  return Reactive.mul(
    color.pow(amount.mul(10).add(1)),
    Reactive.val(1).sub(amount)
  );
}
