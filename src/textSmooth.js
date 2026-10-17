import Phaser from 'phaser';

// Chu trong game duoc thu nho/phong to boi camera, nen can loc muot (LINEAR) de khong vo hat.
// Goi o dau create() cua moi scene co chu.
export function smoothText(scene) {
  const onAdded = (obj) => {
    if (obj.type === 'Text') obj.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
  };
  scene.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded));
}
