'use-strict';

let sliders = [];

class SliderInstance {
    constructor (slider, container) {
        this.slider = slider;
        this.container = container;
    }
}

class SliderOptions {
    constructor (min, max, step, size) {
        this.min = min;
        this.max = max;
        this.step = step;
        this.angleOffset = -125;
        this.angleArc = 250;
        this.width = size;
        this.height = size;
        this.font = "bold 1em lato";
        this.lineCap = "round";
        this.change = function (args) {
            sliderChanged(args, this);
        };
        this.release = function (args) {
            sliderReleased(args, this);
        };
    }
}

function initializeRotaryControllers() {
    for (let sliderModel of sliderModels) {
        let sliderElement = $(`#${sliderModel.id}`);
        let sliderElementParentId = sliderElement.parents('.widget-container').attr('id');

        patchParameters[sliderModel.parameter] = sliderModel.defaultValue;
        let sliderOptions = new SliderOptions(
            sliderModel.minValue,
            sliderModel.maxValue,
            sliderModel.step,
            heightOfSliderContainer(sliderElement)
        );
        sliderElement.knob(sliderOptions);
        sliderElement.val(sliderModel.defaultValue).trigger('change');
        sliders.push(new SliderInstance(sliderElement, sliderElementParentId));
        performRelativePositionForSliderInput(sliderElement);
    }
}

function resizeSliders() {
    sliders.forEach(instance => {
        instance.slider.trigger('configure', {
            "width": heightOfSliderContainer(instance.slider),
            "height": heightOfSliderContainer(instance.slider)

        });
        instance.slider.trigger('change');
        performRelativePositionForSliderInput(instance.slider);
    });
}

function sliderChanged(value, sliderThatChanged) {
    sliderModels.forEach(sliderModel => {
        if (sliderThatChanged.$.attr('id') === sliderModel.id) {
            patchParameters[sliderModel.parameter] = value;
            reconfigurePatch();
        }
    });
    sliders.filter(instance => instance.container === "envelope-controller").forEach(instance => {
        if (sliderThatChanged.$.attr('id') === instance.slider.attr('id')) {
            patchParameters["drawEnvelope"] = true;
        }
    });
}

function sliderReleased(value, sliderThatStopped) {
    sliders.filter(instance => instance.container === "envelope-controller").forEach(instance => {
        if (sliderThatStopped.$.attr('id') === instance.slider.attr('id')) {
            patchParameters["drawEnvelope"] = false;
        }
    });
}

function performRelativePositionForSliderInput(slider) {
    let width = slider.siblings("canvas").attr('width');
    slider.css("position", "relative");
    slider.css("top", `-${width*0.62}px`);
    let sliderLabel = slider.parents('.slider-block').find('.slider-label');
    sliderLabel.css('font-size', sliderLabel.css('height'));
}

function heightOfSliderContainer(slider) {
    return Number.parseInt(slider.parents('.slider-component').css('height'));
}

