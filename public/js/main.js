angular.module("myapp", ['textAngular', 'ngRoute'])
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
	.service('dataService', ['$location', '$http', '$rootScope', '$sce', function($location, $http, $rootScope, $sce){
		var parent = this;
		this.template = {};
		this.templates = [];
		this.adminFormPath = "/adminform";
		this.customerFormPath = "/form";
		this.fileUrl = "";
		window.d = this;

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

        $scope.newTemplate = function() {
        	//debugger;
        }
    })
    .controller("CustomerController", function($scope, $timeout, dataService){
    	$scope.dataService = dataService;
    	tour.steps = [];
    	
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
	  	scope: true,
	    link: function(scope, element, attr) {
	      ////debugger;
	      this.$el = $("<div style='text-align: center;'><ng-form name='guiderForm'></ng-form></div>");
	      // Strip non form tags and compile
	      guiderInputs = element.find(".guiderInput")
	      guiderInputs = _.uniq(guiderInputs, function(data) {
					return $(data).attr('name');
				}
			);
	      window.popo = this;
	      popo.scope = scope;
	      this.$el.find("ng-form").append(guiderInputs);
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
			  				if(scope.guiderForm.$dirty && scope.guiderForm.$valid)
			  					tour.back();
			  				//else

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
			      	});
			      }
			    },
	      	'checkout': {
			      text: 'Finish',
			      classes: 'shepherd-button-example-primary shepherd-button-finish',
			      action: function() {
			      	scope.$apply(function(){
			      		$location.path('/checkout');
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
		    
	      var tr = tour.addStep('myStep' + tour.steps.length, {
			  title: attr.description,
			  scrollTo: true,
			  text: $el[0],
			  attachTo: {element: element[0], on: 'bottom'},
			  classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
			  buttons: buttons
		  });

		  var parentScope = scope;

		  var step = tr.steps[tr.steps.length - 1];
	      step.on('show', function(a,b,c,d){
	      	var scope = parentScope;
	      	var $el = $(this.el)
	      	$compile($el.contents())(scope);
	      	debugger;
	      });
	      
	    } 
	  };
	}])
	.directive('variable',['$http', '$compile', '$templateCache', 'dataService', function($http, $compile, $templateCache, dataService){
	  return {
	  	restrict: 'E',
	  	replace: true,
	  	scope: true,
  		template: function(element, attr){
  			var tpl =  '<span>\
							<div class="guiderInput" name="' + attr.name + '">\
								<label for="' + attr.name +'">' + attr.question + '</label>\
								<input type="text" name="' + attr.name +'" ng-model="dataService.' + attr.name +'"/>\
								<span class="error" ng-show="guiderForm.' + attr.name + '.$dirty">Dirty</span>\
								{{guiderForm.' + attr.name + '.$dirty}}\
							</div>' + 
							'<span class="variableDisp" ng-bind="dataService.' + attr.name +'"></span>\
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

	      scope.stepLength = function(){
	      	return tour.steps.length;
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
	}]);