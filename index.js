/**
 * Copyright (c) 2019 Tobias Briones.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const newItem = (name, value) => {
    const item = document.createElement('div');
    const del = document.createElement('div');
    const text = typeof value != 'undefined' ? `${name} @${value}%` : name;
    
    item.classList.add('item');
    item.innerHTML = `<span>${text}</span>`;
    del.classList.add('delete');
    del.innerHTML = 'X';
    item.appendChild(del);
    return item;
}

const onNewUniversity = () => {
    const listEl = document.querySelector('.universities .list');
    const nameEl = document.getElementById('university-name');
    const name = nameEl.value;
    const itemEl = newItem(name);
    
    if(name.trim().length == 0) {
        return;
    }
    listEl.appendChild(itemEl);
    nameEl.value = '';
    nameEl.focus();
    itemEl.querySelector('.delete').addEventListener('click', e => e.target.parentNode.remove());
}

const onNewCriteria = () => {
    const listEl = document.querySelector('.criteria .list');
    const nameEl = document.getElementById('criteria-name');
    const valueEl = document.getElementById('criteria-value');
    const name = nameEl.value;
    const value = valueEl.value;
    const itemEl = newItem(name, value);
    
    if(name.trim().length == 0 || value.trim().length == 0) {
        return;
    }
    if(name.includes('@')) {
        alert('Can\'t contain @');
        return;
    }
    if(isNaN(value)) {
        alert('Value is numeric');
        return;
    }
    listEl.appendChild(itemEl);
    nameEl.value = '';
    valueEl.value = '';
    nameEl.focus();
    itemEl.querySelector('.delete').addEventListener('click', e => e.target.parentNode.remove());
}

const onNext = () => {
    const tree = document.querySelector('.tree');
    const selectionEl = tree.querySelector('.selection');
    const universities = getUniversities();
    const criteria = getCriteria();
    const clear = () => selectionEl.innerHTML = '';
    const addItem = criteria => {
        const cardEl = document.createElement('div');
        const criteriaEl = document.createElement('p');
        const valuesEl = document.createElement('div');
        
        criteriaEl.innerHTML = criteria.name;
        cardEl.appendChild(criteriaEl);
        cardEl.appendChild(valuesEl);
        
        universities.forEach(university => {
            const parentEl = document.createElement('div');
            const universityEl = document.createElement('div');
            const valuesEl = document.createElement('div');
            const id = `${criteria.name.replace(/ /g, '')}-weight-${university.replace(/ /g, '')}`;
            
            universityEl.innerHTML = university;
            valuesEl.innerHTML = `Set weight <input id='${id}' type='number'/>`;
            parentEl.appendChild(universityEl);
            parentEl.appendChild(valuesEl);
            cardEl.appendChild(parentEl);
        });
        selectionEl.appendChild(cardEl);
    }
    var sum = 0;
    
    if(universities.length == 0 || criteria.length == 0) {
        alert('Empty data');
        return;
    }
    criteria.forEach(criteria => sum += criteria.value);
    if(sum != 100) {
        alert('The criteria values must sum up 100, current value is ' + sum);
        return;
    }
    clear();
    criteria.forEach(criteria => addItem(criteria));
    if(!tree.classList.contains('visible')) {
        tree.classList.add('visible');
    }
}

const onExecute = () => {
    const universitiesEl = document.querySelector('.tree .results');
    const universities = getUniversities();
    const criteria = getCriteria();
    const clear = () => universitiesEl.innerHTML = '';
    const getResults = () => {
        const results = [];
        
        universities.forEach(university => {
            const universityResult = {
                university : university,
                weights : []
            };
            
            criteria.forEach(criteria => {
                const id = `${criteria.name.replace(/ /g, '')}-weight-${university.replace(/ /g, '')}`;
                const inputEl = document.getElementById(id);
                const weight = parseFloat(inputEl.value);
                
                universityResult.weights.push({ criteria : criteria, weight : weight });
            });
            results.push(universityResult);
        });
        return results;
    }
    const addItem = result => {
        const cardEl = document.createElement('div');
        const universityEl = document.createElement('p');
        const valueEl = document.createElement('div');
        var weighStr = '';
        var value = 0;
        
        universityEl.innerHTML = result.university;
        cardEl.appendChild(universityEl);
        cardEl.appendChild(valueEl);
        
        result.weights.forEach(weight => {
            weighStr += weight.criteria.value + ' x ' + weight.weight + ' + ';
            value += weight.criteria.value * weight.weight;
        });
        value /= 100;
        value = value.toFixed(2);
        weighStr = `${weighStr.substring(0, weighStr.length - 3)} = ${value}`;
        valueEl.innerHTML = weighStr;
        universitiesEl.appendChild(cardEl);
    }
    const title = document.createElement('p');
    
    title.innerHTML = 'Results';
    clear();
    universitiesEl.appendChild(title);
    getResults().forEach(result => addItem(result));
    document.querySelectorAll('.tree .selection > div').forEach(parent => {
        var weightSum = 0;
        
        parent.querySelectorAll('input').forEach(input => weightSum += parseFloat(input.value));
        if(weightSum != 100) {
            const criteria = parent.querySelector('p').innerHTML;
            alert(`The sum of weights for each criteria must add up 100. Criteria ${criteria} has a weight of ${weightSum}`);
            clear();
            return;
        }
    });
}

// Model
const getUniversities = () => {
    const items = document.querySelectorAll('.universities .list .item');
    const universities = [];
    
    items.forEach(item => {
        const university = item.querySelector('span').innerHTML;
        
        universities.push(university);
    });
    return universities;
}

const getCriteria = () => {
    const items = document.querySelectorAll('.criteria .list .item');
    const criteria = [];
    
    items.forEach(item => {
        const _criteria = item.querySelector('span').innerHTML;
        const split = _criteria.split(' @');
        const currentCriteria = { name : split[0], value : parseFloat(split[1].substring(0, split[1].length - 1))};
        
        criteria.push(currentCriteria);
    });
    return criteria;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-university').addEventListener('click', onNewUniversity);
    document.getElementById('add-criteria').addEventListener('click', onNewCriteria);
    document.getElementById('next').addEventListener('click', onNext);
    document.getElementById('run').addEventListener('click', onExecute);
});
