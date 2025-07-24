import "@testing-library/jest-dom";

jest.mock("chartjs-adapter-date-fns", () => ({
  default: {},
}));

// Правильная реализация с соблюдением всех перегрузок
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: function (contextType: string) {
    if (contextType === "2d") {
      return {
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
        createImageData: jest.fn(),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        fillText: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        transform: jest.fn(),
        rect: jest.fn(),
        clip: jest.fn(),
        canvas: document.createElement("canvas"),
        font: "",
        textAlign: "start",
        textBaseline: "alphabetic",
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
        lineCap: "butt",
        lineJoin: "miter",
        lineWidth: 1,
        miterLimit: 10,
        shadowBlur: 0,
        shadowColor: "",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        strokeStyle: "#000",
        fillStyle: "#000",
        setLineDash: jest.fn(),
        getLineDash: jest.fn(() => []),
        isPointInPath: jest.fn(),
        isPointInStroke: jest.fn(),
      };
    }
    return null;
  },
});
