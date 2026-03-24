(function(){
    const TIME_SHOW_ERROR_MS = 5000;    

    class CustomErrorBase extends Error {
        constructor(obj, json, message) {
            super(message);
            this.name = this.constructor.name;
            this.data = obj;
            this.json = json;
        }
    }

    class ServerError extends CustomErrorBase {}

    function isEmptyObject(obj) {
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                return false;
            }
        }
        return true;
    }

    function Notify(params){
        document.body.dispatchEvent(new CustomEvent("Notify", {
            detail: {
                params: params
            }
        }))
    }

    function form_hide_all_errors(el_form){
        el_form.querySelectorAll('input.error').forEach((el_input)=>{
            el_input.classList.remove('error');
        });
    }

    function form_show_all_errors(el_form){
        el_form.querySelectorAll('input.required').forEach((el_input) => {
            el_input.classList.add('error');
        });
    }

    function form_check_required_fields(el_form){
        let error_cnt = 0;
        el_form.querySelectorAll('input.required').forEach((el_input)=>{
            if (el_input.value.trim().length < 3){
                el_input.classList.add('error');
                error_cnt++;
            }
        });

        if (error_cnt > 0) return false;
        return true;
    }

    async function form_send_login_pass_to_server(el_form) {
        let el_user_login = el_form.querySelector('[name="login"]');
        let el_user_pass = el_form.querySelector('[name="password"]');

        let el_btn_submit = el_form.querySelector('[type="submit"]');
        if (el_btn_submit) el_btn_submit.disabled = true;

        let answer = await fetch(el_form.action, {
            method: 'POST',
            body: JSON.stringify({
                login: el_user_login.value.trim(),
                password: el_user_pass.value.trim()
            }),

            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }) 

        if (el_btn_submit) el_btn_submit.disabled = false;

        if (!answer.ok) {
            throw new ServerError(answer, {}, answer.statusText);
        }

        let json_data = await answer.json()

        if (json_data.error !== 200){
            throw new ServerError(answer, json_data, answer.statusText);
        }

        return json_data;
    };

    function showBackground(){
        let el_bgs = document.querySelector('.image_bcgs');
        if (el_bgs){
            let el_bg = el_bgs.querySelector('[data-src]');
            
            if (el_bg){
                let img = new Image();
                img.src = el_bg.dataset.src;
                img.onload = function (){
                    el_bg.style.backgroundImage = 'url(' + el_bg.dataset.src + ')';
                    el_bg.style.opacity = 1;
                }
            }
        }
    };

    function setupClickOnShowPassword(){
        document.querySelectorAll('.icon_showpassword').forEach((el)=>{
            el.addEventListener('click', (e)=>{
                e.preventDefault();
                e.stopPropagation();
                el.classList.toggle('open');
                el.parentNode.childNodes.forEach((el)=>{
                    if (el.name === 'password'){
                        el.type = el.type === 'password' ? 'text' : 'password';
                    }
                })
            })
        });
    };    

    function setupFormSubmit(el_form){
        el_form.addEventListener('submit', async (e)=>{
            e.preventDefault();
            e.stopPropagation();
            
            if (!form_check_required_fields(el_form)){
                Notify({
                    text:'Ввод не должен быть пустым',
                    theme: 'danger',
                    showtime : TIME_SHOW_ERROR_MS,
                    afterhide: form_hide_all_errors,
                    afterhide_data: el_form
                });

                return false;
            }


            try{
                let data_from_server = await form_send_login_pass_to_server(el_form);
                if (data_from_server['redirect']){
                    window.location = data_from_server['redirect'];
                }
            } catch (err) {
                if (err instanceof ServerError){
                    if ( (!isEmptyObject(err.json)) && (err.json.error_msg) ){
                        form_show_all_errors(el_form);

                        Notify({
                            text: err.json.error_msg,
                            theme: 'warning',
                            showtime: TIME_SHOW_ERROR_MS,
                            afterhide: form_hide_all_errors,
                            afterhide_data: el_form
                        });  
                    } else {
                        Notify({
                            text: 'На сервере возникла ошибка: ' + err.data.statusText + ' ('+ err.message + ')',
                            theme: 'danger',
                            showtime : TIME_SHOW_ERROR_MS
                        });
                    }
                }
            };

        }) // submit
    };

    document.querySelectorAll('.leto_form').forEach((el_form)=>{
        setupFormSubmit(el_form);
    });


    setupClickOnShowPassword();
    showBackground();

})();