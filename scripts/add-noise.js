const Shaders = require('Shaders'),
      Reactive = require('Reactive'),
      Time = require('Time'),

      utils = require('./utils');

const rand = (vec2) => Reactive.fromRange(Reactive.sin(
  Reactive.sin(Reactive.dot(vec2, Reactive.pack2(12.98198, 78.2343)))
), -1, 1);

const SIZE = 2;

module.exports = (texture, amount) => {
  const uv = Shaders.functionVec2();
  const color = utils.texture2D(texture, uv);

  const offset = Reactive.pack2(
    Reactive.sin(uv.x.mul(color.x).mul(Reactive.sin(Time.ms).mul(1281.9823))),
    Reactive.cos(uv.y.mul(color.y).mul(Reactive.cos(Time.ms).mul(3042.312312)))
  );
  const sample = utils.texture2D(texture, uv.add(offset));

  const xs = offset.x.mul(sample.y);
  const ys = offset.y.mul(sample.z);
  const r = rand(Reactive.pack2(
    xs.mul(Reactive.sin(Time.ms).mul(423.662)),
    ys.mul(Reactive.cos(Time.ms).mul(963.134))
  ));
  const g = rand(Reactive.pack2(
    xs.mul(Reactive.sin(Time.ms).mul(223.662)),
    ys.mul(Reactive.cos(Time.ms).mul(763.134))
  ));
  const b = rand(Reactive.pack2(
    xs.mul(Reactive.sin(Time.ms).mul(123.662)),
    ys.mul(Reactive.cos(Time.ms).mul(631.134))
  ));

  return color.mix(Reactive.pack4(r, g, b, 1).mul(2), amount);
}
