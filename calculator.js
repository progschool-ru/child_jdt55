'use strict';
var artkli_calculator = (function() {

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
	function dev_update_dependent(tarifs, to, from, $calc){
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
				var radio = build_radio(radio_name, artkli_way_names[radio_name], i+1);
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
		var all_from = get_from_cities_keys(artkli_tarifs, city_names);
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
	function auto_way_check(from, where, auto_way_tarifs){
		var count = 0;
		if(auto_way_tarifs[from]){
			var where_cities = [];
			where_cities.push(auto_way_tarifs[from]);
			for(var i = 0; i < where_cities.length; i++){
				if(where_cities[i] == where){
					break;
				}
				else{
					count++;
				}
			}
			if(count == where_cities.length){
				return false;
			}
			return true;
		}
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






	return {
		find_depedency_var: find_depedency_var,
		dev_update_dependent: dev_update_dependent,
		state_way_dependent: state_way_dependent,
		init_build_selectors: init_build_selectors,
		build_radio_chooser: build_radio_chooser,
		conclusion_tax: conclusion_tax,
		get_from_cities_by_where: get_from_cities_by_where,
		update_from_selector: update_from_selector,
		build_radio: build_radio,
		build_radio_chooser: build_radio_chooser,
		get_where_cities: get_where_cities,
		what_is_way: what_is_way,
		build_option_html: build_option_html,
		build_first_option: build_first_option,
		auto_way_check: auto_way_check,
		get_from_cities_keys: get_from_cities_keys,
		get_where_cities_by_from: get_where_cities_by_from,
		selector_update: selector_update,
		update_where_selector: update_where_selector,
		digit: digit

	};
})()