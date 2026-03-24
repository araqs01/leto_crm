(function () {
    class Tables {
        ROLLUP_TIME_MS = 300;

        constructor() {
            document.querySelectorAll('th.collapsable').forEach((el_th) => {
                let el_btn = document.createElement('div');
                el_btn.classList.add('tbl_collapsable_btn_wrap')
                el_th.appendChild(el_btn);
            });

            document.querySelectorAll('.tbl_component').forEach((el_table) => {
                // if (el_table.classList.contains('tbl_rollable')) {
                    el_table.addEventListener('click', async (e) => {
                        let el_tbl = null;

                        if (e.target.classList.contains('tbl_collapsable_btn_wrap')) {
                            e.target.parentNode.classList.toggle('collapsed')
                            let class_th = e.target.parentNode.classList.item(0);
                            this.collapseColumnOfTable(e.target, class_th);
                        } else if (e.target.classList.contains('collapsable')) {
                            e.target.classList.toggle('collapsed')
                            let class_th = e.target.classList.item(0);
                            this.collapseColumnOfTable(e.target, class_th);
                        } else if (e.target.classList.contains('tbl__header')) {
                            el_tbl = e.target.parentNode;
                        } else if (e.target.classList.contains('tbl__workers__header_title')) {
                            el_tbl = e.target.parentNode.parentNode;
                        } else if (e.target.tagName === 'H2') {
                            el_tbl = e.target.parentNode.parentNode;
                        } else if (e.target.classList.contains('icon_roller')) {
                            el_tbl = e.target.parentNode.parentNode.parentNode;
                        } else if (e.target.dataset.action){
                            let el_component = e.target.parentNode;
                            const LIMIT_LOOKUP = 20;
                            let countUp = 0;
                            while (!el_component.dataset.component) {
                                el_component = el_component.parentNode;
                                countUp++;
                                if (countUp >= LIMIT_LOOKUP) break;
                            }
                            if (!el_component.dataset.component){
                                console.error('Не найден компонент владелец для обработки события', e.target.dataset.action)
                                return ;
                            }
                            e.stopPropagation();

                            console.log('tbl_component.click on action', e.target.dataset.action);

                            await this.onActionHandle(el_component.dataset.component, e.target.dataset.action, e.target.dataset.id);
                        }

                        let el_tbl_body = null;
                        if (el_tbl) {
                            el_tbl_body = el_tbl.querySelector('.tbl__body')
                            if (el_tbl.classList.contains('rollup')) {
                                this.rollDownElement(el_tbl_body);
                            } else {
                                this.rollUpElement(el_tbl_body);
                            }
                            el_tbl.classList.toggle('rollup');
                        }

                    })
                // }
            });
        } // constructor

        collapseColumnOfTable(el_child_tbl, class_of_column) {
            while ((el_child_tbl) && (el_child_tbl.tagName !== 'TABLE')) el_child_tbl = el_child_tbl.parentNode;
            el_child_tbl.querySelectorAll('td.' + class_of_column).forEach((el_td) => {
                el_td.classList.toggle('collapsed');
            });
        }

        rollUpElement(el) {
            if (el){
                el.style.height = el.scrollHeight + 'px';
                el.style.overflow = 'hidden';
                el.style.transition = 'height ' + this.ROLLUP_TIME_MS + 'ms ease-out';


                setTimeout(() => {
                    el.style.height = '0';
                }, 50);
            }
        }

        rollDownElement(el) {
            if (el){
                el.style.height = el.scrollHeight + 'px';
                el.addEventListener('transitionend', (e) => {
                    el.style.height = '';
                    el.style.overflow = '';
                    el.style.transition = '';
                }, {once: true});
            }
        }

        async onActionHandle(component_name, action_name, id_name){
            if (id_name){
                let answer = await fetch(window.location.origin + '/api/v1/do_component_action', {
                    method: 'POST',
                    body: JSON.stringify({
                        component: component_name,
                        action: action_name,
                        id: id_name
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                })

                if (answer.status === 200){
                    let data_json = await answer.json()

                    if (data_json.redirect){
                        window.location.href = data_json.redirect
                        return;
                    }
                    if ((component_name === 'users_tbl.default')){
                        window.popupData = data_json
                        document.body.dispatchEvent(new CustomEvent("OpenPopup", {
                            detail: {
                                popup:'popup__addworker',
                                data:data_json
                            }
                        }));
                    }
                    if ((component_name === 'simple_tbl.roles')){
                        window.popupData = data_json
                        document.body.dispatchEvent(new CustomEvent("OpenPopup", {
                            detail: {
                                popup:'popup__addrole',
                                data:data_json
                            }
                        }));
                    }
                    if ((component_name === 'simple_tbl.posts')){
                        window.popupData = data_json
                        document.body.dispatchEvent(new CustomEvent("OpenPopup", {
                            detail: {
                                popup:'popup__addpost',
                                data:data_json
                            }
                        }));
                    }
                    if ((component_name === 'simple_tbl.locations')){
                        window.popupData = data_json
                        document.body.dispatchEvent(new CustomEvent("OpenPopup", {
                            detail: {
                                popup:'popup__addlocation',
                                data:data_json
                            }
                        }));
                    }
                    if ((component_name === 'simple_tbl.objects')){
                        window.popupData = data_json
                        document.body.dispatchEvent(new CustomEvent("OpenPopup", {
                            detail: {
                                popup:'popup__addobject',
                                data:data_json
                            }
                        }));
                    }
                    if ((component_name === 'simple_tbl.reklama')){
                        window.popupData = data_json
                        document.body.dispatchEvent(new CustomEvent("OpenPopup", {
                            detail: {
                                popup:'popup__addreklama',
                                data:data_json
                            }
                        }));
                    }
                    if ((component_name === 'simple_tbl.brokers')){
                        window.popupData = data_json
                        document.body.dispatchEvent(new CustomEvent("OpenPopup", {
                            detail: {
                                popup:'popup__addbroker',
                                data:data_json
                            }
                        }));
                    }
                    if ((component_name === 'simple_tbl.jurists')){
                        window.popupData = data_json
                        document.body.dispatchEvent(new CustomEvent("OpenPopup", {
                            detail: {
                                popup:'popup__addjurist',
                                data:data_json
                            }
                        }));
                    }

                }
            }
        }

    };


    new Tables();


    if (window.updateTableRow === undefined) window.updateTableRow = updateTableRow;

    function updateTableRow(json){
        if (!!window.popupData){
            let component_name = window.popupData.component;
            let el_table = document.querySelector('[data-component="'+component_name+'"]')
            if ((el_table) && ((component_name === 'simple_tbl.roles') || (component_name === 'simple_tbl.posts')
                || (component_name === 'simple_tbl.locations') || (component_name === 'simple_tbl.objects')
                || (component_name === 'simple_tbl.reklama')   || (component_name === 'simple_tbl.brokers')
                || (component_name === 'simple_tbl.jurists')  )){
                updateTableRoles(el_table, window.popupData, json)
            }
        } else {
            window.location.reload()
        }
    }

    function updateTableRoles(el_table, data_orig, data_updated){
        let id = data_orig.id
        let el_id = el_table.querySelector('[data-id="'+id+'"]')
        if (el_id){
            let el_tr = el_id.closest('tr')
            for (let field_name in data_updated.updated){
                let el_td_field = el_tr.querySelector('.' + field_name)
                if (el_td_field){
                    if (field_name === 'is_visible'){
                        if (data_updated.updated.is_visible === 'TRUE'){
                            el_td_field.classList.add('visible')
                        } else {
                            el_td_field.classList.remove('visible')
                        }
                    } else
                    if (field_name === 'role_name'){
                        el_td_field.textContent = data_updated.updated.role_name
                    } else
                    if (field_name === 'role_name_short'){
                        el_td_field.textContent = data_updated.updated.role_name_short
                    } else
                    if (field_name === 'post_name'){
                        el_td_field.textContent = data_updated.updated.post_name
                    } else
                    if (field_name === 'location_name'){
                        el_td_field.textContent = data_updated.updated.location_name
                    } else
                    if (field_name === 'object_name'){
                        el_td_field.textContent = data_updated.updated.object_name
                    } else
                    if (field_name === 'reklama_name'){
                        el_td_field.textContent = data_updated.updated.reklama_name
                    } else
                    if (field_name === 'broker_name'){
                        el_td_field.textContent = data_updated.updated.broker_name
                    } else
                    if (field_name === 'jurist_name'){
                        el_td_field.textContent = data_updated.updated.jurist_name
                    }
                }
            }
        } else {
            console.warn('updateTableRoles - not found such id: ' + id)
        }

    }
})();