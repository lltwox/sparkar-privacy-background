const Shaders = require('Shaders'),
      Reactive = require('Reactive'),
      util = require('./utils');

module.exports = (textures, amount) => {
  const uv = Shaders.functionVec2();
  const color = util.texture2D(textures.camera, uv);

  return color.add(amount).pow(amount.mul(5).add(1));
}
