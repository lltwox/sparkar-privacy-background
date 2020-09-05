const Shaders = require('Shaders'),
      Reactive = require('Reactive'),
      Time = require('Time'),

      utils = require('./utils');

const rand = (vec2) => Reactive.fromRange(Reactive.sin(
  Reactive.sin(Reactive.dot(vec2, Reactive.pack2(12.98198, 78.2343)))
), -1, 1);

module.exports = (textures, amount) => {
  const uv = Shaders.functionVec2();
  const color = utils.texture2D(textures.camera, uv);

  const offset = Reactive.pack2(
    Reactive.sin(uv.x.mul(color.x).mul(Reactive.sin(Time.ms).mul(128.9823))),
    Reactive.cos(uv.y.mul(color.y).mul(Reactive.cos(Time.ms).mul(304.312312)))
  );
  const sample = utils.texture2D(textures.noise, uv.add(offset));

  const xs = offset.x.mul(sample.y);
  const ys = offset.y.mul(sample.z);
  const x = rand(Reactive.pack2(
    xs.mul(Reactive.sin(Time.ms).mul(425.662)),
    ys.mul(Reactive.cos(Time.ms).mul(96.134))
  ));
  const y = rand(Reactive.pack2(
    xs.mul(Reactive.sin(Time.ms).mul(242.662)),
    ys.mul(Reactive.cos(Time.ms).mul(76.134))
  ));
  const value = rand(Reactive.pack2(
    xs.mul(Reactive.sin(Time.ms).mul(129.662)),
    ys.mul(Reactive.cos(Time.ms).mul(63.134))
  ));

  const mul = Reactive.smoothStep(value, amount, amount);
  const sample2 = utils.texture2D(textures.noise, Reactive.pack2(x, y));

  return Reactive.add(
    color.mul(mul),
    sample2.mul(Reactive.val(1).sub(mul))
  );
}
