const Shaders = require('Shaders'),
      Reactive = require('Reactive'),
      utils = require('./utils');

const SIZE = 2;
const WEIGHT = 1 / (SIZE * 2);

const directionalBlur = (source, direction) => {
  const uv = Shaders.functionVec2();
  let color = utils.texture2D(source, uv);
  color = color.mul(0);
  for (let i = 1; i <= SIZE; i++) {
    const offsetVal = Reactive.div(direction.mul(utils.vec2(i)), utils.RESOLUTION);
    color = color.add(utils.texture2D(source, uv.add(offsetVal)).mul(WEIGHT));
    color = color.add(utils.texture2D(source, uv.sub(offsetVal)).mul(WEIGHT));
  }

  return color;
};

const blur = (color, amount) => {
  color = directionalBlur(color, Reactive.pack2(amount, 0));
  color = directionalBlur(color, Reactive.pack2(0, amount));
  return color;
};

const s = Reactive.val(0.5);
const cubic = (x) => {
  const x2 = x.mul(x);
  const x3 = x2.mul(x);

  return Reactive.pack4(
    s.neg().mul(x3).add(s.mul(2).mul(x2)).add(s.neg().mul(x)),
    s.neg().add(2).mul(x3).add(s.sub(3).mul(x2)).add(1),
    s.sub(2).mul(x3).add(s.neg().mul(2).add(3).mul(x2)).add(s.mul(x)),
    s.mul(x3).add(s.neg().mul(x2))
  );
};

const interpolateCubic = (color, amount) => {
  const uv = Shaders.functionVec2();

  const x = Reactive.mul(uv.x, utils.RESOLUTION.x).div(amount);
  const y = Reactive.mul(uv.y, utils.RESOLUTION.y).div(amount);

  const fx = x.mod(1);
  const fy = y.mod(1);

  const xInt = x.sub(fx);
  const yInt = y.sub(fy);

  const xCubic = cubic(fx);
  const yCubic = cubic(fy);

  const c = Reactive.pack4(xInt.sub(0.5), xInt.add(1.5), yInt.sub(0.5), yInt.add(1.5));

  const s = Reactive.pack4(
    xCubic.x.add(xCubic.y),
    xCubic.z.add(xCubic.w),
    yCubic.x.add(yCubic.y),
    yCubic.z.add(yCubic.w),
  );
  const offset = c.add(
    Reactive.pack4(xCubic.y, xCubic.w, yCubic.y, yCubic.w).div(s)
  );

  const sample0 = utils.texture2D(color, Reactive.pack2(
    Reactive.round(offset.x.mul(amount)).div(utils.RESOLUTION.x),
    Reactive.round(offset.z.mul(amount)).div(utils.RESOLUTION.y)
  ));
  const sample1 = utils.texture2D(color, Reactive.pack2(
    Reactive.round(offset.y.mul(amount)).div(utils.RESOLUTION.x),
    Reactive.round(offset.z.mul(amount)).div(utils.RESOLUTION.y)
  ));
  const sample2 = utils.texture2D(color, Reactive.pack2(
    Reactive.round(offset.x.mul(amount)).div(utils.RESOLUTION.x),
    Reactive.round(offset.w.mul(amount)).div(utils.RESOLUTION.y)
  ));
  const sample3 = utils.texture2D(color, Reactive.pack2(
    Reactive.round(offset.y.mul(amount)).div(utils.RESOLUTION.x),
    Reactive.round(offset.w.mul(amount)).div(utils.RESOLUTION.y)
  ));

  const sx = s.x.div(Reactive.add(s.x, s.y));
  const sy = s.z.div(Reactive.add(s.z, s.w));

  return Reactive.mix(
    Reactive.mix(sample3, sample2, sx),
    Reactive.mix(sample1, sample0, sx),
    sy
  );
}

module.exports = (textures, amount) => {
  const uv = Shaders.functionVec2();
  const colorBlurred = blur(utils.texture2D(textures.camera, uv), amount.mul(30));

  return interpolateCubic(colorBlurred, amount.mul(50));
}

