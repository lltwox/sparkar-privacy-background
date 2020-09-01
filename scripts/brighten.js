const Shaders = require('Shaders'),
      Reactive = require('Reactive'),
      util = require('./utils');

module.exports = (texture, amount) => {
  const uv = Shaders.functionVec2();
  const color = util.texture2D(texture, uv);

  return color.add(amount);
}
