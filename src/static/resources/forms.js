'use strict';

function input_onfocus(event) {
    const target = event.target;
    const ele = target.parentElement.previousElementSibling;
    ele.classList.add('Mui-focused');
    ele.classList.add('MuiInputLabel-shrink');
    for (const att of ele.attributes) {
        if (att.name === "data-shrink") {
            att.value = true;
            break;
        }
    }
}

function input_onblur(event) {
    const target = event.target;
    const ele = target.parentElement.previousElementSibling;
    if (!target.value) {
        ele.classList.remove('Mui-focused');
        ele.classList.remove('MuiInputLabel-shrink');
        for (const att of ele.attributes) {
            if (att.name === "data-shrink") {
                att.value = false;
                break;
            }
        }
    }
}

function on_clickaway(event, id) {
    event.stopPropagation();
    const e = document.getElementById(id);

    if (event.target !== e) {
        return;
    }

    e.classList.toggle('op0');

    setTimeout(() => {
        e.classList.toggle('disn');
    }, 100);
}

function show_auth_dialog(event, id) {
    event.stopPropagation();
    event.preventDefault();
    const e = document.getElementById(id);

    e.classList.toggle('disn');
    e.classList.toggle('op0');
}

function close_auth_dialog(event, id) {
    event.stopPropagation();
    event.preventDefault();
    const e = document.getElementById(id);

    e.classList.toggle('op0');

    setTimeout(() => {
        e.classList.toggle('disn');
    }, 100);
}

(function () {
    const inputs = document.getElementsByClassName('MuiInput-input');

    for (let index = 0; index < inputs.length; index++) {
        const input = inputs[index];

        if (input.value) {
            const ele = input.parentElement.previousElementSibling;
            ele.classList.add('Mui-focused');
            ele.classList.add('MuiInputLabel-shrink');
            for (const att of ele.attributes) {
                if (att.name === "data-shrink") {
                    att.value = true;
                    break;
                }
            }
        }
    }
})();