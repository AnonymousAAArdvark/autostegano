(()=>{"use strict";var e,r,t,n,o,i,a,s,c,u,f,p={789:(e,r,t)=>{var n,o;!function(e){e.COMPUTE_SVD="compute-svd",e.COMPUTE_LOW_RANK_APPROXIMATION="compute-low-rank-approximation"}(n||(n={})),function(e){e.SINGULAR_VALUES="SINGULAR-VALUES",e.LOW_RANK_APPROXIMATION="LOW-RANK-APPROXIMATION"}(o||(o={}));var i=void 0;onmessage=function(e){var r,a,s,c=e.data,u=c.msg;switch(c.msg){case n.COMPUTE_SVD:r=new Uint8ClampedArray(c.a),a=c.m,s=c.n,t.e(601).then(t.bind(t,601)).then((function(e){e.set_panic_hook(),null==i||i.free();var t=(i=e.svd(r,a,s)).singular_values();postMessage(function(e){return{msg:o.SINGULAR_VALUES,singularValues:e}}(new Uint8ClampedArray(t)))}),(function(e){console.log("Could not load WASM module! Error: ",e)}));break;case n.COMPUTE_LOW_RANK_APPROXIMATION:if(void 0===i)throw new Error("'".concat(n.COMPUTE_SVD,"' must come first!"));var f=i.compute_low_rank_approximation(c.rank),p=i.get_lhs(c.rank),l=i.get_rhs(c.rank).map((function(e){return Math.round(1e4*e)}));postMessage(function(e,r,t){return{msg:o.LOW_RANK_APPROXIMATION,lowRankApproximation:e,lhs:r,rhs:t}}(new Uint8ClampedArray(f),new Uint16Array(p),new Uint16Array(l)));break;default:throw new Error("unrecognized command '".concat(u,"'!"))}}}},l={};function d(e){var r=l[e];if(void 0!==r)return r.exports;var t=l[e]={id:e,loaded:!1,exports:{}};return p[e](t,t.exports,d),t.loaded=!0,t.exports}d.m=p,d.c=l,d.d=(e,r)=>{for(var t in r)d.o(r,t)&&!d.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:r[t]})},d.f={},d.e=e=>Promise.all(Object.keys(d.f).reduce(((r,t)=>(d.f[t](e,r),r)),[])),d.u=e=>e+".worker.js",d.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),d.hmd=e=>((e=Object.create(e)).children||(e.children=[]),Object.defineProperty(e,"exports",{enumerable:!0,set:()=>{throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: "+e.id)}}),e),d.o=(e,r)=>Object.prototype.hasOwnProperty.call(e,r),d.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;d.g.importScripts&&(e=d.g.location+"");var r=d.g.document;if(!e&&r&&(r.currentScript&&(e=r.currentScript.src),!e)){var t=r.getElementsByTagName("script");t.length&&(e=t[t.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),d.p=e})(),(()=>{var e={224:1};d.f.i=(r,t)=>{e[r]||importScripts(d.p+d.u(r))};var r=self.webpackChunkAutoStegano=self.webpackChunkAutoStegano||[],t=r.push.bind(r);r.push=r=>{var[n,o,i]=r;for(var a in o)d.o(o,a)&&(d.m[a]=o[a]);for(i&&i(d);n.length;)e[n.pop()]=1;t(r)}})(),c={},u={40:function(){return{"./svd_image_compression_worker_bg.js":{__wbg_new_abda76e883ba8a5f:function(){return void 0===e&&(e=d.c[366].exports),e.a2()},__wbg_stack_658279fe44541cf6:function(e,t){return void 0===r&&(r=d.c[366].exports),r.KM(e,t)},__wbg_error_f851667af71bcfc6:function(e,r){return void 0===t&&(t=d.c[366].exports),t.iX(e,r)},__wbindgen_object_drop_ref:function(e){return void 0===n&&(n=d.c[366].exports),n.ug(e)},__wbg_buffer_cf65c07de34b9a08:function(e){return void 0===o&&(o=d.c[366].exports),o.Tq(e)},__wbg_newwithbyteoffsetandlength_4078d56428eb2926:function(e,r,t){return void 0===i&&(i=d.c[366].exports),i.PH(e,r,t)},__wbindgen_throw:function(e,r){return void 0===a&&(a=d.c[366].exports),a.Or(e,r)},__wbindgen_memory:function(){return void 0===s&&(s=d.c[366].exports),s.oH()}}}}},f={601:[40]},d.w={},d.f.wasm=function(e,r){(f[e]||[]).forEach((function(t,n){var o=c[t];if(o)r.push(o);else{var i,a=u[t](),s=fetch(d.p+""+{601:{40:"1e7324f5844c33d4a9e0"}}[e][t]+".module.wasm");i=a&&"function"==typeof a.then&&"function"==typeof WebAssembly.compileStreaming?Promise.all([WebAssembly.compileStreaming(s),a]).then((function(e){return WebAssembly.instantiate(e[0],e[1])})):"function"==typeof WebAssembly.instantiateStreaming?WebAssembly.instantiateStreaming(s,a):s.then((function(e){return e.arrayBuffer()})).then((function(e){return WebAssembly.instantiate(e,a)})),r.push(c[t]=i.then((function(e){return d.w[t]=(e.instance||e).exports})))}}))},d(789)})();
//# sourceMappingURL=svd-worker.worker.js.map