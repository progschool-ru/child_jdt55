'use strict';
var artkli_calculator = (function() {


	function get_from_cities(tarifs, city_names){ 
		var nodes = Object.keys(tarifs); 
		var len = nodes.length;
		var sorted = [];
		while (nodes[0]) {
			var city = city_names[nodes[0]];
			sorted.push(new String(city));
			sorted[sorted.length-1].element = nodes[0];
			nodes.splice(0,1);
		}
		sorted = sorted.sort();
		for (var i = 0; i < len; i++) {
			nodes[i] = sorted[i].element;
		}
		var all_from = nodes;
		return all_from;
	 }
	function blur_button(button){
		button.blur();
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
		return "<label class=\"radio-inline \" style=\"margin-bottom:-10px; width:50px; height:27px; margin-left:10px;\"><input type = \"radio\" id=\"artkli-"+radio_name+"\" name=\"artkli-way\" onchange=\"artkli.fill_text();\" checked value="+value+">"+radio+"</input></label>";
	}
	function build_radio_chooser(){
		return "<label class=\"col-sm-2 control-label\" style=\"margin-bottom:-10px; width: 80px; margin-left: -14px; text-align: left; margin-top:2px;\" >Доставка</label>";
	}
	function get_where_cities(tarifs){
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
		var nodes = wrapper;
		var len = nodes.length;
		var sorted = [];
		while (nodes[0]) {
			var city = artkli_city_names[nodes[0]];
				sorted.push(new String(city));
				sorted[sorted.length-1].element = nodes[0];
				wrapper.splice(0,1);
		}
		sorted = sorted.sort();
		for (var i = 0; i < len; i++) {
			wrapper[i] = sorted[i].element;
		}
		where_cities = wrapper;
		return where_cities;
	}
	function what_is_way(way){
		if(way.length == 0){
			way.innerHTML = 
			"<input type = \"radio\" id=\"artkli-+default_way+ name=\"artkli-way\" onchange=\"artkli.fiil_text();\" checked><font-size=\"3\">ЖД</font></input>";
		}
		else{
			if(way[0].checked){
				var way = "jd_way";
			}
			else{
				var way = "auto_way";
			}
		}
		return way;
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
	function auto_way_check(from, where){
		var count = 0;
		if(artkli_auto_way_tarifs[from]){
			var where_cities = [];
			where_cities.push(artkli_auto_way_tarifs[from]);
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
	function get_where_cities_by_from(from, tarifs){
		var cities = {};
		var all_from = artkli_calculator.get_from_cities(tarifs, artkli_city_names);
		var all_where = artkli_calculator.get_where_cities(tarifs);
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
	function selector_update(cities_n, options, sel_city, cities){
		for(var i = 0; i < cities.length; i++) {
			var city = cities[i];
			if(cities_n[city] == true){
				if(city == sel_city){
					var option = build_option_html_selected(city, artkli_city_names[city]);
				}
				else{
					var option = build_option_html(city, artkli_city_names[city]);
				}
				options.push(option);
			}
		}
		var options_html = options.join("\n");
		return options_html;
	} 
	function update_where_selector(tarifs, city_names, from, where_select) {//Зависит от грязной
		var sel_where = where_select.value;
		var where_cities_n = get_where_cities_by_from(from, tarifs);
		var where_cities = Object.keys(where_cities_n);
		var options = [];
		var options_html = selector_update(where_cities_n, options, sel_where, where_cities);
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
		build_radio: build_radio,
		build_radio_chooser: build_radio_chooser,
		get_where_cities: get_where_cities,
		what_is_way: what_is_way,
		build_option_html: build_option_html,
		build_first_option: build_first_option,
		auto_way_check: auto_way_check,
		get_from_cities: get_from_cities,
		blur_button: blur_button,
		get_where_cities_by_from: get_where_cities_by_from,
		selector_update: selector_update,
		update_where_selector: update_where_selector,
		digit: digit

	};
})()