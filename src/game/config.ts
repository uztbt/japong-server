export const config = {
  canvas: {
    width: 390,
    height: 400
  },
  paddle: {
    width: 60,
    height: 10,
    offset: 10
  },
  player: {
    speed: 7,
  },
  computer: {
    speed: 6,
  },
  ball: {
    size: 10,
    speed: 4,
    deltaAngle: Math.PI / 6,
    acceleration: 1.02,
  },
  court: {
    offset: 10,
  },
  line: {
    height: 5
  },
  points: {
    offset: {
      left: 5,
      centerLine: 7
    },
    font: {
      size: 30,
      name: "Orbitron",
    }
  },
  centerLine: {
    width: 4,
    height: 4,
  },
  secondsPerFrame: 1000 / 70,
  gamePoint: 3,
};
