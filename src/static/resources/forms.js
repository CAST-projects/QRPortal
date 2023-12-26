function input_onfocus(event) {
    const ele = event.target.parentElement.previousElementSibling;
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
    const ele = event.target.parentElement.previousElementSibling;
    ele.classList.remove('Mui-focused');
    ele.classList.remove('MuiInputLabel-shrink');
    for (const att of ele.attributes) {
        if (att.name === "data-shrink") {
            att.value = false;
            break;
        }
    }
}

function on_clickaway(event, id) {
    event.stopPropagation();
    const e = document.getElementById(id);

    if (event.target !== e) {
        return;
    }

    e.remove();
}