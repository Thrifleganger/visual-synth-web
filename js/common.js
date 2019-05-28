let patchParameters = {};
let globalParameters = {
    "speed": 4,
    "color": $('#patch-bank-controller .selected').css("background-color"),
    "currentOctave": 3
};
let primeMovers = [];
let secondaryMovers = [];

let colourPaletteOpacity = 0.7;
let colourPalettes = [
    [`rgba(226,178,207,${colourPaletteOpacity})`, `rgba(203,129,174,${colourPaletteOpacity})`, `rgba(173,83,138,${colourPaletteOpacity})`, `rgba(111,20,75,${colourPaletteOpacity})`]
];

const sliderModels = [{
    id: "volume-slider",
    parameter: "volume",
    defaultValue: 0.5,
    minValue: 0,
    maxValue: 1,
    step: 0.01
}, {
    id: "pan-slider",
    parameter: "pan",
    defaultValue: 0,
    minValue: -1,
    maxValue: 1,
    step: 0.01
}, {
    id: "tone-slider",
    parameter: "tone",
    defaultValue: 1,
    minValue: 0,
    maxValue: 1,
    step: 0.01
}, {
    id: "attack-slider",
    parameter: "attack",
    defaultValue: 0.1,
    minValue: 0.01,
    maxValue: 1,
    step: 0.01
}, {
    id: "decay-slider",
    parameter: "decay",
    defaultValue: 0.1,
    minValue: 0.01,
    maxValue: 1,
    step: 0.01
}, {
    id: "sustain-slider",
    parameter: "sustain",
    defaultValue: 0.8,
    minValue: 0.01,
    maxValue: 1,
    step: 0.01
}, {
    id: "release-slider",
    parameter: "release",
    defaultValue: 1,
    minValue: 0.01,
    maxValue: 3,
    step: 0.01
}, {
    id: "mod-index-slider",
    parameter: "modIndex",
    defaultValue: 5,
    minValue: 0,
    maxValue: 10,
    step: 0.01
}, {
    id: "mod-ratio-slider",
    parameter: "modRatio",
    defaultValue: 2,
    minValue: 0,
    maxValue: 5,
    step: 0.01
}, {
    id: "mod-duration-slider",
    parameter: "modDuration",
    defaultValue: 1,
    minValue: 0,
    maxValue: 3,
    step: 0.01
}, {
    id: "delay-time-slider",
    parameter: "delayTime",
    defaultValue: 1,
    minValue: 0,
    maxValue: 4,
    step: 0.01
}, {
    id: "delay-feedback-slider",
    parameter: "delayFeedback",
    defaultValue: 0.3,
    minValue: 0,
    maxValue: 0.99,
    step: 0.01
}, {
    id: "delay-mix-slider",
    parameter: "delayMix",
    defaultValue: 0.3,
    minValue: 0,
    maxValue: 1,
    step: 0.01
}, {
    id: "reverb-mix-slider",
    parameter: "reverbMix",
    defaultValue: 0.3,
    minValue: 0,
    maxValue: 1,
    step: 0.01
}];