
// Load CSS
$("<link/>", { rel: "stylesheet", type: "text/css", href: "https://fooba.com.br/mca/assets/css/mca.css?v=8.8"	}).appendTo("head");
$("<link/>", { rel: "stylesheet", type: "text/css", href: "https://fooba.com.br/mca/assets/css/icons.css?v=4.1"	}).appendTo("head");

(function($){
	$.fn.easyView = function(option, value){
		var selector = $(this.selector);

		if(typeof selector.data('easyView') == 'undefined'){
			/* First execution */
			if(typeof option == 'string'){
				option = {};
			}

			var plugin = {
				selector: selector,
				currentRatio: 100,
				normalContrast: true,
				defaults: {
					container: 'body',
					tags: ['h1','h2','h3','h4','h5','h6', 'div', 'p', 'a', 'span', 'strong', 'em', 'ul', 'ol', 'li', 'label'],
					step: 10,
					bootstrap: true,
					defaultMarkup: '<a href="#decrease" class="decrease-text">Decrease font size</a><a href="#normal" class="reset-text">Normal font size</a><a href="#increase" class="increase-text">Increase font size</a><a href="#contrast" class="contrast-text">Change contrast</a>',
					increaseSelector: '.increase-text',
					decreaseSelector: '.decrease-text',
					normalSelector: '.reset-text',
					contrastSelector: '.contrast-text',
					persist: false
				},
				options: {},
				affectedTags: new Array(),
				nextContrastStyle: 0,
				contrastStyles: [
				    	{
				    		color: '#000',
				    		backgroundColor: '#fff',
				    	},
				    	{
				    		color: '#fff',
				    		backgroundColor:  '#000',
				    	} ,
				    	{
				    		color: '#38e8ff',
				    		backgroundColor: '#000',
				    	} ,
				    	{
				    		color: '#fff175',
				    		backgroundColor: '#000',
				    	},
				    	{
				    		color: '#ff56d9',
				    		backgroundColor: '#000',
				    	} 
				    ],
				mergeOptions: function(option){
					$.extend(this.options, this.defaults, option);
				},
				storeDefaults: function(){
					/* Store default values for each elements */
					$.each(this.affectedTags, function(elIndex, elValue){
						$(elValue).each(function(){
							var current_tag = $(this);
							var font_size = current_tag.css('font-size');

							if(font_size.indexOf('%') > -1){
								/* Percentage */
								current_tag.data('originalSize', parseInt(font_size.replace('%','')));
								current_tag.data('originalUnit', '%');
							} else {
								/* Other units */
								current_tag.data('originalSize', parseInt(font_size.replace(font_size.substr(-2),'')));
								current_tag.data('originalUnit', font_size.substr(-2));
							}

							current_tag.data('originalBackground', current_tag.css('background-color'));
							current_tag.data('originalColor', current_tag.css('color'));
						});
					});

					/* Container default values */
					$(this.options.container).data('originalBackground', $(this.options.container).css('background-color'));
					$(this.options.container).data('originalColor', $(this.options.container).css('color'));
				},
				createDefaultMarkup: function(){
					/* Create a default markup */
					if(selector.html() == ''){
						selector.html(this.options.defaultMarkup);
					}
				},
				setActions: function(){
					var self = this;

					/* Decrease font size */
					selector.find(this.options.decreaseSelector).click(function(ev){
						ev.preventDefault();
						self.decreaseFont();
					});

					/* Reset font size */
					selector.find(this.options.normalSelector).click(function(ev){
						ev.preventDefault();
						self.resetFont();
					});

					/* Increase font size */
					selector.find(this.options.increaseSelector).click(function(ev){
						ev.preventDefault();
						self.increaseFont();
					});

					/* Change text contrast */
					selector.find(this.options.contrastSelector).click(function(ev){
						ev.preventDefault();
						self.changeContrast();
					});
				},
				fetchTags: function(){
					/* Fetching all tags to work */
					var affectedTags = this.affectedTags;
					var options = this.options;
					$.each(this.options.tags, function(i, v){
						affectedTags.push(options.container+" "+v);
					});
				},
				decreaseFont: function(){
					if((this.currentRatio - this.options.step) >= 10){
						this.currentRatio = this.currentRatio - this.options.step;
					}
					this.changeFontSize();
				},
				resetFont: function(){
					/* Set default ratio */
					this.currentRatio = 100;
					this.changeFontSize();
				},
				increaseFont: function(){
					this.currentRatio = this.currentRatio + this.options.step;
					this.changeFontSize();
				},
				changeFontSize: function(ratio){
					if(typeof ratio != 'undefined' && parseInt(ratio) > 10){
						this.currentRatio = ratio;
					}

					var current_ratio = this.currentRatio;

					$.each(this.affectedTags, function(elIndex, elValue){
						$(elValue).each(function(){
							var current_tag = $(this);
							current_tag.css('font-size', (current_tag.data('originalSize')*(current_ratio/100))+current_tag.data('originalUnit'));
						});
					});

					this.persistConfig();
				},
				changeContrast: function(){
				    var normalContrast = this.normalContrast;
				    var contrastStyles = this.contrastStyles;
				 	var n = this.nextContrastStyle;		    

				    if (this.nextContrastStyle == 'normalContrast') {
				    	this.nextContrastStyle = 0;
				    } else if (this.nextContrastStyle < this.contrastStyles.length-1) {
				    	this.nextContrastStyle = this.nextContrastStyle+1;
				    } else {
				    	this.nextContrastStyle = 'normalContrast';
				    }

					$(this.affectedTags.join(',')).each(function(){
						var current_tag = $(this);

						 if (n == 'normalContrast') {
						 	 current_tag.css('color', current_tag.data('originalColor'));
						 	 current_tag.css('background-color', current_tag.data('originalBackground'));
						 } else {
			    			 console.log (n);
						 	 current_tag.css('color', contrastStyles[n].color);
						 	 current_tag.css('background-color', contrastStyles[n].backgroundColor);
						 	 
						 } 
						
					});
					
					$(this.options.container).css('color', this.normalContrast ? '#FFF' : $(this.options.container).data('originalColor'));
					$(this.options.container).css('background-color', this.normalContrast ? '#000' : $(this.options.container).data('originalBackground'));
                    
					this.normalContrast = !this.normalContrast;
					
					this.persistConfig();
				},
				persistConfig: function(){
					if(!this.options.persist){
						return;
					}

					if(typeof(Storage) !== "undefined"){
						window.localStorage.setItem(this.selector.selector, this.getCurrentConfig());
					} else {
						console.log('Web Storage not available!');
					}
				},
				getCurrentConfig: function(){
					var config = {
						ratio: this.currentRatio,
						normalContrast: !this.normalContrast
					};

					return JSON.stringify(config);
				},
				restoreFromStorage: function(){
					if(!this.options.persist){
						return;
					}

					var storagedOption = window.localStorage.getItem(this.selector.selector);

					if(storagedOption){
						storagedOption = JSON.parse(storagedOption);

						this.currentRatio = storagedOption.ratio;
						this.normalContrast = storagedOption.normalContrast;

						this.changeFontSize();
						this.changeContrast();
					}
				},
				startPlugin: function(option){
					this.mergeOptions(option);
					this.fetchTags();
					this.storeDefaults();
					this.createDefaultMarkup();
					this.setActions();
					this.restoreFromStorage();
				},
				executeFunction: function(function_name, value){
					switch(function_name){
						case 'decrease':
								this.decreaseFont();
							break;
						case 'reset':
								this.resetFont();
							break;
						case 'increase':
								this.increaseFont();
							break;
						case 'contrast':
								if(typeof value != 'undefined'){
									/* Change to specified value - true or false */
									if(value){
										/* Setting true, contrast will be applied */
										this.normalContrast = true;
									} else {
										/* Setting false, will remove contrast */
										this.normalContrast = false;
									}
								}

								this.changeContrast();
							break;
						case 'setRatio':
								this.changeFontSize(ratio);
							break;
						default:
								alert("Called function does not exist!");
							break;
					}
				},
				destroy: function(){
					/* Back all fonts to default size */
					this.resetFont();

					/* Remove contrast change */
					this.normalContrast = false;
					this.changeContrast();

					/* Remove plugin data */
					selector.removeData('easyView');
				}
			};

			plugin.startPlugin(option);

			/* Store plugin instance */
			selector.data('easyView', plugin);
		} else { 
			/* Plugin is already initialized, execute existing function */
			var plugin = selector.data('easyView');
			if(typeof option == 'object'){
				/* Restart plugin */
				plugin.destroy();
				plugin.startPlugin(option);
			} else if(typeof option == 'string') {
				/* Execute specific function */
				plugin.executeFunction(option, value);
			} else {
				alert("Invalid params to start");
			}
		}
	}
}(jQuery));


