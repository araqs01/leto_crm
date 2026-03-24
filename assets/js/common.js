(function(){
    const getStyle = (element, prop) =>
        parseInt(
            window.getComputedStyle(element)
                .getPropertyValue(prop))

    const getPseudoStyle = (element, prop) =>
        parseInt(
            window.getComputedStyle(element, ':before')
                .getPropertyValue(prop))

    function observable_events(el) {
        var callbacks = {}, slice = [].slice;

        el.on = function(events, fn) {
            if (typeof fn === "function") {
                events.replace(/\S+/g, function(name, pos) {
                    (callbacks[name] = callbacks[name] || []).push(fn);
                    fn.typed = pos > 0;
                });
            }
            return el;
        };

        el.off = function(events, fn) {
            if (events === "*") callbacks = {};
            else if (fn) {
                var arr = callbacks[events];
                for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
                    if (cb === fn) { arr.splice(i, 1); i--; }
                }
            } else {
                events.replace(/\S+/g, function(name) {
                    callbacks[name] = [];
                });
            }
            return el;
        };

        // only single event supported
        el.one = function(name, fn) {
            if (fn) fn.one = true;
            return el.on(name, fn);
        };

        el.trigger = function(name) {
            var args = slice.call(arguments, 1),
                fns = callbacks[name] || [];

            for (var i = 0, fn; (fn = fns[i]); ++i) {
                if (!fn.busy) {
                    fn.busy = true;
                    fn.apply(el, fn.typed ? [name].concat(args) : args);
                    if (fn.one) { fns.splice(i, 1); i--; }
                    fn.busy = false;
                }
            }

            return el;
        };

        return el;
    };


    Element.prototype.slideUp = function (duration = 500) {
        // this.style.boxSizing = 'border-box';
        this.style.height = this.offsetHeight + 'px';
        this.style.overflow = 'hidden';
        this.style.transitionProperty = 'height, margin, padding';
        this.style.transitionDuration = duration + 'ms';
        this.style.transitionTimingFunction = 'ease-out';

        setTimeout(()=>{
            this.style.height = 0;
        }, 0)

        // this.style.paddingTop = 0;
        // this.style.paddingBottom = 0;
        // this.style.marginTop = 0;
        // this.style.marginBottom = 0;
        window.setTimeout( () => {
            this.style.display = 'none';
            this.style.removeProperty('height');
            this.style.removeProperty('overflow');
            this.style.removeProperty('transition-duration');
            this.style.removeProperty('transition-property');
            this.style.removeProperty('transition-timing-function');

            // this.style.removeProperty('padding-top');
            // this.style.removeProperty('padding-bottom');
            // this.style.removeProperty('margin-top');
            // this.style.removeProperty('margin-bottom');
        }, duration);
    }

    Element.prototype.slideDown = function (duration = 500) {
        this.style.removeProperty('display');
        // let display = window.getComputedStyle(this).display;
        // if (display === 'none') display = 'block';
        // this.style.display = display;
        let height = this.offsetHeight;
        this.style.overflow = 'hidden';
        this.style.height = 0;
        // this.style.paddingTop = 0;
        // this.style.paddingBottom = 0;
        // this.style.marginTop = 0;
        // this.style.marginBottom = 0;
        // this.style.boxSizing = 'border-box';
        this.style.transitionProperty = "height";
        this.style.transitionDuration = duration + 'ms';
        this.style.transitionTimingFunction = 'ease-out';

        window.setTimeout(() => {
            this.style.height = height + 'px';
        }, 0)
        window.setTimeout( () => {
            // this.style.removeProperty('padding-top');
            // this.style.removeProperty('padding-bottom');
            // this.style.removeProperty('margin-top');
            // this.style.removeProperty('margin-bottom');
            // this.style.removeProperty('border-box');
            this.style.removeProperty('height');
            this.style.removeProperty('overflow');
            this.style.removeProperty('transition-duration');
            this.style.removeProperty('transition-property');
            this.style.removeProperty('transition-timing-function');
        }, duration);
    }

    class setupSearchHeaderPanel{
        constructor(){
            this.el_form_search_panel = document.querySelector('.form_search_panel');
            if (this.el_form_search_panel){
                this.el_placeholder = this.el_form_search_panel.querySelector('.placeholder');
                this.el_input = this.el_form_search_panel.querySelector('input');
                this.el_submit_btn = this.el_form_search_panel.querySelector('[type="submit"]');

                if (this.el_input){
                    this.el_input.addEventListener('focus', (e)=>{
                        this.el_form_search_panel.classList.add('focused')
                    }) // focus

                    this.el_input.addEventListener('blur', (e)=>{
                        if (this.el_input.value.trim().length > 0){
                            this.el_form_search_panel.classList.add('filled')
                        } else {
                            this.el_form_search_panel.classList.remove('filled')
                        }
                        
                        this.el_form_search_panel.classList.remove('focused')
                    }) // blur
                }

                this.el_form_search_panel.addEventListener('submit', async (e)=>{
                    e.preventDefault();
                    e.stopPropagation();

                    if (this.el_input){
                        if (this.el_input.value.trim().length == 0) return false;

                        let data_from_server = await this.sendSearchDataToServer();
                        console.log(data_from_server);
                    }
                }); // submit
            }
        } // constructor

        async sendSearchDataToServer() {
            let answer = await fetch(this.el_form_search_panel.action, {
                method: 'POST',
                body: JSON.stringify({
                    search_str: this.el_input.value.trim(),
                }),

                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            }) 

            if (!answer.ok) {
                throw new Error('Network response was not ok');
            }

            let json_data = await answer.json()
            console.log('sendSearchDataToServer', json_data);
        } // sendSearchDataToServer()
    }   // setupSearchHeaderPanel


    
    class setupHeaderTimer {
        constructor() {
            this.el_datetime = document.querySelector('.datetime');
            if (this.el_datetime) {
                this.el_date = this.el_datetime.querySelector('.date');
                this.el_time = this.el_datetime.querySelector('.time');


                if (this.el_date && this.el_time) {
                    this.setupDateTime();

                    setInterval(() => {
                        this.date_seconds++;
                        if (this.date_seconds >= 60){
                            this.date_seconds = 0;
                            this.date_minutes++;
                            if (this.date_minutes >= 60){
                                this.date_minutes = 0;
                                this.setupDateTime();
                            }
                        }
                        let str_out = '0';
                        if (this.date_hours < 10) {
                            str_out = str_out + this.date_hours; 
                        } else {
                            str_out = this.date_hours;
                        }

                        if (this.date_minutes < 10) {
                            str_out = str_out + ':0' + this.date_minutes;
                         } else {
                            str_out = str_out + ':' + this.date_minutes;
                         }

                        if (this.date_seconds < 10) {
                            str_out = str_out + ':0' + this.date_seconds; 
                        } else {
                            str_out = str_out + ':' + this.date_seconds;
                        }

                        this.el_time.innerText = str_out;
                        // this.el_time.innerText = this.date_obj.toLocaleTimeString('ru-RU', { hour12: false });
                    }, 1000);
                }
            }
        }

        setupDateTime(){
            this.date_obj = new Date();
            this.date_data = this.date_obj.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
            this.date_weekday = this.date_obj.toLocaleString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            this.el_date.innerText = this.date_data;
            this.el_date.title = this.date_weekday;

            this.date_hours = this.date_obj.getHours();
            this.date_minutes = this.date_obj.getMinutes();
            this.date_seconds = this.date_obj.getSeconds();
        }
    }   // setupHeaderTimer


    class setupHeaderScroll {
        constructor(){
            this.el_header = document.querySelector('header');
            if (this.el_header){
                this.last_scrollPosition = 0;
                this.isHiddenHeader = this.el_header.classList.contains('hide');
                this.HEADER_HEIGHT = parseInt(window.getComputedStyle(this.el_header).getPropertyValue('height'), 10);

                window.addEventListener('scroll', (e) => {
                    const scrollPosition = document.documentElement.scrollTop;
                    let isGoingUp = false;

                    if (scrollPosition < this.last_scrollPosition){
                        isGoingUp = true;
                    } else {
                        isGoingUp = false;
                    }

                    if (isGoingUp){
                        if (this.isHiddenHeader){
                            this.el_header.classList.remove('hide');
                            this.isHiddenHeader = false;
                        }
                    } else {
                        if (scrollPosition > this.HEADER_HEIGHT){
                            if (!this.isHiddenHeader){
                                this.el_header.classList.add('hide');
                                this.isHiddenHeader = true;
                            }
                        } else {
                            if (this.isHiddenHeader){
                                this.el_header.classList.remove('hide');
                                this.isHiddenHeader = false;
                            }
                        }
                    }

                    this.last_scrollPosition = scrollPosition;                    

                }, {passive:true} );                
            }
        }

    } //setupHeader

    class setupMobileMenu {
        constructor(){
            let el_menu_btn = document.querySelector('.menu_hamburger')
            if (el_menu_btn){
                el_menu_btn.addEventListener('click', (e) => {
                    document.body.classList.toggle('mobile_menu_open')
                })
            }

            let el_fadefon = document.querySelector('.fadefon')
            if (el_fadefon){
                el_fadefon.addEventListener('click', (e) => {
                    document.body.classList.toggle('mobile_menu_open')
                })
            }

            // поддержка раскрывающихся под-меню
            let el_mobile_menu = document.querySelector('.mobile_menu')
            if (el_mobile_menu){
                el_mobile_menu.addEventListener('click', (e) => {
                    if (e.target.tagName === 'A'){
                        if (e.target.classList.contains('has_sub_menu')){
                            if (e.target.classList.contains('open')){
                                e.target.classList.remove('open')
                                let el_ul_sub_menu = e.target.nextElementSibling;
                                while (el_ul_sub_menu.tagName !== 'UL') el_ul_sub_menu = el_ul_sub_menu.nextElementSibling;
                                el_ul_sub_menu.slideUp(300);
                            } else {
                                e.target.classList.add('open')
                                let el_ul_sub_menu = e.target.nextElementSibling;
                                while (el_ul_sub_menu.tagName !== 'UL') el_ul_sub_menu = el_ul_sub_menu.nextElementSibling;
                                el_ul_sub_menu.slideDown(300);
                            }
                        }
                    }
                })
            }
        }
    }


    class setupBodyEvents {
        constructor() {
            observable_events(document.body);
        }
    }





    new setupHeaderTimer();
    new setupSearchHeaderPanel();
    new setupMobileMenu();
    new setupHeaderScroll();
    // new setupBodyEvents();


})();