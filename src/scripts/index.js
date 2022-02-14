const data = [
	{view: 'Красный', brand: 'lg', actions: '10%', r_length: 10000},
	{view: 'Зелёный', brand: 'lg', actions: '10%', r_length: 50000},
	{view: 'Красный', brand: 'samsung', actions: '10%', r_length: 100000},
	{view: 'Жетлый', brand: 'lg', actions: '15%', r_length: 140000},
];


const filters = {};


const boxFilters = document.querySelector('.filters');

const filterHeader = document.querySelector('.filter-header');

const filterHeaderIco = document.querySelector('.filter-header__ico');

const buttonShowMore = document.getElementById('button-show-more');

filterHeader.addEventListener('click', function(){

	const filtersBox = this.nextElementSibling;	

	if(filtersBox.style.display === 'block'){
		filterHeaderIco.src = './img/show-more.svg';		
		filtersBox.style.display = 'none';
		this.style.borderRadius = '6px';
		return;
	}

	filterHeaderIco.src = './img/hide-more.svg';
	filtersBox.style.display = 'block';
	this.style.borderRadius = '6px 6px 0 0';

})


function addToFilter(event){	

	const targetClass = event.target.classList.value;

	if(targetClass === 'filter__item' || targetClass === 'filter__item selected'){

		const category = event.target.parentElement.dataset.category;
		
		const li = event.target;
		const wordForFilter = li.textContent;		
		
		if (li.classList.value === 'filter__item'){			
			li.classList.add('selected');

			if(!filters[category]){
				filters[category] = new Set();
			}

			filters[category].add(wordForFilter);

		}else if(li.classList.value === 'filter__item selected'){			
			li.classList.remove('selected');
			filters[category].delete(wordForFilter);
		}
		
		console.log("filters", filters);
	}


}


function applyFilters(event){	

	if(event.target.className === 'filter__button'){		

		let filteredData = [...data];

		const filtersKeys = Object.entries(filters);	

		filtersKeys.forEach( ([nameFilter, setFilter]) => {
			if(setFilter.size){
				filteredData = filter(setFilter, nameFilter, filteredData);	
			}
		});
		
		event.target.parentElement.style.display = 'none';		

		console.log('filteredData', filteredData);

	}

}

function applyRangeFilters(event){
	

	if(event.target.className === 'filter-range__button'){			

		let filteredData = [...data];

		const filtersKeys = Object.entries(filters);	

		filtersKeys.forEach( ([nameFilter, setFilter]) => {

			if(nameFilter === 'r_length'){				

				filteredData = filterRange(filteredData, nameFilter)
			}
		});				

		console.log('filteredData', filteredData);

	}

}


function filter(setFilter, nameFilter, filteredData){		

	filteredData = filteredData.filter(item => {		

		return setFilter.has(item[nameFilter])			
		
	});			

	return filteredData;

}

/////////////!!!!!!!!!!!!!!!!!!!!!

function filterRange(filteredData, nameFilter){

		
	const [min, max] = filters[nameFilter];
	

	filteredData = filteredData.filter(item => {

		return item[nameFilter] >= min && item[nameFilter] <= max
					
	});		

	return filteredData;
}


boxFilters.addEventListener('click', addToFilter);

boxFilters.addEventListener('click', applyFilters);




// динамика появления элементов


boxFilters.addEventListener('click', showFilterBody);

function showFilterBody(event){	

	if(event.target.className !== 'filter__title filter__title_mark'){
		return
	}
	
	const filterBody = event.target.nextElementSibling;

	if(filterBody && !filterBody.style.display){
		filterBody.style.display = 'block';
	}else if(filterBody){
		filterBody.style.display = '';
	}			
	
}



// создание фильтров


buttonShowMore.addEventListener('click', function(){	

	if(this.textContent === 'Показать больше параметров (12)'){

		buttonShowMore.style.margin = '21px 0 0 20px';

		this.textContent = 'Показать меньше параметров (12)';

		fetch('http://localhost:3004/filters')
			.then( response => response.json() )
		    .then( filters => {		    	
		    	filters.checkboxFilters.forEach( item => {
					createCheckboxFilter( item.filterCategory, item.filterTitle, item.filterWords);
				});
				filters.rangeFilter.forEach( item => {
					createRangeFilter( item.category, item.title, item.min, item.max );
				});

		    })
		    .then(() => startRange());	

	}else if(this.textContent === 'Показать меньше параметров (12)'){

		buttonShowMore.style.margin = '';

		const filtersBox = this.previousElementSibling;		

		const quantityElements = filtersBox.childElementCount;

		for(let i = 4; i < quantityElements; i++){			

			filtersBox.lastElementChild.remove();

		}

		this.textContent = 'Показать больше параметров (12)';
	}
	
});


