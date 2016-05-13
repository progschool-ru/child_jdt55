'use strict';
var artkli_calculator2 = (function() {

	function get_form_html(){
		return "<h2 style=\"margin-left:-15px;\">Автоэкспед-ние грузов</h2><div class=\"form-group\"><label for=\"artkli-city\" class=\"col-sm-2 control-label\" style=\" width: 62px; margin-left: -14px;text-align: left; margin-top: 5px;\">Город</label> <div class=\"col-sm-10\"><select name=\"artkli-city\" class=\"form-control artkli-select\" style=\"width: 295px;\"></select></div></div><div class=\"form-group\"><label for=\"artkli-massa\" class=\"col-sm-2 control-label\" style=\" width: 62px; margin-left: -14px;text-align: left; margin-top: 5px;\">Вес</label><div class=\"col-sm-10\"><input name=\"artkli-volume\" id=\"artkli-massa\" class=\"form-control artkli-massa\" type=\"text\" placeholder = \"Кг\" style=\"text-align: right;\" value=\"\"/></div></div><div class=\"form-group\"><label for=\"artkli-volume\" class=\"col-sm-2 control-label\" style=\"width: 62px; margin-left: -14px;text-align: left; margin-top: 5px;\">Объем</label><div class=\"col-sm-10\"><input name= \"artkli-volume\" id=\"artkli-volume\" class=\"form-control artkli-volume\" type=\"text\" placeholder = \"Куб.м.\" style=\"text-align: right;\" value=\"\"/></div></div><div name=\"result_field\" class=\"alert alert-info artkli-result_price\" style=\"height: 36px width: 100%; margin-right: 76px; margin-left: -15px;\" role=\"alert\"><font size=\"3\"><span style=\"margin-bottom: 180px\" class=\"artkli-result\">Итог</span></font></div><div name=\"result_field\" class=\"alert alert-info artkli-result_car artkli-hidden\" style=\"height: 36px width: 100%; margin-right: 76px; margin-left: -15px;\" role=\"alert\"><font size=\"3\"><span style=\"margin-bottom: 180px\" class=\"artkli-result\">Итог</span></font></div>"
	}

	function build_option_html(city, city_name){
		return "<option value=\"" + city + "\">" + city_name + "</option>";
	} 
	function build_first_option(){
		return  "<option selected disabled value=\"undefined_city\">Выберите город</option>";
	}

	function init_build_selector(city_names){
		var options = [];
		var f_option = build_first_option();
		options.push(f_option);
		for(var i = 0; i < Object.keys(city_names).length; i++){
			var city = Object.keys(city_names)[i];
				var option = build_option_html(city, city_names[city]);
				options.push(option);		
		}
		return options.join("\n");
	}
	function init_event_handlers($calc, tarifs){
		var select = $calc.find('.artkli-select')[0];
		var volume = $calc.find('.artkli-volume')[0];
		var massa = $calc.find('.artkli-massa')[0];

		select.addEventListener('change', get_handle_select_changed($calc, tarifs));
		volume.addEventListener('input', get_handle_volume_and_massa_changed($calc, tarifs));
		massa.addEventListener('input', get_handle_volume_and_massa_changed($calc, tarifs));

	}
	function get_handle_select_changed($calc, tarifs){
		return function handle_select_changed(event){
			fill_text($calc, tarifs);
		}
	}
	function get_handle_volume_and_massa_changed($calc, tarifs){
		return function handle_volume_and_massa_changed(event){
			fill_text($calc, tarifs);
			if(this.value != 0 && this.value != '.'){
				this.value = parseFloat(this.value)  || 0; 
				fill_text($calc, tarifs);
			}
		}
	}

	function initialization($calc, city_names, tarifs){
		$calc.html(get_form_html());
		var select = $calc.find('.artkli-select')[0];
		var volume = $calc.find('.artkli-volume')[0];
		var massa = $calc.find('.artkli-massa')[0];
		init_event_handlers($calc, tarifs);
		var options_html = init_build_selector(city_names);
		select.innerHTML = options_html;
	}
	function reset(){

	}
	function fill_text($calc, tarifs){
		var select = $calc.find('.artkli-select')[0].value;
		var volume = $calc.find('.artkli-volume')[0].value;
		var massa = $calc.find('.artkli-massa')[0].value;
		var result_price = $calc.find('.artkli-result_price')[0];
		var result_car = $calc.find('.artkli-result_car')[0];
		var result;
		var car = -1;

		var city = select.value;

		if(select == 'undefined_city'){
			result = "Выберите город!";
			result_price.setAttribute('class', 'alert alert-warning artkli-result_price');
		}
		else{
			if(volume == "" && massa == ""){
				result = "Введите массу или объем!";
				result_price.setAttribute('class', 'alert alert-warning artkli-result_price');
			}
			else{
				if(massa == ""){
					var tax_by_volume = get_tax(volume, tarifs, select, 'volume_range');
					var car_by_volume = tax_by_volume.car;
					var price_by_volume = tax_by_volume.price;
					var price_by_mass = -5;
				}
				if(volume == ""){
					var tax_by_mass = get_tax(massa, tarifs, select, 'mass_range');
					var car_by_mass = tax_by_mass.car;
					var price_by_mass = tax_by_mass.price;
					var price_by_volume = -5;

				}
				if(massa != "" && volume != ""){
					var tax_by_mass = get_tax(massa, tarifs, select, 'mass_range');
					var car_by_mass = tax_by_mass.car;
					var price_by_mass = tax_by_mass.price;

					var tax_by_volume = get_tax(volume, tarifs, select, 'volume_range');
					var car_by_volume = tax_by_volume.car;
					var price_by_volume = tax_by_volume.price;
				}
				if(price_by_volume == -2 || price_by_mass == -2){
					ans = "Цена договорная";	
				}
				else{
					if(price_by_mass > price_by_volume){
						var ans = price_by_mass;
						car = car_by_mass;
					}
					else{
						var ans = price_by_volume;
						car = car_by_volume;
					}
					if(ans == -2){
						ans = "Цена договорная";
					}
				}
				result = " Стоимость: "+ ans;
				var car_ans = "Тр.средство: "+car;
				result_price.setAttribute('class', 'alert alert-success artkli-result_price');

			}
		}
		result_price.innerHTML = result;
		result_car.innerHTML = car_ans;
		if(car != -1){
			result_car.setAttribute('class', 'alert alert-success artkli-result_car');
		}
		else{
			result_car.setAttribute('class', 'alert alert-info artkli-result_car artkli-hidden');
		}

		//вывод времени погрузки + стоимость автомобиля + тип авто
	}
	function get_tax(value, tarifs, city, type){
		var taxRange = tarifs[city][type];
		var taxPrice = tarifs[city]['price'];
		var taxCars = tarifs[city]['car_range'];
		var car;
		var price;
		var end = 1;
		for(var i = taxRange.length-1; i >= 0; i--){
			if(value < taxRange[i]){
				price =	taxPrice[i+1];
				car = taxCars[i+1];
				end = 0;
			}
		}
		if(end == 1){
			price = -2;
			car = -1;
		}
		return{
			car: car,
			price: price
		};
	}  


	return {
		initialization: initialization
	};
})()