const Shaders = require('Shaders'),
      Reactive = require('Reactive'),
      utils = require('./utils');

const DOWNSAMPLE = 32;
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

const interpolate = (color, amount) => {
  const uv = Shaders.functionVec2();

  const x = Reactive.floor(Reactive.mul(uv.x, utils.RESOLUTION.x));
  const y = Reactive.floor(Reactive.mul(uv.y, utils.RESOLUTION.y));

  const xBase = x.div(amount);
  const x1 = xBase.floor().mul(amount).div(utils.RESOLUTION.x);
  const x2 = xBase.ceil().mul(amount).div(utils.RESOLUTION.x);

  const yBase = y.div(amount);
  const y1 = yBase.floor().mul(amount).div(utils.RESOLUTION.y);
  const y2 = yBase.ceil().mul(amount).div(utils.RESOLUTION.y);

  let colorY1 = Reactive.mix(
    utils.texture2D(color, Reactive.pack2(x1, y1)),
    utils.texture2D(color, Reactive.pack2(x2, y1)),
    xBase.mod(1)
  );
  let colorY2 = Reactive.mix(
    utils.texture2D(color, Reactive.pack2(x1, y2)),
    utils.texture2D(color, Reactive.pack2(x2, y2)),
    xBase.mod(1)
  );

  return Reactive.mix(colorY1, colorY2, yBase.mod(1));
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

  // uv = (0.46, 0.39)
  // RESOLUTION = (300, 200)

  // let x = Reactive.floor(Reactive.mul(uv.x, utils.RESOLUTION.x));
  // let y = Reactive.floor(Reactive.mul(uv.y, utils.RESOLUTION.y));

  // // x = 138
  // // y = 78

  // const fx = x.div(amount).mod(1); // fx = (138 / 4) % 1 = 34.5 % 1 = 0.5
  // const fy = y.div(amount).mod(1); // fy = (78 / 4) % 1 = 19.5
  // x = x.sub(fx);
  // y = y.sub(fy);

  let x = Reactive.mul(uv.x, utils.RESOLUTION.x);
  let y = Reactive.mul(uv.y, utils.RESOLUTION.y);

  // x = 138
  // y = 78

  const fx = x.mod(1); // fx = (138 / 4) % 1 = 34.5 % 1 = 0.5
  const fy = y.mod(1); // fy = (78 / 4) % 1 = 19.5
  x = x.sub(fx);
  y = y.sub(fy);

  const xCubic = cubic(fx);
  const yCubic = cubic(fy);

  const c = Reactive.pack4(x.sub(0.5), x.add(1.5), y.sub(0.5), y.add(1.5));
  const s = Reactive.pack4(
    xCubic.x.add(xCubic.y),
    xCubic.z.add(xCubic.w),
    yCubic.x.add(yCubic.y),
    yCubic.z.add(yCubic.w),
  );
  const offset = c.add(
    Reactive.pack4(xCubic.y, xCubic.w, yCubic.y, yCubic.w).div(s)
  );

  const sample0 = utils.texture2D(color, Reactive.pack2(offset.x, offset.z).mul(amount));
  const sample1 = utils.texture2D(color, Reactive.pack2(offset.y, offset.z).mul(amount));
  const sample2 = utils.texture2D(color, Reactive.pack2(offset.x, offset.w).mul(amount));
  const sample3 = utils.texture2D(color, Reactive.pack2(offset.y, offset.w).mul(amount));

  const sx = s.x.div(Reactive.add(s.x, s.y));
  const sy = s.z.div(Reactive.add(s.z, s.w));

  return Reactive.mix(
    Reactive.mix(sample3, sample2, sx),
    Reactive.mix(sample1, sample0, sx),
    sy
  );
}

module.exports = (texture, amount) => {
  amount = amount.mul(4);

  const uv = Shaders.functionVec2();
  const color = utils.texture2D(texture, uv);

  // const colorBlurred = blur(color, amount.mul(amount.mul(8)));
  // return interpolate(color, amount.mul(20));
  return interpolateCubic(color, Reactive.val(4));
}

