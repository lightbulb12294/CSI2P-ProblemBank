let databaseURL = 'https://script.google.com/macros/s/AKfycbwj7PcB0oIUfhRCm0IaoMRAU2RUwZcLmqbhevM3_127SFO_f_C9q0WSOQ7Qv_slfOr7/exec';

// fetch raw database
let rawProblemData = await fetch(databaseURL).then(res => res['json']());
rawProblemData = rawProblemData.sort();

function updateTable() {
    // build filter conditions
    let filterConds = [];
    for(let i=0; i<filters.length; i++) {
        let filterCond = {'id': filters[i]['id'], 'cond': []};
        let filterSels = document.getElementById(filters[i]['id'] + 'Filter').getElementsByClassName('filterSelection')[0].childNodes;
        filterSels.forEach(function (f) {
            filterCond['cond'].push(f.firstChild.firstChild.textContent);
        })
        if(filterCond['cond'].length === 0) continue;
        filterConds.push(filterCond)
    }
    console.log(filterConds)
    let dataRows = document.getElementsByClassName('dataRow');
    for(let i=0; i<rawProblemData.length; i++) {
        let mask = true;
        for(let j=0; j<filterConds.length; j++) {
            let data = rawProblemData[i];
            let cond = filterConds[j];
            if(typeof data[cond['id']] === 'string') {
                mask = mask && (cond['cond'].includes(data[cond['id']]));
            }
            else { // type: list
                let tmp = false;
                for(let k=0; k<data[cond['id']].length; k++) {
                    tmp = tmp || (cond['cond'].includes(data[cond['id']][k]));
                }
                mask = mask && tmp;
            }
        }
        if(mask === false) {
            dataRows[i].classList.add('hide');
        }
        else {
            dataRows[i].classList.remove('hide');
        }
    }
}
function resetPlusButton(searchId, filterList) {
	let plusButton = createPlusButton(searchId, filterList);
	let filterEl = document.getElementById(searchId+'Filter');
	filterEl.childNodes[1].insertAdjacentElement('afterend', plusButton);
	filterEl.removeChild(filterEl.childNodes[1]);
}
function createSelection(name, list, searchId) {
	let el = document.createElement('span');
	let nameEl  = document.createElement('div');
	nameEl.innerText = name;
	el.append(nameEl);
	let cancel = createEl('a', 'cancel');
	cancel.innerText = '×';
	cancel.onclick = function () {
		this.parentElement.parentElement.removeChild(this.parentElement);
		resetPlusButton(searchId, list);
		updateTable();
	}
	el.append(cancel);
	return el;
}
function createSelectList(list, searchId) {
	// current list of selections
	let currentSel = [];
	let currentSelEl = document.getElementsByClassName(searchId+'Sel')[0];
	currentSelEl.childNodes.forEach(function (s) {
		currentSel.push(s.firstChild.textContent);
	})
	let select = document.createElement('select');
	let opt = document.createElement('option');
	select.append(opt);
	for(let i=0; i<list.length; i++) {
		if(currentSel.includes(list[i])) continue;
		opt = document.createElement('option');
		opt.value = list[i];
		opt.innerText = list[i];
		select.append(opt);
	}
	select.onchange = function () {
		currentSelEl.appendChild(createSelection(this.value, list, searchId));
		resetPlusButton(searchId, list);
		updateTable();
	}
	return select;
}
function filterAddSelection(filterEl, filterList, searchId) {
	filterEl.removeChild(filterEl.firstChild);
	filterEl.insertBefore(createSelectList(filterList, searchId), filterEl.firstChild);
}
function createPlusButton(searchId, filterList) {
	let plusButton = document.createElement('span');
	plusButton.classList.add('plusButton');
	plusButton.textContent = '✛';
	plusButton.onclick = function () {
		filterAddSelection(this.parentElement, filterList, searchId);
	};
	let el = document.createElement('div');
	el.style.display = 'inline';
	el.append(plusButton);
	return el;
}
function createEl(elName, _class=null, style=null) {
	let res = document.createElement(elName);
	if(_class !== null) {
		res.classList.add(_class);
	}
	if(style !== null) {
		res.style = style;
	}
	return res;
}
function createTd(text, _class=null) {
	let td =  createEl('td', _class);
	td.innerText = text;
	return td;
}
function createTh(text, _class=null) {
	let th =  createEl('th', _class);
	th.innerText = text;
	return th;
}

// register filter attributes
let filterRangeList = [];
let filterTagList = [];
for(let i=0; i<rawProblemData.length; i++) {
	let data = rawProblemData[i];
	filterRangeList.push(data['range']);
	for(let j=0; j<data['tags'].length; j++) {
		filterTagList.push(data['tags'][j]);
	}
}
filterRangeList = Array.from(new Set(filterRangeList)).sort();
filterTagList = Array.from(new Set(filterTagList)).sort();
let filters = [
	{'name': '範圍', 'id': 'range', 'list': filterRangeList},
	{'name': '標籤', 'id': 'tags', 'list': filterTagList}
];

// load filter
function createFilterComponent(filter) {
	let res = document.createElement('div');
	res.id = filter['id'] + 'Filter';
	res.innerText = filter['name'] + ': ';

	// plus button for new filter selection
	res.append(createPlusButton(filter['id'], filter['list']));

	// current list of selections
	let el = document.createElement('div');
	el.classList.add('filterSelection', filter['id']+'Sel');
	res.append(el);

	return res;
}
filters.forEach(function (f) {
	let el = createFilterComponent(f);
	document.getElementById('controlPanel').append(el);
});

// build data table
function loadDataTable(data) {
	let dataTableEl = document.getElementById('data');
	// make title
	let tr = document.createElement('tr');
	tr.append(
		createTh('題目 ID', 'pid'),
		createTh('範圍', 'range'),
		createTh('標籤', 'tags'));
	dataTableEl.append(tr);
	// make data body
	for(let i=0; i<data.length; i++) {
		tr = document.createElement('tr');
		tr.classList.add('dataRow');
		tr.append(
			createTd(data[i]['PID'], 'pid'),
			createTd(data[i]['range'], 'range'));
		tr.append(createTd(data[i]['tags'].join(', '), 'tags'));
		dataTableEl.append(tr);
	}
}
loadDataTable(rawProblemData);
