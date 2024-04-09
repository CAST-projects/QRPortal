'use strict'

let filters = {
    deprecated: false,
    medium: true,
    high: true,
    critical: true,
};

const HIDE_CLS = 'disn';
const SELECTED_CLS = 'bg-p-selected';

let selectedEle = null;

function appendfilters() {
    const target = document.getElementById('main-header');
    if (!target) return;

    target.innerHTML += `<div class="btn-toolbar mb-2 mb-md-0"><div class="btn-group"><button type="button" class="btn btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false">Filter</button><ul class="dropdown-menu btn-sm"><li class="dropdown-item pd-l8 cursor-pt hov" id="filtermedium" onclick="toggleFilter('medium',event)">${filters.medium ? "Hide " : "Show "}Medium</li><li class="dropdown-item pd-l8 cursor-pt hov" id="filterhigh" onclick="toggleFilter('high',event)">${filters.high ? "Hide " : "Show "}High</li><li class="dropdown-item pd-l8 cursor-pt hov" id="filtercritical" onclick="toggleFilter('critical',event)">${filters.critical ? "Hide " : "Show "}Critical</li><li><hr class="dropdown-divider"></li><li class="dropdown-item pd-l8 cursor-pt hov" id="filterdeprecated"onclick="toggleFilter('deprecated',event)">${filters.deprecated ? "Hide " : "Show "}Deprecated</li></ul></div></div>`
}

/**
 * @param {string} name 
 * @param {Event} evt 
 */
function toggleFilter(name, evt) {
    if (!filters.hasOwnProperty(name)) return;
    const target = evt.target;

    filters[name] = !filters[name];
    target.innerText = `${filters[name] ? "Hide " : "Show "}${name}`;

    toggleVisible(document.getElementById('main'));
}

function handleApplyFiltersLoad() {
    const main = document.getElementById('main');
    const path = window.location.pathname;

    if (main) {
        appendfilters();
        toggleVisible(main);

        if (path.includes('/details/')) {
            const parts = path.split('/');
            const id = parts[parts.length - 1];

            updateSelectedRule(id, true);
        }
    }
}

function setSelectedNavElement() {
    const items = document.getElementsByClassName('navitem');
    const locv = '/api' + location.pathname.toLowerCase();
    const il = items.length;
    const acls = 'nav-active';

    for (let index = 0; index < il; index++) {
        const ele = items[index];
        const hxg = ele.parentElement.attributes['hx-get'];

        if (hxg && hxg.value.toLowerCase() === locv) {
            if (selectedEle) {
                selectedEle.classList.remove(acls);
            }

            ele.classList.add(acls)
            selectedEle = ele;
        }
    }
}

function handleApplyFilters(evt) {
    /** @type {Element} */
    const target = evt.target;
    const id = target.id;

    if (id === 'main') {
        appendfilters();
        toggleVisible(target);
        setSelectedNavElement();
    }
}

function handleSelectRule(evt) {
    const detail = evt.detail;
    const path = detail.path;

    if (path.includes('/details/')) {
        const parts = path.split('/');
        let id = parts[parts.length - 1];
        if (id.includes("?")) {
            const _parts = id.split("?");
            id = _parts[0];
        }

        updateSelectedRule(id);
    }
}

function updateSelectedRule(id, scrollTo = false) {
    const main = document.getElementById('main');

    if (!main) return;
    const tbs = main.getElementsByTagName("tbody");
    const scrl = main.getElementsByClassName('sidebar-sticky')[0];

    if (tbs.length > 0) {
        const tbody = tbs[0];
        const children = tbody.children;
        for (let index = 0; index < children.length; index++) {
            const tr = children[index];
            const tds = tr.children;
            const _id = tds[0].innerText;

            if (tr.classList.contains(SELECTED_CLS)) {
                tr.classList.remove(SELECTED_CLS);
            }

            if (_id === id) {
                if (!tr.classList.contains(SELECTED_CLS)) {
                    tr.classList.add(SELECTED_CLS);
                    if (scrollTo) {
                        scrl.scrollTo({
                            behavior: 'instant',
                            top: tr.offsetTop - tr.scrollHeight,
                        });
                    }
                }
            }
        }
    }
}

/**
 * @param {HTMLElement} target 
 */
function toggleVisible(target) {
    const tbs = target.getElementsByTagName("tbody");
    if (tbs.length > 0) {
        const tbody = tbs[0];
        const children = tbody.children;

        for (let index = 0; index < children.length; index++) {
            let shouldAdd = false;
            let shouldFilter = false;
            const tr = children[index];
            const tds = tr.children;
            const txt = tds[1].innerText;
            const severity = tds[2].innerText;

            if (tr.classList.contains(HIDE_CLS)) {
                tr.classList.remove(HIDE_CLS);
            }

            if (!filters.deprecated && isDeprecated(txt)) {
                shouldFilter = true;
            }

            if (!filters.medium && contains(severity, 'medium')) {
                shouldFilter = true;
            }

            if (!filters.high && contains(severity, 'high')) {
                shouldFilter = true;
            }

            if (!filters.critical && contains(severity, 'critical')) {
                shouldFilter = true;
            }

            if (shouldFilter && !tr.classList.contains(HIDE_CLS)) {
                shouldAdd = true;
            }

            if (shouldAdd) {
                tr.classList.add(HIDE_CLS);
            }
        }
    }
}

/**
 * @param {string} str 
 */
function isDeprecated(str = '') {
    return str.toLowerCase().startsWith('deprecated');
}

/**
 * @param {string} str
 * @param {string} txt
 */
function contains(str = '', txt) {
    return str.toLowerCase().includes(txt);
}

document.body.addEventListener('htmx:afterSwap', handleApplyFilters);
document.body.addEventListener('htmx:replacedInHistory', handleSelectRule);