function createCheckboxFilter(filterCategory, filterTitle, filterWords){

	const filters = document.querySelector('.filters');

	let filter = document.createElement('div');
	filter.classList.add('filter');

	filters.append(filter);	

	filter.innerHTML = `	
		<div class="filter__title filter__title_mark">${filterTitle}</div>
		<div class="filter__body">
			<ul class="filter__list" data-category=${filterCategory}>
			</ul>
			<button class="filter__button">Применить</button>
		</div>	
	`;
	
	const filterLists = document.querySelectorAll('.filter__list');
	const id = filterLists.length-1;

	filterWords.forEach(item => {
		const li = document.createElement('li')
		li.classList.add('filter__item')
		li.textContent = item;		
		filterLists[id].append(li);
	});		

}



function createRangeFilter(category, title, min, max){
	const filters = document.querySelector('.filters');

	let filter = document.createElement('div');
	filter.classList.add('filter-range');

	filters.append(filter);

	filter.innerHTML = `	
		<div class="filter__title">${title}, мм</div>
		  
	    <input value=${min} min=${min} max=${max} step="1" type="range" class="filter-range__range-min input-range">
	    <input value=${max} min=${min} max=${max} step="1" type="range" class="filter-range__range-max input-range">		    

	    <div class="filter-range__inputs-text" data-category=${category}>
	  	  <input type="text" class="filter-range__input-min input-text" placeholder="от 5">
	      <input type="text" class="filter-range__input-max input-text" placeholder="до 150000">
	      <div class="filter-range__button"></div>
	    </div>	
	`;
}

boxFilters.addEventListener('click', addRangeFilter);

function addRangeFilter(event){

	if(event.target.className !== 'filter-range__button'){
		return;
	}		

	let min = event.target.previousElementSibling.previousElementSibling.value;
	let max = event.target.previousElementSibling.value;	

	const filterName = event.target.parentElement.dataset.category;

	filters[filterName] = [Number(min), Number(max)];	


	applyRangeFilters(event)

}



////////////////// filter-range


boxFilters.addEventListener('input', controlUnit);


function controlUnit(event){	

	if(event.target.className.includes('filter-range__input-min')){		

		const slide = event.target.parentElement.previousElementSibling;	

		const maxValue = slide.getAttribute('max');

		slide.previousElementSibling.value = event.target.value;	

		showScale(event.target.value, event.target.nextElementSibling.value, slide, maxValue);
		

	}else if(event.target.className.includes('filter-range__input-max')){

		const slide = event.target.parentElement.previousElementSibling;

		const maxValue = slide.getAttribute('max');

		slide.value = event.target.value;

		showScale(event.target.previousElementSibling.value, event.target.value, slide, maxValue);
	}

}
	

function getVals(){ 	
    
    const parent = this.parentNode;    
 
    const slides = parent.getElementsByClassName("input-range");   

    const maxValue = slides[0].getAttribute('max');

    let slide1 = parseFloat( slides[0].value );
    let slide2 = parseFloat( slides[1].value );	
	
	if( slide1 > slide2 ){ 
	  let tmp = slide2; 
	  slide2 = slide1; 
	  slide1 = tmp; 
	}	

	const textInputs = parent.getElementsByClassName("input-text");

	textInputs[0].value = slide1;
    textInputs[1].value = slide2;		   

    showScale(slide1, slide2, slides[0], maxValue);		 

}


function showScale(min = 0, max = 100, slide, maxValue){

	let scaleMin = 100 * min / maxValue ;
    let scaleMax = 100 * max / maxValue ;		

	slide.style.background = 
	`linear-gradient(90deg, #B2B2B2 0%, #B2B2B2 ${scaleMin}%, #0F74D1 ${scaleMin}%, #0F74D1 ${scaleMax}%, #B2B2B2 ${scaleMax}%, #B2B2B2 100% )`;
	
}


function startRange(){
	
	const filtersRange = document.getElementsByClassName("filter-range");

	for( let x = 0; x < filtersRange.length; x++ ){

	    const sliders = filtersRange[x].getElementsByTagName("input");

	    for( let y = 0; y < sliders.length; y++ ){

	        if( sliders[y].type ==="range" ){	        	

	          sliders[y].oninput = getVals;        
	          sliders[y].oninput();

	        }

	    }

	}

}