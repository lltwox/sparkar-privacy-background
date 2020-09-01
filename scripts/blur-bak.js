const Shaders = require('Shaders'),
      Reactive = require('Reactive'),
      utils = require('./utils');

const SIZE = 4;
const WEIGHT = 1 / (SIZE * 2);

const directionalBlur = (texture, direction) => {
  const uv = Shaders.functionVec2();
  let color = utils.texture2D(texture, uv);
  color = color.mul(0);
  for (let i = 1; i <= SIZE; i++) {
    const offsetVal = Reactive.div(direction.mul(utils.vec2(i)), utils.RESOLUTION);
    color = color.add(utils.texture2D(texture, uv.add(offsetVal)).mul(WEIGHT));
    color = color.add(utils.texture2D(texture, uv.sub(offsetVal)).mul(WEIGHT));
  }

  return color;
};

module.exports = (texture, amount) => {
  texture = directionalBlur(texture, Reactive.pack2(amount.mul(15), 0));
  texture = directionalBlur(texture, Reactive.pack2(0, amount.mul(15)));
  return texture;
}