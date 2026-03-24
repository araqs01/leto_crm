(function(){
  class Notify {
    _emptyFunc = () => {

    };

    constructor(params) {
      this._title = params['title']  ? params['title'] : false;
      this._text = params['text'] || 'Message...';
      this._theme = params['theme'] ? params['theme'] : 'default';
      this._autohide = params['autohide'] ? params['autohide'] : true;
      this._showtime = params['showtime'] ? parseInt(params['showtime'], 10) : 5000;
      this._hidingtime = params['hidingtime'] ? parseInt(params['hidingtime'], 10) : 300;
      this._callback = typeof params['afterhide'] === 'function' ? params['afterhide'] : this._emptyFunc;
      this._callback_data = params['afterhide_data'] ? params['afterhide_data'] : false;

      this._create();
      this._el.addEventListener('click', (e) => {
        if (e.target.classList.contains('notify__close')) {
          this._hide();
        }
      });
      this._show();
    }




    _show() {
      this._el.dispatchEvent(new Event('show.notify', {bubbles: true}));
      this._el.classList.add('notify_showing');
      this._el.classList.add('notify_show');
      window.setTimeout(() => {
        this._el.classList.remove('notify_showing');
        this._el.style.height = getComputedStyle( this._el ).height;
      });
      if (this._autohide) {
        setTimeout(() => {
          this._hide();
        }, this._showtime);
      }
    }

    _hide() {
      this._el.style.height = '0';
      this._el.style.marginBottom = '0';
      this._el.classList.add('notify_showing');

      this._timer = setTimeout(()=>{
        this._el.remove();
      }, this._hidingtime);

      // this._el.addEventListener('transitionend', () => {
      // this._el.remove();
      // }, {once : true});

      this._callback(this._callback_data);
      this._el.dispatchEvent(new Event('hide.notify', {bubbles: true}))
    }

    _create() {
      const el = document.createElement('div');
      el.classList.add('notify');
      el.classList.add(`notify_${this._theme}`);
      let html = `{header}<div class="notify__body"></div><button class="notify__close" type="button"></button>`;
      const htmlHeader = this._title === false ? '' : '<div class="notify__header"></div>';
      html = html.replace('{header}', htmlHeader);
      el.innerHTML = html;
      if (this._title) {
        el.querySelector('.notify__header').textContent = this._title;
      } else {
        el.classList.add('notify_message');
      }
      el.querySelector('.notify__body').textContent = this._text;
      this._el = el;

      if (!document.querySelector('.notify-container')) {
        const container = document.createElement('div');
        container.classList.add('notify-container');
        document.body.append(container);
      }
      document.querySelector('.notify-container').append(this._el);
    }

    static hide(el) {
      el.classList.add('notify_showing');
      el.addEventListener('transitionend', () => {
        el.remove();
      }, {once : true});
      el.dispatchEvent(new Event('hide.notify', {bubbles: true}))
    }
  }


  document.body.addEventListener('Notify', (e) => {
    if (e.detail.params) {
      new Notify(e.detail.params)
    }
  })

})();
