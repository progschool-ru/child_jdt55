'use strict';
var artkli_calculator = (function() {

	function get_from_cities_keys(tarifs, city_names){ 
		var city_keys = Object.keys(tarifs); 
		var len = city_keys.length;
		var sorted = [];
		var city_name;
		for(var i = 0; i < len; i++){
			sorted.push({
				city_name: city_names[city_keys[i]],
				city_key: city_keys[i]
			});
		}
		
		var elements = [];
		for (var i = 0; i < len; i++) {
			elements.push(sorted[i].city_key);
		}
		return elements;
	}
	function get_from_cities_by_where(where, all_from, tarifs, city_names){
		var all_from = artkli_calculator.get_from_cities_keys(artkli_tarifs, city_names);
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
				var from = all_from[i];
				var from = Object.keys(tarifs[from]);
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
		return cities;
	}
	function update_from_selector(tarifs, city_names, from_select, where){
		var sel_from = from_select.value;
		var all_from = artkli_calculator.get_from_cities_keys(tarifs, city_names);
		var from_cities_n = artkli_calculator.get_from_cities_by_where(where, all_from, tarifs, city_names);
		var from_cities = Object.keys(from_cities_n);
		var options = [];
		var options_html = artkli_calculator.selector_update(from_cities_n, options, sel_from, from_cities, city_names);
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
		return "<label class=\"radio-inline \" style=\"margin-bottom:-10px; width:50px; height:27px; margin-left:10px;\"><input type = \"radio\" id=\"artkli-"+radio_name+"\" name=\"artkli-way\" onchange=\"artkli.handle_radio_changed();\" checked value="+value+">"+radio+"</input></label>";
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
		var wrapper = where_cities;
		var city_keys = wrapper;
		var len = wrapper.length;
		var sorted = [];
		for(var i = 0; i < len; i++){
			sorted.push({
				city_name: city_names[city_keys[i]],
				city_key: city_keys[i]
			});
		}
		sorted.sort(function(a, b){
			return a.city_name < b.city_name ? -1 : a.city_name > b.city_name ? 1 : 0;
		});
		var elements = [];
		for (var i = 0; i < len; i++) {
			elements[i] = sorted[i].city_key;
		}
		return elements;
	}
	function what_is_way(way_element_arr){
		return way_element_arr.length == 0 ? 'default_way':
		way_element_arr[0].checked ? 'jd_way' : 'auto_way';
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
			else{
				return true;
			}
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
			var concrete_where = tarifs[from];
			var concrete_where = Object.keys(concrete_where);
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
		return cities;
	}
	function digit(result){
		return result.replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g,"\$1 ");
	}
	function selector_update(cities_n, options, sel_city, cities, city_names){
		cities.sort(function(a, b){
			return a < b ? -1 : a > b ? 1 : 0;
		});
		for(var i = 0; i < cities.length; i++) {
			var city = cities[i];
			if(cities_n[city] == true){
				if(city == sel_city){
					var option = build_option_html_selected(city, city_names[city]);
				}
				else{
					var option = build_option_html(city, city_names[city]);
				}
				options.push(option);
			}
		}
		var options_html = options.join("\n");
		return options_html;
	} 
	function update_where_selector(tarifs, city_names, from, where_select) {//Зависит от грязной
		var sel_where = where_select.value;
		var where_cities_n = get_where_cities_by_from(from, tarifs, city_names);
		var where_cities = Object.keys(where_cities_n);
		var options = [];
		var options_html = selector_update(where_cities_n, options, sel_where, where_cities, city_names);
		where_select.innerHTML = options_html;
	}





	function get_tax(valueRange, taxRange, tax){
		var gradation = valueRange;
		var amount = gradation.length;
		var end = 0;
		var i;
		for(i = amount; i >= 0; i--){
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