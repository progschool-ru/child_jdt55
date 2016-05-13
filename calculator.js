'use strict';
var artkli_calculator = (function() {

	function initialization($calc, tarifs, city_names, way_names, get_yaCounter){
		$calc.find('[data-toggle="tooltip"]').tooltip();   
		init_event_handlers($calc, tarifs, get_yaCounter, city_names, way_names);

		reset($calc, tarifs, city_names);

		var call = $calc.find('.artkli-call')[0];
		call.setAttribute('class', 'artkli-hidden artkli-call');

		update_way_dependent($calc);

		var from_cities = get_from_cities_keys(tarifs, city_names);
		var where_cities = get_where_cities(tarifs, city_names);
		
		from_cities.sort(function(a, b){
			return a < b ? -1 : a > b ? 1 : 0;
		});

		var options_html = init_build_selectors(from_cities, city_names);	
		var from_select = $calc.find('.artkli-from')[0];
		from_select.innerHTML = options_html;
		
		var options_html = init_build_selectors(where_cities, city_names);
		var where_select = $calc.find('.artkli-where_select')[0];
		where_select.innerHTML = options_html;
	}









	function init_event_handlers($calc, tarifs, get_yaCounter, city_names, way_names){
		var from = $calc.find('.artkli-from')[0];
		var where = $calc.find('.artkli-where_select')[0];
		var button = $calc.find('.artkli-butt')[0];
		var massa = $calc.find('.artkli-massa')[0];
		var volume = $calc.find('.artkli-volume')[0];

		var form = $calc[0];
		form.addEventListener('click', get_handle_form_changed(get_yaCounter));
		from.addEventListener('change', get_handle_from_changed($calc, tarifs, get_yaCounter, city_names, way_names));
		where.addEventListener('change', get_handle_where_changed($calc, tarifs, get_yaCounter, way_names));
		button.addEventListener('click', get_handle_reset_changed($calc, tarifs, city_names));
		massa.addEventListener('input', get_handle_massa_and_volume_changed($calc, tarifs, get_yaCounter));
		volume.addEventListener('input', get_handle_massa_and_volume_changed($calc, tarifs, get_yaCounter));
	}
	function fill_text($calc, tarifs){
		var resultat;
		var result_field = $calc.find('.artkli-result_field')[0];
		var from = $calc.find('.artkli-from')[0].value;
		var where = $calc.find('.artkli-where_select')[0].value;
		var mass = $calc.find('.artkli-massa')[0];
		var volume = $calc.find('.artkli-volume')[0];
		var check_auto = from + where;
		var way = $calc.find('.artkli-way');
		var way = what_is_way(way);
			if(from == "undefined_city" && where == "undefined_city" && mass.value == 0 && volume.value == 0){
				resultat = "Итог";
				result_field.setAttribute('class','alert alert-info artkli-result_field');
			}
			else if(from == "undefined_city" ){
				resultat = "Выберите пункт отправления!";
				result_field.setAttribute('class','alert alert-warning artkli-result_field');

			}
			else if(where == "undefined_city" ){
				resultat = "Выберите пункт назначения!";
				result_field.setAttribute('class','alert alert-warning artkli-result_field');
			}
			else if(mass.value == 0){					
				resultat = "Введите вес груза!";
				result_field.setAttribute('class','alert alert-warning artkli-result_field');
				var call = $calc.find('.artkli-call')[0];
				call.setAttribute('class', 'artkli-hidden artkli-call');
			}
			else if(volume.value == 0){
				resultat = "Введите объем груза!";
				result_field.setAttribute('class','alert alert-warning artkli-result_field');
				var call = $calc.find('.artkli-call')[0];
				call.setAttribute('class', 'artkli-hidden artkli-call');
			}
			else{
					var tax = conclusion_tax(tarifs, from, where, mass.value, volume.value, way);
					var tax_by_mass = tax.by_mass;
					var tax_by_volume = tax.by_volume;

					var ans1 = tax_by_mass * mass.value;
					var ans2 = tax_by_volume * volume.value;

					if(ans1 > ans2){
						resultat = ans1;
					}
					else{
						resultat = ans2;
					}
					if(auto_way_check(from, where, tarifs)){
						if( mass.value > 5000 || volume.value >  25){
							resultat = "Цена договорная";
							result_field.setAttribute('class','alert alert-success artkli-result_field');
						}
						else{
							resultat = digit(String(Math.round(resultat)));
							result_field.setAttribute('class','alert alert-success artkli-result_field');
							var call = $calc.find('.artkli-call')[0];
							call.setAttribute('class', 'dump-noborder artkli-call');
							resultat = "Автоперевозка! Итоговая сумма: "+resultat+" руб."; 
						}
					}
					else if(isNaN(resultat)){
						resultat = " ";
					}
					else if(tax_by_volume == -2 || tax_by_mass == -2){
						resultat = "Цена договорная";
						result_field.setAttribute('class','alert alert-success artkli-result_field');
					}
					else{
						resultat = digit(String(Math.round(resultat)));
						result_field.setAttribute('class','alert alert-success artkli-result_field');
						var call = $calc.find('.artkli-call')[0];
						call.setAttribute('class', 'dump-noborder artkli-call');
						resultat = "Итоговая сумма: "+ resultat +" руб.";
					}
				}
			$calc.find('.artkli-result')[0].innerHTML = resultat;
	}
	function update_way_dependent($calc, tarifs, from, to, way_names) {
		var check = dev_update_dependent(tarifs, to, from, $calc, way_names);
		var way_dependent = find_depedency_var($calc);
		var dependency = way_dependent.dependency;
		var chooser_dep = way_dependent.chooser_dep;
		if(check == -1){
			dependency.setAttribute('class', 'artkli-choose_way artkli-hidden');
			chooser_dep.setAttribute('class', 'artkli_chooser artkli-hidden');
		}	
		else{
			var state = state_way_dependent(tarifs, from, to);
			if(state){
				dependency.setAttribute('class', 'artkli-choose_way'); 
				chooser_dep.setAttribute('class', 'artkli-chooser'); 
			}
			else{
				dependency.setAttribute('class', 'artkli-choose_way artkli-hidden'); 
				chooser_dep.setAttribute('class', 'artkli-chooser artkli-hidden'); 
			}
			dependency.innerHTML = check.buttons;
			chooser_dep.innerHTML = check.chooser;
			if($calc.find('.artkli-auto_way')[0]){
				var auto_way = $calc.find('.artkli-auto_way')[0];
				var jd_way = $calc.find('.artkli-jd_way')[0];
				auto_way.addEventListener('change', get_handle_radio_changed($calc, tarifs));
				jd_way.addEventListener('change', get_handle_radio_changed($calc, tarifs));
			}		
		}	
	} 
	function reset($calc, tarifs, city_names){	
		update_way_dependent($calc);

		var result_field = $calc.find('.artkli-result_field')[0];
		var from = $calc.find('.artkli-from')[0].value; 
		var where = $calc.find('.artkli-where_select')[0].value;
		var mass = $calc.find('.artkli-massa')[0].value = "";
		var volume = $calc.find('.artkli-volume')[0].value = ""; 

		var call = $calc.find('.artkli-call')[0];
		call.setAttribute('class', 'artkli-hidden artkli-call');

		result_field.setAttribute('class','alert alert-info artkli-result_field');

		var resultat = "Итог";
		$calc.find('.artkli-result')[0].innerHTML = resultat;

		var from_cities = get_from_cities_keys(tarifs, city_names);
		var where_cities = get_where_cities(tarifs, city_names);

		from_cities.sort(function(a, b){
			return a < b ? -1 : a > b ? 1 : 0;
		});

		var from_select = $calc.find('.artkli-from')[0];
		var where_select = $calc.find('.artkli-where_select')[0];

		var options_html = init_build_selectors(from_cities, city_names);
		from_select.innerHTML = options_html;
		
		var options_html = init_build_selectors(where_cities, city_names);
		where_select.innerHTML = options_html;
	}
	function check_radio($calc, tarifs, way_names){
		var from = $calc.find('.artkli-from')[0].value; 
		var where = $calc.find('.artkli-where_select')[0].value;
		update_way_dependent($calc, tarifs, from, where, way_names);
	}
	function update_where($calc, city_names, tarifs){
		var where_elem = $calc.find('.artkli-where_select')[0];
		var from = $calc.find('.artkli-from')[0].value; 

		update_where_selector(tarifs, city_names, from, where_elem);
	}
	function update_from($calc, tarifs, city_names){
		var from_elem = $calc.find('.artkli-from')[0]; 
		var where = $calc.find('.artkli-where_select')[0].value;

		update_from_selector(tarifs, city_names, from_elem, where);
	}
	function find_depedency_var($calc){
		var dependency = $calc.find('.artkli-choose_way')[0];
		var chooser_dep = $calc.find('.artkli-chooser')[0];
		if(dependency == undefined)
			dependency = $calc.find('.artkli-choose_way.artkli-hidden')[0];
		if(chooser_dep == undefined)
			chooser_dep = $calc.find('.artkli_chooser.artkli-hidden')[0];
		return {
			dependency: dependency,
			chooser_dep: chooser_dep
		}
	}
	function dev_update_dependent(tarifs, to, from, $calc, way_names){
		var dependency = find_depedency_var($calc).dependency;
		var chooser_dep = find_depedency_var($calc).chooser_dep;
		var buttons = [];
		var chooser = build_radio_chooser();

		if(!tarifs || to == "undefined_city" || from == "undefined_city") 
			return -1;
		else {
			var ways = Object.keys(tarifs[from][to]);
			for(var i = 0; i < ways.length; i++){
				var radio_name = ways[i];
				var radio = build_radio(radio_name, way_names[radio_name], i+1);
				buttons.push(radio);
			}
			var buttons = buttons.join("\n");
			return {
				buttons: buttons,
				chooser: chooser
			}
		}
	}
	function state_way_dependent(tarifs, from, to){
		if(Object.keys(tarifs[from][to]).length == 2)
			return true;
		else
			return false;
	}
	function init_build_selectors(way_cities, city_names){
		var options = [];
		var f_option = build_first_option();
		options.push(f_option);
		for(var i = 0; i < way_cities.length; i++){
			var city = way_cities[i];
				var option = build_option_html(city, city_names[city]);
				options.push(option);		
		}
		return options.join("\n");
	}
	function get_from_cities_keys(tarifs, city_names){ 
		return Object.keys(tarifs);
	}
	function get_from_cities_by_where(where, all_from, tarifs, city_names){
		var all_from = get_from_cities_keys(tarifs, city_names);
		var cities = {};
		if(where == "undefined_city"){
			where = null;
		}
		if(!where){
			for(var i = 0; i < all_from.length; i++){
				cities[all_from[i]] = true;
			}
		}
		else{
			var from_cities = [];
			for(var i = 0; i < all_from.length; i++){
				var from = Object.keys(tarifs[all_from[i]]);
				for(var j = 0;j < from.length; j++){
					if(from[j] == where){
						from_cities[from_cities.length] = all_from[i];
						break;
					}
				}
			}
			for(var i = 0; i < all_from.length; i++){
				var city_check = all_from[i];
				for(var j = 0; j < from_cities.length; j++){
					if(city_check == from_cities[j]){
						cities[city_check] = true;
						break;
					}
					else{
						cities[city_check] = false;
					}
				}
			}
		}
		var ans = [];
		var length = Object.keys(cities).length;
		for(var i = 0; i < length; i++){
			var city = all_from[i];
			if(cities[city] == true){
				ans.push(city);
			}
		}
		return ans;
	}
	function update_from_selector(tarifs, city_names, from_select, where){
		var sel_from = from_select.value;
		var all_from = get_from_cities_keys(tarifs, city_names);
		var from_cities = get_from_cities_by_where(where, all_from, tarifs, city_names);

		var options = [];
		var options_html = selector_update(from_cities, sel_from, city_names);
		from_select.innerHTML = options_html;
	}
	function conclusion_tax(tarifs, from, where, mass, volume, way){
		var from_tarifs = tarifs[from];
		var ways = from_tarifs && from_tarifs[where];
		var ranges = ways && (ways[way] || ways.default_way);
		if(!ranges){
			return {by_mass: NaN, by_volume: NaN}
		}
		return{
				by_mass: get_tax(ranges.mass_range, ranges.mass_price, mass),
				by_volume: get_tax(ranges.volume_range, ranges.volume_price, volume)
		}
	}
	function build_radio(radio_name, radio, value){
		return "<label class=\"radio-inline \" style=\"margin-bottom:-10px; width:50px; height:27px; margin-left:10px;\"><input type = \"radio\" class=\"artkli-way artkli-"+radio_name+"\" name=\"artkli-way\" checked value="+value+">"+radio+"</input></label>";
	}
	function build_radio_chooser(){
		return "<label class=\"col-sm-2 control-label\" style=\"margin-bottom:-10px; width: 80px; margin-left: -14px; text-align: left; margin-top:2px;\" >Доставка</label>";
	}
	function get_where_cities(tarifs, city_names){
		var all_from = Object.keys(tarifs);
		var arr = [];
		var i = 0;
		for(var i = 0; i < all_from.length; i++){
			var from_city = tarifs[all_from[i]];
			var from_city = Object.keys(from_city);
			arr[arr.length] = from_city;
		}
		var where_cities = arr[3], compare;
		for(i = 0; i < arr.length; i++){
			for(var j = 0; j < arr[i].length; j++){
				var checker = arr[i];
				var checker = checker[j];
				for(var k = 0; k < where_cities.length; k++){
					compare = -1;
					if(checker == where_cities[k]){
						where_cities.splice(k,k+1);
					}
				}
				if(compare == -1){
					where_cities[where_cities.length] = checker;
				}
			}
		}

		var elements = [];
		for(var i = 0; i < where_cities.length; i++){
			elements[i] = where_cities[i];
		}
		return elements;
	}
	function what_is_way(way_element_arr){
		return way_element_arr.length == 0 ? 'default_way'
			:way_element_arr[0].checked ? 'jd_way' 
			: 'auto_way';
	}
	function build_option_html(city, city_name){
		return "<option value=\"" + city + "\">" + city_name + "</option>";
	} 
	function build_option_html_selected(city, city_name){
		return "<option selected value=\"" + city + "\">" + city_name + "</option>";
	}
	function build_first_option(){
		return  "<option selected disabled value=\"undefined_city\">Выберите город</option>";
	}
	function auto_way_check(from, where, tarifs){
		if(Object.keys(tarifs[from][where]) == 'default_way'){
			if(tarifs[from][where]['default_way']['mass_price'][1] == -2)return true;
		}
		return false;
	}
	function get_where_cities_by_from(from, tarifs, city_names){
		var cities = {};
		var all_from = get_from_cities_keys(tarifs, city_names);
		var all_where = get_where_cities(tarifs, city_names);
		if(from == "undefined_city"){
			from = null;
		}
		if(!from){
			for(var i = 0; i < all_where.length; i++){
				cities[all_where[i]] = true;
			}
		}
		else{
			var concrete_where = Object.keys(tarifs[from]);
			for(var i = 0; i < all_where.length; i++){
				var city_check = all_where[i];
				for(var j = 0; j < concrete_where.length; j++){
					if(city_check == concrete_where[j]){
						cities[city_check] = true;
						break;
					}
					else{
						cities[city_check] = false;
					}
				}
			}
		}
		var ans = [];
		var length = Object.keys(cities).length;
		for(var i = 0; i < length; i++){
			var city = all_where[i];
			if(cities[city] == true){
				ans.push(city);
			}
		}
		return ans;
	}
	function digit(result){
		return result.replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g,"\$1 ");
	}
	function selector_update(cities, sel_city, city_names){
		var options = [];
		var sorted = cities.slice();
		sorted.sort(function(a, b){
			return city_names[a] < city_names[b] ? -1 : city_names[a] > city_names[b] ? 1 : 0;
		});
		for(var i = 0; i < sorted.length; i++) {
			var city = sorted[i];
			if(city == sel_city){
				var option = build_option_html_selected(city, city_names[city]);
			}
			else{
				var option = build_option_html(city, city_names[city]);
			}
			options.push(option);
		}
		var options_html = options.join("\n");
		return options_html;
	} 
	function update_where_selector(tarifs, city_names, from, where_select) {//Зависит от грязной
		var where_cities_n = get_where_cities_by_from(from, tarifs, city_names);
		var options = [];
		var options_html = selector_update(where_cities_n, where_select.value, city_names);
		where_select.innerHTML = options_html;
	}
	function get_tax(valueRange, taxRange, tax){
		var gradation = valueRange;
		var amount = gradation.length;
		var end = 0;
		for(var i = amount; i >= 0; i--){
			if(tax < gradation[i]){
				end = taxRange[i];  
			}
		}
		if(end == 0){
			var amount = taxRange.length
			end = taxRange[amount-1];
		}
		return end;
	}  
	function get_handle_from_changed($calc, tarifs, get_yaCounter, city_names, way_names){
		return function handle_from_changed(event){
			var $calc = $('.artkli-calc');
			check_radio($calc, tarifs, way_names);
			update_where($calc, city_names, tarifs);
			update_from($calc, tarifs, city_names);
			fill_text($calc, tarifs);
			send_ya_goal_complete(get_yaCounter, $calc.find('.artkli-call')[0]);
			send_ya_goals_phone_and_request(get_yaCounter, $calc.find('.artkli-call')[0], $calc);
			send_ya_goal_change(get_yaCounter);
		}
	}
	function get_handle_where_changed($calc, tarifs, get_yaCounter, way_names){
		return function handle_where_changed(event){
			var $calc = $('.artkli-calc');
			check_radio($calc, tarifs, way_names);
			update_from($calc, tarifs, city_names);
			update_where($calc, city_names, tarifs);
			fill_text($calc, tarifs);
			send_ya_goal_complete(get_yaCounter, $calc.find('.artkli-call')[0]);
			send_ya_goals_phone_and_request(get_yaCounter, $calc.find('.artkli-call')[0], $calc);
			send_ya_goal_change(get_yaCounter);
		}
	}
	function get_handle_massa_and_volume_changed($calc, tarifs, get_yaCounter){
		return function handle_massa_and_volume_changed(event){
			var $calc = $('.artkli-calc');
			send_ya_goal_complete(get_yaCounter, $calc.find('.artkli-call')[0]);
			send_ya_goals_phone_and_request(get_yaCounter, $calc.find('.artkli-call')[0], $calc);
			send_ya_goal_change(get_yaCounter);
			fill_text($calc, tarifs);
			if(this.value != 0 && this.value != '.'){
				this.value = parseFloat(this.value)  || 0; 
				fill_text($calc, tarifs);
			}
		}
	}
	function get_handle_radio_changed($calc, tarifs){
		return function handle_radio_changed(event){
			fill_text($calc, tarifs);
		}
	}
	function send_ya_goal_complete(get_yaCounter, target){
		if(target.className == 'dump-noborder artkli-call')
			get_yaCounter().reachGoal('fill_form'); return true;
	}

	function send_ya_goals_phone_and_request(get_yaCounter, target, $calc){
		if(target.className == 'dump-noborder artkli-call'){
			var phone_field = $calc.find('.phone_num')[0];
			var request_field = $calc.find('.request')[0];

			phone_field.addEventListener('mouseover', get_handle_phone_focus(get_yaCounter));
			request_field.addEventListener('click', get_handle_request_click(get_yaCounter));
		}
	}
	function get_handle_phone_focus(get_yaCounter){
		return function handle_phone_focus(event){
			get_yaCounter().reachGoal('focus_phone'); return true;
		}
	}
	function get_handle_request_click(get_yaCounter){
		return function handle_request_click(event){
			get_yaCounter().reachGoal('fill_blank'); return true;
		}
	}

	function send_ya_goal_change(get_yaCounter){
		get_yaCounter().reachGoal('change_some_fields'); return true;
	}
	function get_handle_reset_changed($calc, tarifs, city_names){
		return function handle_reset_changed(event){
			reset($calc, tarifs, city_names);
		}
	}
	function get_handle_form_changed(get_yaCounter){
		return function handle_from_changed(event){
			get_yaCounter().reachGoal('was_click'); return true;
		}
	}





	return {
		initialization: initialization,

	};
})()