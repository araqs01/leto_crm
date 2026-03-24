(function(){
    // Polyfill for element.matches, to support Internet Explorer. It's a relatively
    // simple polyfill, so we'll just include it rather than require the user to
    // include the polyfill themselves. Adapted from
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
    const matches = (element, selector) => {
        return element.matches
            ? element.matches(selector)
            : element.msMatchesSelector
                ? element.msMatchesSelector(selector)
                : element.webkitMatchesSelector
                    ? element.webkitMatchesSelector(selector)
                    : null
    }

    const closestPolyfill = (el, selector) => {
        let element = el
        while (element && element.nodeType === 1) {
            if (matches(element, selector)) {
                return element
            }
            element = element.parentNode
        }
        return null
    }

    const closest = (element, selector) => {
        return element.closest
            ? element.closest(selector)
            : closestPolyfill(element, selector)
    }

    // Returns true if the value has a "then" function. Adapted from
    // https://github.com/graphql/graphql-js/blob/499a75939f70c4863d44149371d6a99d57ff7c35/src/jsutils/isPromise.js
    const isPromise = (value) => Boolean(value && typeof value.then === 'function')

    // Generates a unique ID, with optional prefix. Adapted from
    // https://github.com/lodash/lodash/blob/61acdd0c295e4447c9c10da04e287b1ebffe452c/uniqueId.js
    let idCounter = 0
    const uniqueId = (prefix = '') => `${prefix}${++idCounter}`


    // Calculates whether element2 should be above or below element1. Always
    // places element2 below unless all of the following:
    // 1. There isn't enough visible viewport below to fit element2
    // 2. There is more room above element1 than there is below
    // 3. Placing elemen2 above 1 won't overflow window
    const getRelativePosition = (element1, element2) => {
        const position1 = element1.getBoundingClientRect()
        const position2 = element2.getBoundingClientRect()

        const positionAbove =
            /* 1 */ position1.bottom + position2.height > window.innerHeight &&
            /* 2 */ window.innerHeight - position1.bottom < position1.top &&
            /* 3 */ window.pageYOffset + position1.top - position2.height > 0

        return positionAbove ? 'above' : 'below'
    }

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    const debounce = (func, wait, immediate) => {
        let timeout

        return function executedFunction() {
            const context = this
            const args = arguments

            const later = function () {
                timeout = null
                if (!immediate) func.apply(context, args)
            }

            const callNow = immediate && !timeout
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)

            if (callNow) func.apply(context, args)
        }
    }

    /**
     * @typedef {Object} LabelObj
     * @property {string} attribute - `aria-label` | `aria-labelledby`
     * @property {string} content - content of attribute
     */

    /**
     * @param {string} labelStr - content for `aria-label` or – if it starts with `#` – ID for `aria-labelledby`
     * @returns {LabelObj} Object with label attribute and its content
     */
    const getAriaLabel = (labelStr) => {
        if (labelStr?.length) {
            const isLabelId = labelStr.startsWith('#')

            return {
                attribute: isLabelId ? 'aria-labelledby' : 'aria-label',
                content: isLabelId ? labelStr.substring(1) : labelStr,
            }
        }
    }

    class phoneMask {
        #el_input = null;

        #onKeyDownFn = null;
        #onInputFn = null;
        #onPasteFn = null;

        constructor(el_input) {
            this.#el_input = el_input
            if (el_input) {
                this.#onKeyDownFn = this.onPhoneKeyDown.bind(this)
                this.#onInputFn = this.onPhoneInput.bind(this)
                this.#onPasteFn = this.onPhonePaste.bind(this)
                el_input.addEventListener('keydown', this.#onKeyDownFn)
                el_input.addEventListener('input', this.#onInputFn, false)
                el_input.addEventListener('paste', this.#onPasteFn, false)
            }
        }

        destroy(){
            if (this.#el_input) {
                this.#el_input.removeEventListener('keydown', this.#onKeyDownFn)
                this.#el_input.removeEventListener('input', this.#onInputFn)
                this.#el_input.removeEventListener('paste', this.#onPasteFn)
            }
        }

        getInputNumbersValue(el_input) {
            return el_input.value.replace(/\D/g, '')
        }

        onPhoneKeyDown(e) {
            let inputValue = e.target.value.replace(/\D/g, '')
            if (e.keyCode === 8 && inputValue.length === 1) {
                e.target.value = ""
            }
        }

        onPhoneInput(e) {
            let input = e.target,
                inputNumbersValue = this.getInputNumbersValue(input),
                selectionStart = input.selectionStart,
                formattedInputValue = ""

            if (!inputNumbersValue) {
                return input.value = "";
            }

            if (input.value.length !== selectionStart) {
                if (e.data && /\D/g.test(e.data)) {
                    input.value = inputNumbersValue
                }
                return;
            }
            if (["7", "8", "9"].indexOf(inputNumbersValue[0]) > -1) {
                if (inputNumbersValue[0] === "9") inputNumbersValue = "8" + inputNumbersValue
                let firstSymbols = (inputNumbersValue[0] === "7") ? "8" : "8"
                formattedInputValue = input.value = firstSymbols + "-"
                if (inputNumbersValue.length > 1) {
                    formattedInputValue += '' + inputNumbersValue.substring(1, 4)
                }
                if (inputNumbersValue.length >= 5) {
                    formattedInputValue += '-' + inputNumbersValue.substring(4, 7)
                }
                if (inputNumbersValue.length >= 8) {
                    formattedInputValue += '-' + inputNumbersValue.substring(7, 9)
                }
                if (inputNumbersValue.length >= 10) {
                    formattedInputValue += '-' + inputNumbersValue.substring(9, 11)
                }
            } else {
                formattedInputValue = '+' + inputNumbersValue.substring(0, 16)
            }
            input.value = formattedInputValue
        }

        onPhonePaste(e) {
            let input = e.target
            let inputNumbersValue = this.getInputNumbersValue(input)

            let pasted = e.clipboardData || window.clipboardData
            if (pasted) {
                let pastedText = pasted.getData('Text');
                if (/\D/g.test(pastedText)) {
                    input.value = inputNumbersValue
                    return;
                }
            }
        }
    } // class phoneMask

    class percentMask {
        #el_input = null;
        #has_comma = false;

        #onKeyDownFn = null;
        #onInputFn = null;
        #onPasteFn = null;
        #onBlurFn = null;

        constructor(el_input) {
            this.#el_input = el_input

            if (el_input) {
                this.#onKeyDownFn = this.onPercentKeyDown.bind(this)
                this.#onInputFn = this.onPercentInput.bind(this)
                this.#onPasteFn = this.onPercentPaste.bind(this)
                this.#onBlurFn  = this.onPercentBlur.bind(this)

                el_input.addEventListener('keydown', this.#onKeyDownFn)
                el_input.addEventListener('input', this.#onInputFn, false)
                el_input.addEventListener('paste', this.#onPasteFn, false)
                el_input.addEventListener('blur', this.#onBlurFn, false)
            }
        }

        destroy(){
            if (this.#el_input) {
                this.#el_input.removeEventListener('keydown', this.#onKeyDownFn)
                this.#el_input.removeEventListener('input', this.#onInputFn)
                this.#el_input.removeEventListener('paste', this.#onPasteFn)
                this.#el_input.removeEventListener('blur', this.#onBlurFn)
            }
        }

        onPercentBlur(e){
            let el_input = e.target
            let input_value = this.getInputNumbersValue(el_input)
            if (input_value.indexOf(',') > -1){
                if (input_value.substring(input_value.length-1) === ','){
                    el_input.value = Math.round(parseFloat(input_value))
                }
            }
        }

        getInputNumbersValue(el_input) {
            let input_value = el_input.value.replace('.', ',').replace(/[^0-9,]/g, '');
            this.#has_comma = input_value.indexOf(',') > -1;
            return input_value;
        }

        onPercentKeyDown(e) {
            if ((e.keyCode === 188) || (e.keyCode === 190) || (e.keyCode === 191)) {
                if (this.#has_comma) e.preventDefault();
                this.#has_comma = true;
            }
        }

        onPercentInput(e) {
            let el_input = e.target
            let input_value = this.getInputNumbersValue(el_input)
            let selectionStart = el_input.selectionStart


            if (!input_value) {
                this.#has_comma = false;
                return el_input.value = "";
            }

            if (el_input.value.length !== selectionStart) {
                if (e.data && /[^0-9,]/g.test(e.data)) {
                    el_input.value = input_value
                }
                return;
            }

            el_input.value = input_value.substring(0, 7)
        }

        onPercentPaste(e) {
            let el_input = e.target
            let input_value = this.getInputNumbersValue(el_input)

            let pasted = e.clipboardData || window.clipboardData
            if (pasted) {
                let pastedText = pasted.getData('Text');
                if (/[^0-9,]/g.test(pastedText)) {
                    el_input.value = input_value
                }
            }
        }
    } // class percentMask

    class integerMask{
        #el_input = null;

        #onKeyDownFn = null;
        #onPasteFn = null;
        #keyCodes = [8, 18, 37, 39, 46];

        constructor(el_input) {
            this.#el_input = el_input

            if (el_input) {
                this.#onKeyDownFn = this.onKeyDown.bind(this)
                this.#onPasteFn = this.onPaste.bind(this)
                el_input.addEventListener('keydown', this.#onKeyDownFn)
                el_input.addEventListener('paste', this.#onPasteFn, false)
            }
        }

        destroy(){
            if (this.#el_input) {
                this.#el_input.removeEventListener('keydown', this.#onKeyDownFn)
                this.#el_input.removeEventListener('paste', this.#onPasteFn)
            }
        }

        onKeyDown(e) {
            if ((e.keyCode >= 48) && (e.keyCode <= 57)){

            } else {
                if (this.#keyCodes.indexOf(e.keyCode) > -1){

                } else {
                    if (!e.ctrlKey) e.preventDefault();
                }
            }
        }

        onPaste(e) {
            let el_input = e.target
            let input_value = el_input.value.replace(/[^0-9]/g, '')

            // console.log('onPaste input_value', input_value)

            let pasted = e.clipboardData || window.clipboardData
            if (pasted) {
                let pastedText = pasted.getData('Text');
                pastedText = parseInt(pastedText.replace(/\D/g, ''), 10)
                if (isNaN(pastedText)) el_input.value = input_value
            }
        }
    } // class integerMask

    class floatMask {
        #el_input = null;
        #has_comma = false;

        #onKeyDownFn = null;
        #onInputFn = null;
        #onPasteFn = null;
        #onBlurFn = null;

        constructor(el_input) {
            this.#el_input = el_input

            if (el_input) {
                this.#onKeyDownFn = this.onKeyDown.bind(this)
                this.#onInputFn = this.onInput.bind(this)
                this.#onPasteFn = this.onPaste.bind(this)
                this.#onBlurFn  = this.onBlur.bind(this)
                el_input.addEventListener('keydown', this.#onKeyDownFn)
                el_input.addEventListener('input', this.#onInputFn, false)
                el_input.addEventListener('paste', this.#onPasteFn, false)
                el_input.addEventListener('blur', this.#onBlurFn, false)
            }
        }

        destroy(){
            if (this.#el_input) {
                this.#el_input.removeEventListener('keydown', this.#onKeyDownFn)
                this.#el_input.removeEventListener('input', this.#onInputFn)
                this.#el_input.removeEventListener('paste', this.#onPasteFn)
                this.#el_input.removeEventListener('blur', this.#onBlurFn)
            }
        }

        onBlur(e){
            let el_input = e.target
            let input_value = this.getInputNumbersValue(el_input)
            if (input_value.indexOf(',') > -1){
                if (input_value.substring(input_value.length-1) === ','){
                    el_input.value = Math.round(parseFloat(input_value))
                }
            }
        }

        getInputNumbersValue(el_input) {
            let input_value = el_input.value.replace('.', ',').replace(/[^0-9,]/g, '');
            this.#has_comma = input_value.indexOf(',') > -1;
            return input_value;
        }

        onKeyDown(e) {
            if ((e.keyCode === 188) || (e.keyCode === 190) || (e.keyCode === 191)) {
                if (this.#has_comma) e.preventDefault();
                this.#has_comma = true;
            }
        }

        onInput(e) {
            let el_input = e.target
            let input_value = this.getInputNumbersValue(el_input)
            let selectionStart = el_input.selectionStart


            if (!input_value) {
                this.#has_comma = false;
                return el_input.value = "";
            }

            if (el_input.value.length !== selectionStart) {
                if (e.data && /[^0-9,]/g.test(e.data)) {
                    el_input.value = input_value
                }
                return;
            }

            el_input.value = input_value.substring(0, 10)
        }

        onPaste(e) {
            let el_input = e.target
            let input_value = this.getInputNumbersValue(el_input)

            let pasted = e.clipboardData || window.clipboardData
            if (pasted) {
                let pastedText = pasted.getData('Text');
                if (/[^0-9,]/g.test(pastedText)) {
                    el_input.value = input_value
                }
            }
        }
    } // class floatMask

    class currencyMask {
        #el_input = null;
        #has_comma = false;
        #num_digits_after_comma = 0;

        #onKeyDownFn = null;
        #onInputFn = null;
        #onPasteFn = null;
        #onBlurFn = null;
        #onEnterFn = null;

        constructor(el_input) {
            this.#el_input = el_input

            if (el_input) {
                this.#onKeyDownFn = this.onKeyDown.bind(this)
                this.#onInputFn = this.onInput.bind(this)
                this.#onPasteFn = this.onPaste.bind(this)
                this.#onBlurFn  = this.onBlur.bind(this)
                this.#onEnterFn  = this.onEnter.bind(this)
                el_input.addEventListener('keydown', this.#onKeyDownFn)
                el_input.addEventListener('input', this.#onInputFn, false)
                el_input.addEventListener('paste', this.#onPasteFn, false)
                el_input.addEventListener('blur', this.#onBlurFn, false)
                el_input.addEventListener('focus', this.#onEnterFn, false)
            }
        }

        destroy(){
            if (this.#el_input) {
                this.#el_input.removeEventListener('keydown', this.#onKeyDownFn)
                this.#el_input.removeEventListener('input', this.#onInputFn)
                this.#el_input.removeEventListener('paste', this.#onPasteFn)
                this.#el_input.removeEventListener('blur', this.#onBlurFn)
                this.#el_input.removeEventListener('focus', this.#onEnterFn)
            }
        }

        onEnter(e){
            let el_input = e.target
            let input_value = el_input.value
            el_input.value = input_value.replaceAll(' ', '')
        }

        onBlur(e){
            let el_input = e.target
            let input_value = this.getInputNumbersValue(el_input)
            let pos_comma = input_value.indexOf(',');

            if (pos_comma === (input_value.length-1) ){
                input_value = input_value.substring(0, input_value.length-1)
            }
            if  ( (pos_comma !== -1) && (pos_comma === (input_value.length-2)) ){
                input_value = input_value + '0'
            }

            let len = input_value.length-1;
            let cnt = 0;
            for(let i=0; i<len; i++){
                if (input_value[i] === '0') {
                    cnt++;
                } else break;
            }
            if (pos_comma === cnt) cnt--;
            if (cnt > 0){
                input_value = input_value.substring(cnt)
                pos_comma -= cnt
            }

            let str_out = '';
            cnt = 0;
            len = input_value.length-1;
            for(let i=len; i >= 0; i--){
                if ( (cnt !== 0) && ((cnt % 3) === 0) ) str_out = ' ' + str_out;
                if (pos_comma === i) str_out = input_value[i] + ' ' + str_out; else str_out = input_value[i] + str_out;
                if ( (pos_comma !== -1) && (pos_comma <= i) ) cnt--;
                cnt++;
            }
            el_input.value = str_out
        }

        getInputNumbersValue(el_input) {
            let input_value = el_input.value.replace('.', ',').replace(/[^0-9,]/g, '');
            this.#has_comma = input_value.indexOf(',') > -1;
            if (this.#has_comma){
                this.#num_digits_after_comma = input_value.substring(input_value.indexOf(',') + 1).length;
                if (this.#num_digits_after_comma > 2){
                    input_value = input_value.substring(0, input_value.indexOf(',') + 1 + 2)
                }
            }
            return input_value;
        }

        onKeyDown(e) {
            if ((e.keyCode === 188) || (e.keyCode === 190) || (e.keyCode === 191)) {
                if (this.#has_comma) e.preventDefault();
                this.#has_comma = true;
            }
        }

        onInput(e) {
            let el_input = e.target
            let input_value = this.getInputNumbersValue(el_input)
            let selectionStart = el_input.selectionStart

            if (!input_value) {
                this.#has_comma = false;
                return el_input.value = "";
            }

            if (el_input.value.length !== selectionStart) {
                if (e.data && /[^0-9,]/g.test(e.data)) {
                    el_input.value = input_value
                }
                return;
            }

            el_input.value = input_value.substring(0, 16)
        }

        onPaste(e) {
            let el_input = e.target
            let input_value = this.getInputNumbersValue(el_input)

            let pasted = e.clipboardData || window.clipboardData
            if (pasted) {
                let pastedText = pasted.getData('Text');
                if (/[^0-9,]/g.test(pastedText)) {
                    el_input.value = input_value
                }
            }
        }
    } // class currencyMask

    class MultiSelect {

        constructor(element, options = {}) {
            let defaults = {
                placeholder: 'Выберите',
                max: null,
                min: null,
                disabled: false,
                search: true,
                selectAll: true,
                listAll: true,
                closeListOnItemSelect: false,
                name: '',
                width: '',
                height: '',
                dropdownWidth: '',
                dropdownHeight: '',
                data: [],
                onChange: function () {
                },
                onSelect: function () {
                },
                onUnselect: function () {
                },
                onMaxReached: function () {
                }
            };
            this.options = Object.assign(defaults, options);
            this.selectElement = typeof element === 'string' ? document.querySelector(element) : element;
            this.originalSelectElement = this.selectElement.cloneNode(true);
            for (const prop in this.selectElement.dataset) {
                if (this.options[prop] !== undefined) {
                    if (typeof this.options[prop] === 'boolean') {
                        this.options[prop] = this.selectElement.dataset[prop] === 'true';
                    } else {
                        this.options[prop] = this.selectElement.dataset[prop];
                    }
                }
            }
            this.name = this.selectElement.getAttribute('name') ? this.selectElement.getAttribute('name') : 'multi-select-' + Math.floor(Math.random() * 1000000);
            if (!this.options.data.length) {
                let options = this.selectElement.querySelectorAll('option');
                for (let i = 0; i < options.length; i++) {
                    this.options.data.push({
                        value: options[i].value,
                        text: options[i].innerHTML,
                        selected: options[i].selected,
                        html: options[i].getAttribute('data-html')
                    });
                }
            }
            this.originalData = JSON.parse(JSON.stringify(this.options.data));
            this.element = this._template();
            this.selectElement.replaceWith(this.element);
            this.outsideClickHandler = this._outsideClick.bind(this);
            this._updateSelected();
            this._eventHandlers();
            if (this.options.disabled) {
                this.disable();
            }
        }

        _template() {
            let optionsHTML = '';
            for (let i = 0; i < this.data.length; i++) {
                const isSelected = this.data[i].selected;
                optionsHTML += `
                <div class="multi-select-option${isSelected ? ' multi-select-selected' : ''}" data-value="${this.data[i].value}" role="option" aria-selected="${isSelected}" tabindex="-1">
                    <span class="multi-select-option-radio"></span>
                    <span class="multi-select-option-text">${this.data[i].html ? this.data[i].html : this.data[i].text}</span>
                </div>
            `;
            }
            let selectAllHTML = '';
            if (this.options.selectAll) {
                selectAllHTML = `<div class="multi-select-all" role="option" tabindex="-1">
                <span class="multi-select-option-radio"></span>
                <span class="multi-select-option-text">Выбрать всё</span>
            </div>`;
            }
            let template = `
            <div class="multi-select ${this.name}"${(this.options.num_in_window_array !== undefined) ? ' data-numInWindowArray="' + this.options.num_in_window_array + '"' : ''}${this.selectElement.id ? ' id="' + this.selectElement.id + '"' : ''} style="${this.width ? 'width:' + this.width + ';' : ''}${this.height ? 'height:' + this.height + ';' : ''}" role="combobox" aria-haspopup="listbox" aria-expanded="false">
                ${this.selectedValues.map(value => `<input type="hidden" name="${this.name}[]" value="${value}">`).join('')}
                <div class="multi-select-header" style="${this.width ? 'width:' + this.width + ';' : ''}${this.height ? 'height:' + this.height + ';' : ''}" tabindex="0">
                    <span class="multi-select-header-max">${this.options.max ? this.selectedValues.length + '/' + this.options.max : ''}</span>
                    <span class="multi-select-header-placeholder">${this.placeholder}</span>
                </div>
                <div class="multi-select-options" style="${this.options.dropdownWidth ? 'width:' + this.options.dropdownWidth + ';' : ''}${this.options.dropdownHeight ? 'height:' + this.options.dropdownHeight + ';' : ''}" role="listbox">
                    ${this.options.search ? '<input type="text" class="multi-select-search" placeholder="Поиск..." role="searchbox">' : ''}
                    ${selectAllHTML}
                    ${optionsHTML}
                </div>
            </div>
        `;
            let element = document.createElement('div');
            element.innerHTML = template;
            return element.firstElementChild;
        }

        _eventHandlers() {
            let headerElement = this.element.querySelector('.multi-select-header');
            const toggleDropdown = (forceClose = false) => {
                if (this.element.classList.contains('disabled')) return;
                if (forceClose || headerElement.classList.contains('multi-select-header-active')) {
                    headerElement.classList.remove('multi-select-header-active');
                    this.element.setAttribute('aria-expanded', 'false');
                } else {
                    headerElement.classList.add('multi-select-header-active');
                    this.element.setAttribute('aria-expanded', 'true');
                }
            };
            this.element.querySelectorAll('.multi-select-option').forEach(option => {
                option.onclick = (e) => {
                    e.stopPropagation();
                    if (this.element.classList.contains('disabled')) return;
                    let selected = true;
                    if (!option.classList.contains('multi-select-selected')) {
                        if (this.options.max && this.selectedValues.length >= this.options.max) {
                            this.options.onMaxReached(this.options.max);
                            return;
                        }
                        option.classList.add('multi-select-selected');
                        option.setAttribute('aria-selected', 'true');
                        this.element.insertAdjacentHTML('afterbegin', `<input type="hidden" name="${this.name}[]" value="${option.dataset.value}">`);
                        this.data.find(data => data.value == option.dataset.value).selected = true;
                    } else {
                        option.classList.remove('multi-select-selected');
                        option.setAttribute('aria-selected', 'false');
                        this.element.querySelector(`input[value="${option.dataset.value}"]`).remove();
                        this.data.find(data => data.value == option.dataset.value).selected = false;
                        selected = false;
                    }
                    this._updateHeader();
                    if (this.options.search) {
                        this.element.querySelector('.multi-select-search').value = '';
                        this.element.querySelectorAll('.multi-select-option').forEach(opt => opt.style.display = 'flex');
                    }
                    if (this.options.closeListOnItemSelect) {
                        toggleDropdown(true);
                    }
                    this.options.onChange(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                    if (selected) {
                        this.options.onSelect(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                    } else {
                        this.options.onUnselect(option.dataset.value, option.querySelector('.multi-select-option-text').innerHTML, option);
                    }
                    this._validate();
                };
            });
            headerElement.onclick = () => toggleDropdown();
            if (this.options.search) {
                let search = this.element.querySelector('.multi-select-search');
                search.oninput = () => {
                    this.element.querySelectorAll('.multi-select-option').forEach(option => {
                        const text = option.querySelector('.multi-select-option-text').innerHTML.toLowerCase();
                        option.style.display = text.includes(search.value.toLowerCase()) ? 'flex' : 'none';
                    });
                };
            }
            if (this.options.selectAll) {
                let selectAllButton = this.element.querySelector('.multi-select-all');
                selectAllButton.onclick = (e) => {
                    e.stopPropagation();
                    if (this.element.classList.contains('disabled')) return;
                    let allSelected = selectAllButton.classList.contains('multi-select-selected');
                    this.element.querySelectorAll('.multi-select-option').forEach(option => {
                        let dataItem = this.data.find(data => data.value == option.dataset.value);
                        if (dataItem && ((allSelected && dataItem.selected) || (!allSelected && !dataItem.selected))) {
                            option.click();
                        }
                    });
                    selectAllButton.classList.toggle('multi-select-selected');
                };
            }
            if (this.selectElement.id && document.querySelector('label[for="' + this.selectElement.id + '"]')) {
                document.querySelector('label[for="' + this.selectElement.id + '"]').onclick = () => {
                    toggleDropdown();
                };
            }
            document.addEventListener('click', this.outsideClickHandler);
            headerElement.addEventListener('keydown', (e) => {
                if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
                    e.preventDefault();
                    toggleDropdown();
                    const firstElement = this.element.querySelector('[role="searchbox"]') || this.element.querySelector('[role="option"]');
                    if (firstElement) firstElement.focus();
                }
            });
            this.element.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    toggleDropdown(true);
                    headerElement.focus();
                }
            });
            const optionsContainer = this.element.querySelector('.multi-select-options');
            optionsContainer.addEventListener('keydown', (e) => {
                const currentFocused = document.activeElement;
                if (currentFocused.closest('.multi-select-options')) {
                    if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
                        e.preventDefault();
                        const direction = e.key === 'ArrowDown' ? 'nextElementSibling' : 'previousElementSibling';
                        let nextElement = currentFocused[direction];
                        while (nextElement && (nextElement.style.display === 'none' || !nextElement.matches('[role="option"], [role="searchbox"]'))) {
                            nextElement = nextElement[direction];
                        }
                        if (nextElement) nextElement.focus();
                    } else if (['Enter', ' '].includes(e.key) && currentFocused.matches('[role="option"]')) {
                        e.preventDefault();
                        currentFocused.click();
                    }
                }
            });
        }

        _updateHeader() {
            this.element.querySelectorAll('.multi-select-header-option, .multi-select-header-placeholder').forEach(el => el.remove());
            if (this.selectedValues.length > 0) {
                if (this.options.listAll) {
                    this.selectedItems.forEach(item => {
                        const el = document.createElement('span');
                        el.className = 'multi-select-header-option';
                        el.dataset.value = item.value;
                        el.innerHTML = item.text;
                        this.element.querySelector('.multi-select-header').prepend(el);
                    });
                } else {
                    this.element.querySelector('.multi-select-header').insertAdjacentHTML('afterbegin', `<span class="multi-select-header-option">${this.selectedValues.length} selected</span>`);
                }
            } else {
                this.element.querySelector('.multi-select-header').insertAdjacentHTML('beforeend', `<span class="multi-select-header-placeholder">${this.placeholder}</span>`);
            }
            if (this.options.max) {
                this.element.querySelector('.multi-select-header-max').innerHTML = this.selectedValues.length + '/' + this.options.max;
            }
        }

        _updateSelected() {
            this._updateHeader();
        }

        _validate() {
            if (this.options.min && this.selectedValues.length < this.options.min) {
                this.element.classList.add('multi-select-invalid');
            } else {
                this.element.classList.remove('multi-select-invalid');
            }
        }

        _outsideClick(event) {
            if (!this.element.contains(event.target) && !event.target.closest('label[for="' + this.selectElement.id + '"]')) {
                let headerElement = this.element.querySelector('.multi-select-header');
                if (headerElement.classList.contains('multi-select-header-active')) {
                    headerElement.classList.remove('multi-select-header-active');
                    this.element.setAttribute('aria-expanded', 'false');
                }
            }
        }

        select(value) {
            const option = this.element.querySelector(`.multi-select-option[data-value="${value}"]`);
            if (option && !option.classList.contains('multi-select-selected')) {
                option.click();
            }
        }

        unselect(value) {
            const option = this.element.querySelector(`.multi-select-option[data-value="${value}"]`);
            if (option && option.classList.contains('multi-select-selected')) {
                option.click();
            }
        }

        setValues(values) {
            this.data.forEach(item => {
                item.selected = values.includes(item.value);
            });
            this.refresh();
        }

        disable() {
            this.element.classList.add('disabled');
            this.element.querySelector('.multi-select-header').removeAttribute('tabindex');
            const searchInput = this.element.querySelector('.multi-select-search');
            if (searchInput) searchInput.disabled = true;
        }

        enable() {
            this.element.classList.remove('disabled');
            this.element.querySelector('.multi-select-header').setAttribute('tabindex', '0');
            const searchInput = this.element.querySelector('.multi-select-search');
            if (searchInput) searchInput.disabled = false;
        }

        destroy() {
            this.element.replaceWith(this.originalSelectElement);
            document.removeEventListener('click', this.outsideClickHandler);
        }

        refresh() {
            const newElement = this._template();
            this.element.replaceWith(newElement);
            this.element = newElement;
            this._updateSelected();
            this._eventHandlers();
            this._validate();
        }

        addItem(item) {
            this.options.data.push(item);
            this.refresh();
        }

        addItems(items) {
            this.options.data.push(...items);
            this.refresh();
        }

        async fetch(url, options = {}) {
            const response = await fetch(url, options);
            const data = await response.json();
            this.addItems(data);
            if (this.options.onload) {
                this.options.onload(data, this.options);
            }
        }

        removeItem(value) {
            this.options.data = this.options.data.filter(item => item.value !== value);
            this.refresh();
        }

        clear() {
            this.options.data = [];
            this.refresh();
        }

        reset() {
            this.data = JSON.parse(JSON.stringify(this.originalData));
            this.refresh();
        }

        selectAll() {
            this.data.forEach(item => item.selected = true);
            this.refresh();
        }

        get selectedValues() {
            return this.data.filter(d => d.selected).map(d => d.value);
        }

        get selectedItems() {
            return this.data.filter(d => d.selected);
        }

        get data() {
            return this.options.data;
        }

        set data(value) {
            this.options.data = value;
        }

        set selectElement(value) {
            this.options.selectElement = value;
        }

        get selectElement() {
            return this.options.selectElement;
        }

        set element(value) {
            this.options.element = value;
        }

        get element() {
            return this.options.element;
        }

        set placeholder(value) {
            this.options.placeholder = value;
        }

        get placeholder() {
            return this.options.placeholder;
        }

        set name(value) {
            this.options.name = value;
        }

        get name() {
            return this.options.name;
        }

        set width(value) {
            this.options.width = value;
        }

        get width() {
            return this.options.width;
        }

        set height(value) {
            this.options.height = value;
        }

        get height() {
            return this.options.height;
        }

    }

    class uiSwitch {
        #uiSwitch = null;
        #onChangeFn = null;

        constructor(el_switch) {
            this.#uiSwitch = el_switch

            if (!el_switch.classList.contains('js-handled')) {
                this.#onChangeFn = this.onChangeEventHandler.bind(this)
                el_switch.addEventListener('change', this.#onChangeFn)
                el_switch.classList.add('js-handled')
                let el_input = el_switch.querySelector('input')
                if (el_input) {
                    if (el_input.getAttribute('checked')) {
                        el_input.checked = true
                        el_input.value = '1'
                    } else {
                        el_input.checked = false
                        el_input.value = '0'
                    }
                }
            }
        }

        destroy(){
            if (this.#uiSwitch) {
                this.#uiSwitch.removeEventListener('change', this.#onChangeFn)
            }
        }

        onChangeEventHandler(e) {
            if (e.currentTarget.tagName === 'LABEL') {
                let el_input = e.target;
                if (el_input) {
                    if (el_input.getAttribute('checked')) {
                        // if (el_input.checked){
                        el_input.removeAttribute('checked')
                        el_input.value = '0'
                    } else {
                        el_input.setAttribute('checked', 'checked')
                        el_input.value = '1'
                    }
                }

                let el_label = e.currentTarget;
                if (el_label.dataset.switchTextOn && el_label.dataset.switchTextOff) {
                    let el_span = el_label.querySelector('span')
                    if (el_span) {
                        if (el_input.value === '1') {
                            el_span.innerText = el_label.dataset.switchTextOn;
                        } else {
                            el_span.innerText = el_label.dataset.switchTextOff;
                        }
                    }
                }
            }
        }

        setState(el, onOff = false) {
            if (el) {
                let el_switch = null;
                let el_input = null;
                if (el.tagName === 'LABEL') {
                    if (el.classList.contains('ui-switch')) {
                        el_switch = el;
                        el_input = el_switch.querySelector('input')
                    }
                } else if (el.tagName === 'INPUT') {
                    el_switch = el.parentNode
                    if (el_switch.tagName === 'LABEL') {
                        if (el_switch.classList.contains('ui-switch')) {
                            el_input = el;
                        }
                    }
                }

                if (el_switch && el_input) {
                    let el_span = el_switch.querySelector('span')

                    if (!el_switch.classList.contains('js-handled')) {
                        el_switch.addEventListener('change', this.onChangeEventHandler.bind(this))
                        el_switch.classList.add('js-handled')
                    }

                    if (onOff) {
                        el_span.innerText = el_switch.dataset.switchTextOn ? el_switch.dataset.switchTextOn : 'Вкл'
                        el_input.setAttribute('checked', 'checked')
                        el_input.checked = true
                        el_input.value = '1';
                        el_input.dataset.value = '1';
                    } else {
                        el_span.innerText = el_switch.dataset.switchTextOff ? el_switch.dataset.switchTextOff : 'Выкл'
                        el_input.removeAttribute('checked')
                        el_input.checked = false
                        el_input.value = '0';
                        el_input.dataset.value = '0';
                    }
                }
            }
        }
    }

    class dropDownList {
        #el_dropdown = null;
        #onClickFn = null;
        #onSelectFn = null;

        constructor(el_dropdown, options) {
            if (typeof options?.onSelect === 'function') {
                this.#onSelectFn = options?.onSelect
            }

            this.#el_dropdown = el_dropdown
            if (el_dropdown) {
                this.#onClickFn = this.onClickHandler.bind(this);
                el_dropdown.addEventListener('click', this.#onClickFn)
            }
        }

        destroy(){
            if (this.#el_dropdown) {
                this.#el_dropdown.removeEventListener('click', this.#onClickFn)
            }
        }

        getRef(){
            return this.#el_dropdown
        }

        selectById(id){
            if (id){
                // Если задан id, ищем подобный. При ненаходе - сбрасываем dropdown
                let el_ul = this.#el_dropdown.querySelector('ul')
                let el_li_active = el_ul.querySelector('.active')
                if (el_li_active?.dataset?.value === id){
                    return; // нашли элемент, и он активен. Ничего не делаем - выходим
                }
                el_li_active?.classList.remove('active')
                let els_li = el_ul.querySelectorAll('li')
                for (let el_li of els_li){
                    if (el_li.dataset?.value === id){
                        el_li.classList.add('active')
                        let el_input_dropdown = this.#el_dropdown.querySelector('.strio_form__input__dropdown')
                        if (el_input_dropdown){
                            el_input_dropdown.innerHTML = el_li.innerHTML
                            let el_input = this.#el_dropdown.querySelector('input')
                            if (el_input) {
                                if (!el_li.dataset.reset) {
                                    el_input.value = el_li.dataset?.value
                                } else {
                                    el_input.value = el_li.dataset.reset
                                }
                            }
                            this.#el_dropdown.classList.add('changed')
                            if (this.#onSelectFn) this.#onSelectFn(this.#el_dropdown)
                        }
                        break;
                    }
                }

            }
            // сбросить dropdown
        }

        onClickHandler(e) {
            if (e.target.classList.contains('strio_form__input__dropdown')) {
                let el_dropdown = e.target.parentNode;
                if (el_dropdown.classList.contains('show')) {
                    el_dropdown.classList.remove('active')
                    setTimeout(() => {
                        el_dropdown.classList.remove('show')
                    }, 300);
                } else {
                    el_dropdown.classList.add('show')
                    setTimeout(() => {
                        el_dropdown.classList.add('active')
                    }, 50);
                }
            } else if (e.target.tagName === 'LI') {
                let el_li_active = e.target.parentNode.querySelector('.active')
                if (el_li_active && (e.target !== el_li_active)) {
                    el_li_active.classList.remove('active')
                }

                el_li_active = e.target
                if (!el_li_active.dataset.reset){
                    el_li_active.classList.add('active')
                }

                let el_dropdown = e.target.parentNode.parentNode.parentNode;
                let el_input_dropdown = el_dropdown.querySelector('.strio_form__input__dropdown')
                if (el_input_dropdown) {
                    if (!el_li_active.dataset.reset){
                        el_input_dropdown.innerHTML = e.target.innerHTML
                        el_dropdown.classList.add('changed')
                        if (this.#onSelectFn) this.#onSelectFn(this.#el_dropdown)
                    } else {
                        el_input_dropdown.innerText = el_input_dropdown.dataset.value ? el_input_dropdown.dataset.value : ''
                        el_dropdown.classList.remove('changed')
                    }
                }

                let el_input = el_dropdown.querySelector('input')
                if (el_input) {
                    if (!el_li_active.dataset.reset) {
                        el_input.value = e.target.dataset.value
                    } else {
                        el_input.value = el_li_active.dataset.reset
                    }
                }

                // el_li_active.classList.add('active')
                el_dropdown.classList.remove('active')
                setTimeout(() => {
                    el_dropdown.classList.remove('show')
                }, 300);
            }
        }
    }

    /*
     *  AutoComplete class
     */
    // Creates a props object with overridden toString function. toString returns an attributes
    // string in the format: `key1="value1" key2="value2"` for easy use in an HTML string.
    class Props {
        constructor(index, selectedIndex, baseClass) {
            this.id = `${baseClass}-result-${index}`
            this.class = `${baseClass}-result`
            this['data-result-index'] = index
            this.role = 'option'
            if (index === selectedIndex) {
                this['aria-selected'] = 'true'
            }
        }

        toString() {
            return Object.keys(this).reduce(
                (str, key) => `${str} ${key}="${this[key]}"`,
                ''
            )
        }
    }

    class AutocompleteCore {
        value = ''
        searchCounter = 0
        results = []
        selectedIndex = -1
        selectedResult = null
        el_input = null

        constructor({
                        search,
                        autoSelect = false,
                        setValue = () => {},
                        setAttribute = () => {},
                        onUpdate = () => {},
                        onSubmit = () => {},
                        onShow = () => {},
                        autocorrect = false,
                        onHide = () => {},
                        onLoading = () => {},
                        onLoaded = () => {},
                        submitOnEnter = false,
                        el_input,
                    } = {}) {
            this.search = isPromise(search)
                ? search
                : (value) => Promise.resolve(search(value))
            this.autoSelect = autoSelect
            this.setValue = setValue
            this.setAttribute = setAttribute
            this.onUpdate = onUpdate
            this.onSubmit = onSubmit
            this.autocorrect = autocorrect
            this.onShow = onShow
            this.onHide = onHide
            this.onLoading = onLoading
            this.onLoaded = onLoaded
            this.submitOnEnter = submitOnEnter
            this.el_input = el_input
        }

        destroy = () => {
            this.search = null
            this.setValue = null
            this.setAttribute = null
            this.onUpdate = null
            this.onSubmit = null
            this.autocorrect = null
            this.onShow = null
            this.onHide = null
            this.onLoading = null
            this.onLoaded = null
        }

        handleInput = (event) => {
            const { value } = event.target
            this.updateResults(value)
            this.value = value
        }

        handleKeyDown = (event) => {
            const { key } = event

            switch (key) {
                case 'Up': // IE/Edge
                case 'Down': // IE/Edge
                case 'ArrowUp':
                case 'ArrowDown': {
                    const selectedIndex =
                        key === 'ArrowUp' || key === 'Up'
                            ? this.selectedIndex - 1
                            : this.selectedIndex + 1
                    event.preventDefault()
                    this.handleArrows(selectedIndex)
                    break
                }
                case 'Tab': {
                    this.selectResult()
                    break
                }
                case 'Enter': {
                    const isListItemSelected = event.target.getAttribute('aria-activedescendant').length > 0;

                    this.selectedResult = this.results[this.selectedIndex] || this.selectedResult;

                    this.selectResult()

                    if (this.submitOnEnter) {
                        if (this.selectedResult){
                            this.onSubmit(this.selectedResult, this)
                        }

                    } else {
                        if (isListItemSelected) {
                            event.preventDefault()
                        } else {
                            this.selectedResult && this.onSubmit(this.selectedResult, this)
                            this.selectedResult = null
                        }
                    }
                    break
                }
                case 'Esc': // IE/Edge
                case 'Escape': {
                    this.hideResults()
                    this.setValue()
                    break
                }
                default:
                    return
            }
        }

        handleFocus = (event) => {
            const { value } = event.target
            this.updateResults(value)
            this.value = value
        }

        handleBlur = () => {
            this.hideResults()
        }

        // The mousedown event fires before the blur event. Calling preventDefault() when
        // the results list is clicked will prevent it from taking focus, firing the
        // blur event on the input element, and closing the results list before click fires.
        handleResultMouseDown = (event) => {
            event.preventDefault()
        }

        handleResultClick = (event) => {
            const { target } = event
            const result = closest(target, '[data-result-index]')
            if (result) {
                this.selectedIndex = parseInt(result.dataset.resultIndex, 10)
                const selectedResult = this.results[this.selectedIndex]
                this.selectResult()
                this.onSubmit(selectedResult, this)
            }
        }

        handleArrows = (selectedIndex) => {
            // Loop selectedIndex back to first or last result if out of bounds
            const resultsCount = this.results.length
            this.selectedIndex =
                ((selectedIndex % resultsCount) + resultsCount) % resultsCount

            // Update results and aria attributes
            this.onUpdate(this.results, this.selectedIndex)
        }

        selectResult = () => {
            const selectedResult = this.results[this.selectedIndex]
            if (selectedResult) {
                this.setValue(selectedResult)
            }
            this.hideResults()
        }

        updateResults = (value) => {
            const currentSearch = ++this.searchCounter
            this.onLoading()
            this.search(value).then((results) => {
                if (currentSearch !== this.searchCounter) {
                    return
                }
                this.results = results
                this.onLoaded()

                if (this.results.length === 0) {
                    this.hideResults()
                    return
                }
                this.selectedIndex = this.autoSelect ? 0 : -1
                this.onUpdate(this.results, this.selectedIndex)
                this.showResults()
            })
        }

        showResults = () => {
            this.setAttribute('aria-expanded', true)
            this.onShow()
        }

        hideResults = () => {
            this.selectedIndex = -1
            this.results = []
            this.setAttribute('aria-expanded', false)
            this.setAttribute('aria-activedescendant', '')
            this.onUpdate(this.results, this.selectedIndex)
            this.onHide()
        }

        // Make sure selected result isn't scrolled out of view
        checkSelectedResultVisible = (resultsElement) => {
            const selectedResultElement = resultsElement.querySelector(
                `[data-result-index="${this.selectedIndex}"]`
            )
            if (!selectedResultElement) {
                return
            }

            const resultsPosition = resultsElement.getBoundingClientRect()
            const selectedPosition = selectedResultElement.getBoundingClientRect()

            if (selectedPosition.top < resultsPosition.top) {
                // Element is above viewable area
                resultsElement.scrollTop -= resultsPosition.top - selectedPosition.top
            } else if (selectedPosition.bottom > resultsPosition.bottom) {
                // Element is below viewable area
                resultsElement.scrollTop +=
                    selectedPosition.bottom - resultsPosition.bottom
            }
        }
    }

    class Autocomplete {
        expanded = false
        loading = false
        position = {}
        resetPosition = true

        constructor(
            root,
            {
                search,
                onSubmit = () => {},
                onUpdate = () => {},
                baseClass = 'autocomplete',
                autocorrect = false,
                autoSelect,
                getResultValue = (result) => result,
                renderResult,
                debounceTime = 500,
                resultListLabel,
                submitOnEnter = true,
            } = {}
        ) {
            this.root = typeof root === 'string' ? document.querySelector(root) : root
            this.input = this.root.querySelector('input')
            this.resultList = this.root.querySelector('ul')
            this.baseClass = baseClass
            this.autocorrect = autocorrect
            this.getResultValue = getResultValue
            this.onUpdate = onUpdate
            if (typeof renderResult === 'function') {
                this.renderResult = renderResult
            }
            this.resultListLabel = resultListLabel
            this.submitOnEnter = submitOnEnter

            const core = new AutocompleteCore({
                search,
                autoSelect,
                setValue: this.setValue,
                setAttribute: this.setAttribute,
                onUpdate: this.handleUpdate,
                autocorrect: this.autocorrect,
                onSubmit,
                onShow: this.handleShow,
                onHide: this.handleHide,
                onLoading: this.handleLoading,
                onLoaded: this.handleLoaded,
                submitOnEnter: this.submitOnEnter,
                el_input: this.root
            })
            if (debounceTime > 0) {
                core.handleInput = debounce(core.handleInput, debounceTime)
            }
            this.core = core

            this.initialize()
        }

        // Set up aria attributes and events
        initialize = () => {
            this.root.style.position = 'relative'

            this.input.setAttribute('role', 'combobox')
            this.input.setAttribute('autocomplete', 'off')
            this.input.setAttribute('autocapitalize', 'off')
            if (this.autocorrect) {
                this.input.setAttribute('autocorrect', 'on')
            }
            this.input.setAttribute('spellcheck', 'false')
            this.input.setAttribute('aria-autocomplete', 'list')
            this.input.setAttribute('aria-haspopup', 'listbox')
            this.input.setAttribute('aria-expanded', 'false')

            this.resultList.setAttribute('role', 'listbox')

            const resultListAriaLabel = getAriaLabel(this.resultListLabel);

            resultListAriaLabel &&
            this.resultList.setAttribute(
                resultListAriaLabel.attribute,
                resultListAriaLabel.content
            )

            this.resultList.style.position = 'absolute'
            this.resultList.style.zIndex = '1'
            this.resultList.style.width = '100%'
            this.resultList.style.boxSizing = 'border-box'

            // Generate ID for results list if it doesn't have one
            if (!this.resultList.id) {
                this.resultList.id = uniqueId(`${this.baseClass}-result-list-`)
            }
            this.input.setAttribute('aria-owns', this.resultList.id)

            document.body.addEventListener('click', this.handleDocumentClick)
            this.input.addEventListener('input', this.core.handleInput)
            this.input.addEventListener('keydown', this.core.handleKeyDown)
            this.input.addEventListener('focus', this.core.handleFocus)
            this.input.addEventListener('blur', this.core.handleBlur)
            this.resultList.addEventListener(
                'mousedown',
                this.core.handleResultMouseDown
            )
            this.resultList.addEventListener('click', this.core.handleResultClick)
            this.updateStyle()
        }

        destroy = () => {
            document.body.removeEventListener('click', this.handleDocumentClick)
            this.input.removeEventListener('input', this.core.handleInput)
            this.input.removeEventListener('keydown', this.core.handleKeyDown)
            this.input.removeEventListener('focus', this.core.handleFocus)
            this.input.removeEventListener('blur', this.core.handleBlur)
            this.resultList.removeEventListener(
                'mousedown',
                this.core.handleResultMouseDown
            )
            this.resultList.removeEventListener('click', this.core.handleResultClick)

            this.root = null
            this.input = null
            this.resultList = null
            this.getResultValue = null
            this.onUpdate = null
            this.renderResult = null
            this.core.destroy()
            this.core = null
        }

        setAttribute = (attribute, value) => {
            this.input.setAttribute(attribute, value)
        }

        setValue = (result) => {
            this.input.value = result ? this.getResultValue(result) : ''
        }

        renderResult = (result, props) => {
            // console.log(props)
            return `<li ${props}>${this.getResultValue(result)}</li>`
        }


        handleUpdate = (results, selectedIndex) => {
            this.resultList.innerHTML = ''
            //console.log(results)
            results.forEach((result, index) => {
                const props = new Props(index, selectedIndex, this.baseClass)
                const resultHTML = this.renderResult(result, props)
                if (typeof resultHTML === 'string') {
                    this.resultList.insertAdjacentHTML('beforeend', resultHTML)
                } else {
                    this.resultList.insertAdjacentElement('beforeend', resultHTML)
                }
            })

            this.input.setAttribute(
                'aria-activedescendant',
                selectedIndex > -1 ? `${this.baseClass}-result-${selectedIndex}` : ''
            )

            if (this.resetPosition) {
                this.resetPosition = false
                this.position = getRelativePosition(this.input, this.resultList)
                this.updateStyle()
            }
            this.core.checkSelectedResultVisible(this.resultList)
            this.onUpdate(results, selectedIndex)
        }

        handleShow = () => {
            this.expanded = true
            this.updateStyle()
        }

        handleHide = () => {
            this.expanded = false
            this.resetPosition = true
            this.updateStyle()
        }

        handleLoading = () => {
            this.loading = true
            this.updateStyle()
        }

        handleLoaded = () => {
            this.loading = false
            this.updateStyle()
        }

        handleDocumentClick = (event) => {
            if (this.root.contains(event.target)) {
                return
            }
            this.core.hideResults()
        }

        updateStyle = () => {
            this.root.dataset.expanded = this.expanded
            this.root.dataset.loading = this.loading
            this.root.dataset.position = this.position

            this.resultList.style.visibility = this.expanded ? 'visible' : 'hidden'
            this.resultList.style.pointerEvents = this.expanded ? 'auto' : 'none'
            if (this.position === 'below') {
                this.resultList.style.bottom = null
                this.resultList.style.top = '100%'
            } else {
                this.resultList.style.top = null
                this.resultList.style.bottom = '100%'
            }
        }
    }
    /*
     *  End of AutoComplete class
    */

    document.body.addEventListener('InitElement', (e) => {
        // console.log('Classes Event InitElement', e.detail.type_element, e.detail.element)
        if (e.detail.element) {
            if (e.detail.type_element === 'autocomplete'){
                window.AutoCompletes = window.AutoCompletes ? window.AutoCompletes : []
                window.AutoCompletes.push( new Autocomplete(e.detail.element, {
                    search: value => {
                        const url = `/api/v1/autocomplete/${e.detail.element.dataset.autocomplete}/${encodeURI(value)}`
                        return new Promise(resolve => {
                            if (value.length < 2) {
                                return resolve([])
                            }

                            fetch(url)
                                .then(response => response.json())
                                .then(data => {
                                    if (data.autocomplete)
                                        resolve(data.autocomplete[e.detail.element.dataset.autocomplete]);
                                    else
                                        resolve([])
                                })
                        })
                    },

                    getResultValue: result => {
                        if (result.r){
                            // role
                            return result.n + ' (' + result.r + ')';
                        } else
                        if (result.l){
                            // location
                            return result.n + ' (' + result.l + ')';
                        }

                        return result.n;
                    },

                    onSubmit: (value, this_obj) => {
                        this_obj.el_input.querySelector('input[type="hidden"]').value = value.i
                    }
                }) )
            } else
            if (e.detail.type_element === 'percentMask'){
                window.percentMask = window.percentMask || []
                window.percentMask.push( new percentMask(e.detail.element) )
            } else
            if (e.detail.type_element === 'integerMask'){
                window.integerMask = window.integerMask || []
                window.integerMask.push( new integerMask(e.detail.element) )
            } else
            if (e.detail.type_element === 'floatMask'){
                window.floatMask = window.floatMask || []
                window.floatMask.push( new floatMask(e.detail.element) )
            } else
            if (e.detail.type_element === 'currencyMask'){
                window.currencyMask = window.currencyMask || []
                window.currencyMask.push( new currencyMask(e.detail.element) )
            } else
            if (e.detail.type_element === 'phoneMask'){
                window.phoneMask = window.phoneMask || []
                window.phoneMask.push( new phoneMask(e.detail.element) )
            } else
            if (e.detail.type_element === 'uiSwitch'){
                window.uiSwitches = window.uiSwitches || []
                window.uiSwitches.push( new uiSwitch(e.detail.element) )
            } else
            if (e.detail.type_element === 'dropDownList'){
                window.dropDownLists = window.dropDownLists || []
                window.dropDownLists.push( new dropDownList(e.detail.element, e.detail.options) )
            } else
            if (e.detail.type_element === 'multiSelect'){
                window.multiSelects = window.multiSelects || []
                if (!e.detail.options) e.detail.options = {}
                window.multiSelects.push( new MultiSelect(e.detail.element, e.detail.options) )
            }
        }
    })


})();