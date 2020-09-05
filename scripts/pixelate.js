const Shaders = require('Shaders'),
      Reactive = require('Reactive'),
      utils = require('./utils');

const mul = (segmentationTexture, uv) => Reactive.val(1).sub(
  utils.texture2D(segmentationTexture, uv).w.smoothStep(0.5, 0.5)
);

module.exports = (textures, amount) => {
  const uv = Shaders.functionVec2();

  const pixelSize = amount.add(0.1).mul(100);
  const tileSizeX = Reactive.div(pixelSize, utils.RESOLUTION.x);
  const tileSizeY = Reactive.div(pixelSize, utils.RESOLUTION.y);

  const uvCenter = Reactive.pack2(
    tileSizeX.mul(Reactive.floor(Reactive.div(uv.x, tileSizeX)).add(0.5)),
    tileSizeY.mul(Reactive.floor(Reactive.div(uv.y, tileSizeY)).add(0.5))
  );
  const uvTopLeft = Reactive.pack2(
    tileSizeX.mul(Reactive.floor(Reactive.div(uv.x, tileSizeX))),
    tileSizeY.mul(Reactive.floor(Reactive.div(uv.y, tileSizeY)))
  );
  const uvTopRight = Reactive.pack2(
    tileSizeX.mul(Reactive.ceil(Reactive.div(uv.x, tileSizeX))),
    tileSizeY.mul(Reactive.floor(Reactive.div(uv.y, tileSizeY)))
  );
  const uvBottomLeft = Reactive.pack2(
    tileSizeX.mul(Reactive.floor(Reactive.div(uv.x, tileSizeX))),
    tileSizeY.mul(Reactive.ceil(Reactive.div(uv.y, tileSizeY)))
  );
  const uvBottomRight = Reactive.pack2(
    tileSizeX.mul(Reactive.ceil(Reactive.div(uv.x, tileSizeX))),
    tileSizeY.mul(Reactive.ceil(Reactive.div(uv.y, tileSizeY)))
  );

  let colorCenter = utils.texture2D(textures.camera, uvCenter);
  let colorTopLeft = utils.texture2D(textures.camera, uvTopLeft);
  let colorTopRight = utils.texture2D(textures.camera, uvTopRight);
  let colorBottomLeft = utils.texture2D(textures.camera, uvBottomLeft);
  let colorBottomRight = utils.texture2D(textures.camera, uvBottomRight);

  let mulCenter = mul(textures.segmentation, uvCenter);
  let mulTopLeft = mul(textures.segmentation, uvTopLeft);
  let mulTopRight = mul(textures.segmentation, uvTopRight);
  let mulBottomLeft = mul(textures.segmentation, uvBottomLeft);
  let mulBottomRight = mul(textures.segmentation, uvBottomRight);

  return colorCenter.mul(mulCenter)
    .add(
      colorTopLeft
        .mul(mulTopLeft)
        .mul(Reactive.val(1).sub(mulCenter))
    )
    .add(
      colorTopRight
        .mul(mulTopRight)
        .mul(Reactive.val(1).sub(mulCenter))
        .mul(Reactive.val(1).sub(mulTopLeft))
    )
    .add(
      colorBottomLeft
        .mul(mulBottomLeft)
        .mul(Reactive.val(1).sub(mulCenter))
        .mul(Reactive.val(1).sub(mulTopLeft))
        .mul(Reactive.val(1).sub(mulTopRight))
    )
    .add(
      colorBottomRight
        .mul(mulBottomRight)
        .mul(Reactive.val(1).sub(mulCenter))
        .mul(Reactive.val(1).sub(mulTopLeft))
        .mul(Reactive.val(1).sub(mulTopRight))
        .mul(Reactive.val(1).sub(mulBottomLeft))
    )
    .add(
      colorCenter
        .mul(Reactive.val(1).sub(mulCenter))
        .mul(Reactive.val(1).sub(mulTopLeft))
        .mul(Reactive.val(1).sub(mulTopRight))
        .mul(Reactive.val(1).sub(mulBottomLeft))
        .mul(Reactive.val(1).sub(mulBottomRight))
    )
  ;
}