// Load Lib EasyView
$(document).ready(function() {
	/*
	  Optimizações para pessoas com Deficiências Visuais - Baixa Visão e Cegueira
	*/

	htmlBtns = '';
	htmlBtns += '<div id="font-setting">';
			htmlBtns += '<a class="btn-acessibilidade" tab-index="7" title="Opções de acessibilidade"><img src="https://fooba.com.br/mca/assets/img/icon-acessibilidade.png?1.1" /></a>';
	
		htmlBtns += '<div class="btn-group">';
			htmlBtns += '<button type="button" class="btn btn-default btn-conteudo go-to-content" tab-index="1">Ir para Conteúdo</button>';
			htmlBtns += '<button type="button" class="btn btn-default btn-navegacao"  tab-index="2">Navegação</button>';
		htmlBtns += '</div>';
		htmlBtns += '<div class="btn-group">';
			htmlBtns += '<button type="button" class="btn btn-default decrease-me"  tab-index="3" title="Dominuir tamanho de letra"><i class="glyphicon glyphicon-minus"></i></button>';
			htmlBtns += '<button type="button" class="btn btn-default reset-me"  tab-index="4" title="Voltar ao tamanho de letra padrão"><i class="glyphicon glyphicon-font"></i></button>';
			htmlBtns += '<button type="button" class="btn btn-default increase-me"  tab-index="5" title="Aumentar tamanho de letra"><i class="glyphicon glyphicon-plus"></i></button>';
		htmlBtns += '</div>';
		htmlBtns += '<div class="btn-group">';
			htmlBtns += '<button type="button" class="btn btn-default change-me"  tab-index="6" title="Mudar contraste"><i class="glyphicon glyphicon-adjust"></i> Contraste</button>';
		htmlBtns += '</div>';
	htmlBtns += '</div>';
			
	selector = $("body");
	selector.prepend(htmlBtns);
	selector = $("body");

	selector.easyView({
		increaseSelector: '.increase-me',
		decreaseSelector: '.decrease-me',
		normalSelector: '.reset-me',
		contrastSelector: '.change-me'
	});

	var acessibilidadePanelState = false;

	$('.btn-acessibilidade').click(function () {
		
		if (acessibilidadePanelState) {
			$('div#font-setting').css('left','-100px');
			acessibilidadePanelState = false;
		} else {
			$('div#font-setting').css('left','0px');
			acessibilidadePanelState = true;
		}
		return false;
	});

	$('#irDireto').click(function(e){
	    e.preventDefault();

	    $('#home-intro h1 p').focus();

	    // alert($('#home-intro h1 p').html());



	});
    $('.go-to-content').click(function(e) {
        e.preventDefault();

        $('html, body').animate({scrollTop: $('#home-intro').position().top}, 1000);
        $('#home-intro').focus();
    });

    $('.btn-navegacao').click(function(e) {
        e.preventDefault();

        $('html, body').animate({scrollTop: $('#main-nav').position().top}, 1000);
        $('#main-nav').focus();
    });

 /*
	Optimizações para Cegos
 */
 	selector.prepend('<div style="position: absolute; z-index: -1;">Mapa Cultural do Ceará. Ir para conteúdo principal. Ouvir comandos.</div>');
});