(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global['flight-city'] = factory());
}(this, (function () {

var index = { render: function () {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _vm._m(0);
    }, staticRenderFns: [function () {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "example vue-template" }, [_vm._v("Vue 2.0"), _c('br'), _vm._v("Component Generator")]);
    }],
    props: {},

    data: function () {
        return {};
    },

    created: function () {
        console.log('created !');
    },

    mounted: function () {
        console.log('mounted !');
    },

    methods: {},

    events: {}
};

return index;

})));
