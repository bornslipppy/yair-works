// Mobile perf: cap devicePixelRatio so canvases allocate fewer pixels.
    (function() {
      var _isMobile = window.innerWidth <= 768;
      if (_isMobile) {
        var _nativeDPR = window.devicePixelRatio || 1;
        var _cappedDPR = Math.min(1.5, _nativeDPR);
        Object.defineProperty(window, 'devicePixelRatio', { get: function() { return _cappedDPR; } });
      }
    })();

    window.CanvasRuntimeAPI = (function() {
      var _exportMode = 'auto';
      var _exportWidth = 0;
      var _exportHeight = 0;
      var _bgState = { mode: 'none', color: '#ffffff', imageEl: null, imageDataURL: null, fit: 'cover' };



      var _canvas = document.getElementById('canvas');
      var _area = _canvas ? _canvas.parentElement : document.querySelector('#obys-rotational-embed .tool-canvas-area');
      var _resizeRAF = null;

      function _detectCanvas() {
        var r = window.renderer || window.threeRenderer;
        if (r && r.domElement) {
          _canvas = r.domElement;
          _area = _canvas.parentElement;
          return;
        }
        var area = document.querySelector('#obys-rotational-embed .tool-canvas-area');
        if (area) {
          var canvases = area.querySelectorAll('canvas');
          var visible = [];
          for (var j = 0; j < canvases.length; j++) {
            if (canvases[j].style.display !== 'none') visible.push(canvases[j]);
          }
          if (visible.length >= 1) {
            var largest = visible[0];
            for (var i = 1; i < visible.length; i++) {
              if (visible[i].width * visible[i].height > largest.width * largest.height) {
                largest = visible[i];
              }
            }
            _canvas = largest;
            _area = _canvas.parentElement;
          }
        }
      }




      function _applyBgCSS() {
        _detectCanvas();
        if (!_canvas) return;
        if (_bgState.mode === 'none') {
          _canvas.style.background = '';
        } else if (_bgState.mode === 'solid') {
          _canvas.style.background = _bgState.color;
        } else if (_bgState.mode === 'image') {
          if (_bgState.imageDataURL) {
            var fitCss = _bgState.fit === 'fill' ? '100% 100%' : _bgState.fit;
            _canvas.style.backgroundColor = _bgState.color;
            _canvas.style.backgroundImage = 'url("' + _bgState.imageDataURL + '")';
            _canvas.style.backgroundSize = fitCss;
            _canvas.style.backgroundPosition = 'center';
            _canvas.style.backgroundRepeat = 'no-repeat';
          } else {
            _canvas.style.backgroundImage = '';
            _canvas.style.backgroundColor = _bgState.color;
          }
        }
      }

      function setBackground(state) {
        state = state || {};
        _bgState.mode = state.mode || 'none';
        _bgState.color = state.color || '#ffffff';
        _bgState.fit = state.fit || 'cover';
        if (state.image && state.image !== _bgState.imageDataURL) {
          _bgState.imageDataURL = state.image;
          _bgState.imageEl = null;
          _applyBgCSS();
          var img = new Image();
          img.onload = function() {
            if (_bgState.imageDataURL !== state.image) return;
            _bgState.imageEl = img;
          };
          img.src = state.image;
        } else if (!state.image) {
          _bgState.imageEl = null;
          _bgState.imageDataURL = null;
        }
        _applyBgCSS();
      }

      function getBackground() {
        return { mode: _bgState.mode, color: _bgState.color, fit: _bgState.fit };
      }

      function setCanvas(el) {
        _canvas = el;
        _area = el ? el.parentElement : document.querySelector('#obys-rotational-embed .tool-canvas-area');
        if (_bgState.mode !== 'none') _applyBgCSS();
      }

      function setExportDimensions(w, h) {
        _detectCanvas();
        _exportMode = 'fixed';
        _exportWidth = Math.max(1, Math.round(w || 1));
        _exportHeight = Math.max(1, Math.round(h || 1));
        if (_canvas) {
          _canvas.width = _exportWidth;
          _canvas.height = _exportHeight;
        }
        if (window.p5 && typeof window.resizeCanvas === 'function') window.resizeCanvas(_exportWidth, _exportHeight);
        if (window.renderer && window.renderer.setSize) window.renderer.setSize(_exportWidth, _exportHeight, false);
        if (window.hydra && window.hydra.setResolution) window.hydra.setResolution(_exportWidth, _exportHeight);
        window.dispatchEvent(new Event('resize'));
      }

      function fitToArea() {}

      function getExportDimensions() {
        if (_exportMode === 'fixed') return { width: _exportWidth, height: _exportHeight, mode: 'fixed' };
        _detectCanvas();
        return { width: _canvas ? _canvas.width : 0, height: _canvas ? _canvas.height : 0, mode: 'auto' };
      }

      function isFixedExportMode() { return _exportMode === 'fixed'; }

      function _onAreaResize() {
        var r = window.renderer || window.threeRenderer;
        if (!r || !r.setSize) return;
        if (_resizeRAF) cancelAnimationFrame(_resizeRAF);
        _resizeRAF = requestAnimationFrame(function() {
          _detectCanvas();
          if (!_area) return;
          var w = _area.clientWidth;
          var h = _area.clientHeight;
          if (w <= 0 || h <= 0) return;
          r.setSize(w, h);
          window.dispatchEvent(new Event('resize'));
        });
      }
      if (typeof ResizeObserver !== 'undefined' && _area) {
        new ResizeObserver(_onAreaResize).observe(_area);
      }
      window.addEventListener('resize', _onAreaResize);

      setTimeout(function() {
        _detectCanvas();
        if (_bgState.mode !== 'none') _applyBgCSS();
      }, 500);

      function getMousePos(event) {
        _detectCanvas();
        if (!_canvas) return { x: 0, y: 0 };
        var rect = _canvas.getBoundingClientRect();
        var scaleX = _canvas.width / rect.width;
        var scaleY = _canvas.height / rect.height;
        var touch = event.touches && event.touches[0]
          ? event.touches[0]
          : event.changedTouches && event.changedTouches[0]
          ? event.changedTouches[0]
          : null;
        var clientX = touch ? touch.clientX : event.clientX;
        var clientY = touch ? touch.clientY : event.clientY;
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
        };
      }

      function drawImage(ctx, img, x, y, w, h, fit) {
        if (!img || !img.width || !img.height) return;
        fit = fit || 'cover';
        var ar = img.width / img.height;
        var car = w / h;
        var sx = 0, sy = 0, sw = img.width, sh = img.height;
        var dx = x, dy = y, dw = w, dh = h;

        if (fit === 'cover') {
          if (ar > car) { sw = img.height * car; sx = (img.width - sw) / 2; }
          else { sh = img.width / car; sy = (img.height - sh) / 2; }
        } else if (fit === 'contain') {
          if (ar > car) { dh = w / ar; dy = y + (h - dh) / 2; }
          else { dw = h * ar; dx = x + (w - dw) / 2; }
        }

        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      }

      return {
        setCanvas: setCanvas,
        setBackground: setBackground,
        getBackground: getBackground,
        setExportDimensions: setExportDimensions,
        fitToArea: fitToArea,
        getExportDimensions: getExportDimensions,
        isFixedExportMode: isFixedExportMode,


        getMousePos: getMousePos,
        drawImage: drawImage
      };
    })();

    window.ChatoolyCanvas = window.CanvasRuntimeAPI;
    window.ChatoolyControls = window.ControlsAPI;

    (function() {
      var srcDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
      if (srcDesc && srcDesc.set) {
        Object.defineProperty(HTMLImageElement.prototype, 'src', {
          get: srcDesc.get,
          set: function(val) {
            if (val && typeof val === 'string' && !val.startsWith('data:') && !this.crossOrigin) {
              this.crossOrigin = 'anonymous';
            }
            srcDesc.set.call(this, val);
          },
          configurable: true,
          enumerable: true
        });
      }
    })();

    window.loadImage = function(src, callback) {
      var img = new Image();
      if (src && typeof src === 'string' && !src.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = function() { if (callback) callback(img); };
      img.onerror = function() { console.error('Failed to load image:', src); };
      img.src = src;
      return img;
    };
