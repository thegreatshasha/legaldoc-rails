angular.module("myapp", ['textAngular', 'ngRoute', 'xtForm', 'angular-loading-bar', 'LocalStorageModule'])
	.config(['$routeProvider',
	  function($routeProvider) {
	    $routeProvider.
	      when('/admin', {
	        templateUrl: 'templates/admin.html',
	        controller: 'MainController'
	      }).
	      when('/adminform', {
	        templateUrl: 'templates/admin-form.html',
	        controller: 'MainController'
	      }).
	      when('/customer', {
	      	templateUrl: 'templates/customer.html',
	      	controller: 'CustomerController',
	      }).
	      when('/download', {
	      	templateUrl: 'templates/download.html',
	      	controller: 'DownloadController'
	      }).
	      when('/checkout', {
	        templateUrl: 'templates/pages/checkout.html',
	        controller: 'MainController'
	      }).
	      when('/form', {
	        templateUrl: 'templates/pages/form.html',
	        controller: 'CustomerController'
	      }).
	      when('/', {
	        templateUrl: 'templates/pages/homepage.html',
	        controller: 'MainController'
	      }).
	      when('/#', {
	        templateUrl: 'templates/pages/homepage.html',
	        controller: 'MainController'
	      }).
	       when('/terms', {
	        templateUrl: 'templates/pages/terms.html',
	        controller: 'MainController'
	      }).
	        when('/faq', {
	        templateUrl: 'templates/pages/faq.html',
	        controller: 'MainController'
	      }).
	      when('/product', {
	        templateUrl: 'templates/pages/product.html',
	        controller: 'MainController'
	      });
	  }])
	.run( function($rootScope, $location, $templateCache) {
	   $rootScope.$watch(function() { 
	      return $location.path(); 
	    },
	    function(a){
	      tour.cancel();
	      tour.steps = [];
	    });

	   $templateCache.get('templates/variable.html');
	})
	.service('dataService', ['$location', '$http', '$rootScope', '$sce', 'localStorageService', function($location, $http, $rootScope, $sce, localStorageService){
		var parent = this;
		this.template = localStorageService.get('template') || {};
		this.templates = [];
		this.adminFormPath = "/adminform";
		this.downloadPath = "/download";
		this.customerFormPath = "/form";
		this.fileUrl = "";
		this.contact = {};
		this.contactsUrl = "/contacts.json";
		window.d = this;
		debugger;

		this.saveContact = function(){
			this.contact.type = this.template.name;
			$http.post(this.contactsUrl, this.contact).success(function(data){
	    		parent.downloadPdf();
	    	})
		}

		this.editTemplate = function (template) {
			this.template = template;
			$location.path(this.adminFormPath);
		}

		this.cleanTemplate = function(str) {
			//return "<h1>This shouldn't be stuck</h1>"
			return str.replace(/[\n\r]/g, '');
		}

		this.downloadPdf = function(){
			$http({
			    url: '/templates/download.pdf',
			    method: "POST",
			    data: {html: parent.cleanTemplate(parent.template.compiledHtml)}, //this is your json data string
			    headers: {
			       'Content-type': 'application/json'
			    },
			    responseType: 'arraybuffer'
			}).success(function (data, status, headers, config) {
			    var blob = new Blob([data], {type: "application/pdf"});
			    parent.fileUrl = URL.createObjectURL(blob);
			    parent.trustedFileUrl = $sce.trustAsResourceUrl(parent.fileUrl);
			    $location.path(parent.downloadPath);
			}).error(function (data, status, headers, config) {
			    //upload failed
			});
		}

		this.fetchTemplates = function () {
			var promise = $http.get('/templates.json').success(function(data){
				parent.templates = data;
				//$compile(element)(scope);
		      	//console.log(data);
		      	//alert("yoyo");
		      	////debugger;
	      	});
	      	return promise;
		}

		this.newTemplate = function() {
			//debugger;
			this.template = {};
			$location.path(this.adminFormPath);
		}

		this.deleteTemplate = function(template, $index) {
			parent.templates.splice($index, 1);
			$http.delete('/templates/' + template.id +'.json', {'template': template}).success(function(data){
				alert("Deleted");
			});
		}

		this.chooseTemplate = function(template) {
	      	this.template = template;
	      	localStorageService.set('template', template);
	      	//if(!scope.$$phase)
	      	$location.path(this.customerFormPath);
	    }

	    this.saveTemplate = function() {
	    	var method = this.template.id ? "put" : "post",
	    		url = this.template.id ? "/templates/" + this.template.id + ".json" : "/templates.json";

	    	$http[method](url, this.template).success(function(data){
	    		alert("Success");
	    	})

	    	// $http.post('/templates.json', template).success(function(data){
	     //  		alert("Saved Successfully");
	     //  	});
	    }
		//window.dataService = this;
	}])
    .controller("MainController", function($scope, dataService) {
        $scope.dataService = dataService;
    })
    .controller("CustomerController", function($scope, $timeout, $location, dataService){
    	// Redirect if template not found
    	if(!dataService.template.name)
        	$location.path('/product');
    	
    	$scope.dataService = dataService;
    	tour.steps = [];
    	$scope.guiderForms = [];


    	window.scc = $scope;
    	$scope.areFormsValid = function(){
    		var isValid = true;
    		// Since _.each does not allow breaking
    		for(var i=0; i<this.guiderForms.length; i++){
    			var form = this.guiderForms[i];
    			if(form.$invalid){
    				isValid = false;
    				break;
    			}
    		}
    		return isValid;
    	}
    	
    	$timeout(function(){
    		tour.start();
    	} , 1000)
    })
    .controller("DownloadController", function($scope, dataService){
    	$scope.dataService = dataService;
    })
	.directive('compileHtml',['$sce', '$parse', '$compile', 'dataService', function($sce, $parse, $compile, dataService){
	  return {
	  	//TODO: Remove hardcoded dependency on dataService and make it declarative
	    link: function(scope,element,attr){
	      var parsed = $parse(attr.compileHtml);
	      function getStringValue() { return (parsed(scope) || '').toString(); }            
	      scope.$watch(getStringValue, function (value) {
	      	element.html(value);
	      	$compile(element.contents())(scope);
	      });       
	    } 
	  };
	}])
	.directive('watchHtml', [function(){
		return {
			restrict: 'A',
			scope: { html: '=watchHtml' },
			link: function(scope, element, attr) {
				scope.$watch(function(){
					return element.html();
				}, function(newHtml){
					scope.html = newHtml;
				})
			}
		}
	}])
	.directive('guider',['$sce', '$parse', '$compile', '$location', function($sce, $parse, $compile, $location){
	  return {
	  	restrict: 'E',
	  	scope: {},
	    link: function(scope, element, attr) {
	      // Adding a form with validation here;
	      var $el = $("<div style='text-align: center;'><form strategy='dirty' xt-form name='guiderForm' novalidate></form></div>");
	      // Strip non form tags and compile
	      var guiderInputs = element.find(".guiderInput")
	      // Add xt-validate to inputs here so tooltip validation works
	      guiderInputs = _.uniq(guiderInputs, function(data) {
	      			$(data).find('input').attr('xt-validate', true);
	      			return $(data).attr('name');
				}
			);
	      
	      $el.find("form").append(guiderInputs);
	      //$compile(this.$el.contents())(scope);
	      var index = tour.steps.length + 1;
	      var lastIndex = $("guider").length;

	      // Checkout hack
	      var buttons = [];

	      var buttonObj = {
	      	'back': {
			  		text: 'Back',
			  		classes: 'shepherd-button-example-primary shepherd-button-back',
			  		action: function() {
			  			scope.$apply(function(){
			  				//if(scope.guiderForm.$dirty && scope.guiderForm.$valid)
			  					tour.back();
			  				//else
			  					//scope.guiderForm.showErrors();

			  					// show some motherfucking errors
			  			})
			  		}
			},
	      	'next': {
			      text: 'Next',
			      classes: 'shepherd-button-example-primary shepherd-button-next',
			      action: function() {
			      	scope.$apply(function(){
			      		if(scope.guiderForm.$dirty && scope.guiderForm.$valid)
			      			tour.next();
			      		else
			      			scope.guiderForm.showErrors();
			      	});
			      }
			    },
	      	'checkout': {
			      text: 'Finish',
			      classes: 'shepherd-button-example-primary shepherd-button-finish',
			      action: function() {
			      	scope.$apply(function(){
			      		if(scope.$parent.areFormsValid())
			      			$location.path('/checkout');
			      		else
			      			scope.guiderForm.showErrors();
			      		
			      	});
			      }
			    }
	      };

	      //console.log(html);
	      switch(index) {
		      case 1:
		      	buttons = [buttonObj['next']];
		      	break;
		      case lastIndex:
		      	buttons = [buttonObj['back'], buttonObj['checkout']];
		      	break;
		      default:
		      	buttons = [buttonObj['back'], buttonObj['next']];
		      	break;
		  }

		  // Compiles guiders and gives us access to guiderform. Maybe this should be triggered through events?
		  $compile($el.contents())(scope);

		  // Push current form into array
		  scope.$parent.guiderForms.push(scope.guiderForm);
		  window.spw = scope.$parent;

		  scope.guiderForm.showErrors = function() {
	      	// TODO: Quirky soln for setting form to dirty. This should be done automatically.
	      	angular.forEach(this.$error, function(error){
  				angular.forEach(error, function(field) {
				    field.$setDirty();
				    field.$error.custom = Math.random();
				    // Trigger error

				});
  			});
	      }
		    
	      var tr = tour.addStep('myStep' + tour.steps.length, {
			  title: attr.description,
			  scrollTo: true,
			  text: $el[0],
			  attachTo: {element: element[0], on: 'bottom'},
			  classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
			  buttons: buttons
		  });

		  var currentStepIndex = tour.steps.length - 1;
		  var currentStep = tour.steps[currentStepIndex];
		  
		  currentStep.on('show', function(){
			// Workaround for ng model not updating
			$('input[ng-model]').trigger('input');
  		  	scope.$parent.activeGuiderForm = scope.guiderForm;
		  })
		  
		  // TODO: We are attaching multiple events here. Need to find a better solution for this
		  // tour.on('goto'+currentStepIndex, function($index){
		  // 	//if($index == currentStepIndex){
		  // 		if(scope.guiderForm.$dirty && scope.guiderForm.$valid)
			 //    	tour.gotoStep(currentStepIndex);
			 //    else{
			 //    	//debugger;
			 //    	showErrors();
			 //    }
		  // 	//}
		  // })
			
	    } 
	  };
	}])
	.directive('variable',['$http', '$compile', '$templateCache', 'dataService', function($http, $compile, $templateCache, dataService){
	  return {
	  	restrict: 'E',
	  	replace: true,
	  	scope: false,
  		template: function(element, attr){
  			// TODO: Need cleaner solution for this. Probably move this to a template/reusable construct html method
  			var attrs = ['<input'];
  			if(!_.has(attr, 'optional'))
  				attrs.push('required');
  			if(attr.type)
  				attrs.push('type="' + attr.type + '"');
  			attrs.push('name="' + attr.name +'"');
  			attrs.push('ng-model="dataService.'+ attr.name + '"');
  			attrs.push('/>');
  			var inputString = attrs.join(" ");
  			// attributes construction here

  			var tpl =  '<span>\
							<div class="guiderInput" name="' + attr.name + '">\
								<label for="' + attr.name +'">' + attr.question + '</label>'+
								inputString +
							'</div>' + 
							'<span class="variableDisp" ng-bind="(dataService.' + attr.name +'|pretty)"></span>\
						</span>';
			return tpl;

  		},
	  	link: function(scope, element, attr){
	      //console.log('i am alive!', dataService);
	      ////debugger; 
	      scope.dataService = dataService;
	  	  scope.attr = attr;
	    } 
	  };
	}])
	.directive('listenDirective',['dataService', function(dataService){
	  return {
	  	restrict: 'A',
	  	scope: false,
  		link: function(scope, element, attr){
	      //console.log('i am alive!', dataService);
	      ////debugger; 
	      scope.dataService = dataService;
	  	  scope.attr = attr;
	  	  element.on('change', function(){
	  	  	
	  	  })
	    } 
	  };
	}])
	.directive('listTemplates',['$compile', '$http', '$location', 'dataService', function($compile, $http, $location, dataService){
	  return {
	  	restrict: 'E',
	  	replace: true,
	  	scope: true,
	  	link: function(scope, element, attrs){
	      //console.log('i am alive!', dataService);
	      // scope.selectTemplate = function(template) {
	      // 	dataService.html = template.html;
	      // 	//if(!scope.$$phase)
	      // 	$location.path("/form");
	      // }
	      ////debugger;
	      	scope.dataService = dataService;
	      	dataService.fetchTemplates();
	      
	    },
	    templateUrl: function(element, attrs) {
	    	return 'templates/' + attrs.type + '-list-templates.html';
	    }
	  };
	}])
	.directive('chooseTemplate', ['$location', 'dataService', function($location, dataService){
	  return {
	  	restrict: 'E',
	  	replace: true,
	  	scope: true,
	  	templateUrl: 'templates/choose-template.html',
	  	link: function(scope, element, attr){
	  		scope.dataService = dataService;
	    } 
	  };
	}])
	.directive('editTemplate', ['$location', 'dataService', function($location, dataService){
	  return {
	  	restrict: 'E',
	  	replace: true,
	  	scope: true,
	  	templateUrl: 'templates/edit-template.html',
	  	link: function(scope, element, attr){
	  		scope.dataService = dataService;
	  		//debugger;
	    } 
	  };
	}])
	.directive('tourSteps',['$compile', 'dataService', function($compile, dataService){
	  return {
	  	restrict: 'E',
	  	replace: true,
	  	scope: true,
	  	templateUrl: 'templates/tour-steps.html',
	  	link: function(scope, element, attr){
	      //console.log('i am alive!', dataService);
	      ////debugger; 
	      ////debugger;
	      scope.steps = tour.steps;
	      window.ss = scope;
	      //debugger;

	      scope.stepLength = function(){
	      	return tour.steps.length;
	      }

	      scope.gotoStep = function(index){
	      	if(scope.activeGuiderForm.$valid)
	      		tour.gotoStep(index);
	      	else
	      		scope.activeGuiderForm.showErrors();
	      }

	      scope.isCurrentStep = function(step) {
	      	return step == tour.getCurrentStep();
	      }

	      scope.$watch(scope.stepLength, function(data, newdata){
	      	console.log(data);
	      	scope.steps = tour.steps;
	      	////debugger;
	      })
	    } 
	  };
	}])
	.directive('saveTemplate',['$compile', '$http', 'dataService', function($compile, $http, dataService){
	  return {
	  	restrict: 'E',
	  	replace: true,
	  	scope: true,
	  	templateUrl: 'templates/save-template.html',
	  	link: function(scope, element, attr){
	  	  scope.template = {};
	  	  //console.log('i am alive!', dataService);
	      ////debugger; 
	      scope.saveTemplate = function(data) {
	      	var formData = element.serializeJSON();
	      	////debugger;
	      	////debugger;
	      }
	    } 
	  };
	}])
	.directive('assignData',['$parse', function($parse){
	  return {
	  	scope: false,
	    link: function(scope, element, attr){
	      var parsed = $parse(attr.assignData);

	      element.bind('change', function(){
	      	tour.steps = [];

	      	element.val(html_beautify(element.val()));  

	      	scope.$apply(function(){
	      		//scope[attr.assignData] = element.val();

	      		var model = $parse(attr.assignData);
	      		model.assign(scope, element.val());
	      		////debugger;
	      	});
	      })

	      function getStringValue() { return (parsed(scope) || '').toString(); }            
	      scope.$watch(getStringValue, function (value) {
	        var data = html_beautify(value);
	        element.val(data);      
	      });       
	    } 
	  };
	}])
	.directive('myAnchor', function() {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function(scope, elem, attrs, ngModel) {
	      return elem.bind('click', function() {
	        //other stuff ...
	        var el;
	        el = document.getElementById(attrs['myAnchor']);
	        return el.scrollIntoView();
	      });      
	    }
	  };
	})
	.directive('embedSrc', ['$parse', function ($parse) {
	  return {
	    restrict: 'A',
	    link: function (scope, element, attrs) {
	      var current = element;
	      var parsed = $parse(attrs.embedSrc);
	      function getStringValue() { return (parsed(scope) || '').toString(); } 
	      scope.$watch(getStringValue, function (value) {
	        var clone = element
	                      .clone()
	                      .attr('src', value);
	        current.replaceWith(clone);
	        current = clone;
	      });
	    }
	  };
	}])
	.filter('pretty', function($filter) {
		var angularDateFilter = $filter('date');
	  	
		return function(input) {
			if(input instanceof Date)
				return angularDateFilter(input, 'dd MMMM, yyyy');
			else
				return input;
		};
	});