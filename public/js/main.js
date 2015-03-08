angular.module("myapp", ['textAngular', 'ngRoute'])
	.config(['$routeProvider',
	  function($routeProvider) {
	    $routeProvider.
	      when('/admin', {
	        templateUrl: 'templates/main.html',
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
	      when('/product', {
	        templateUrl: 'templates/pages/product.html',
	        controller: 'MainController'
	      });
	  }])
	.run( function($rootScope, $location) {
	   $rootScope.$watch(function() { 
	      return $location.path(); 
	    },
	    function(a){  
	      tour.steps = [];
	    });
	})
	.service('dataService', function(){
		html = "";
		//window.dataService = this;
	})
    .controller("MainController", function($scope, dataService) {
        $scope.dataService = dataService;
    })
    .controller("CustomerController", function($scope, $timeout, dataService){
    	debugger;
    	$scope.dataService = dataService;
    	tour.steps = [];
    	
    	$timeout(function(){
    		tour.start();
    	} , 1000)
    })
    .controller("DownloadController", function($scope, dataService){
    	$scope.dataService = dataService;
    })
	.directive('downloadPdf',['$sce', '$parse', '$compile', function($sce, $parse, $compile){
	  return {
	  	link: function(scope,element,attr){
	      html2canvas(document.body, {
				onrendered: function(canvas) {
					debugger;
					document.body.appendChild(canvas);

					var pdf = new jsPDF('p','pt','a4');

					pdf.addHTML($("canvas")[0],function() {
					    pdf.save('agreement.pdf');

					    $('canvas').remove();

					    window.history.back()
					});
				}
		  });     
	    } 
	  };
	}])
	.directive('compileHtml',['$sce', '$parse', '$compile', function($sce, $parse, $compile){
	  return {
	    link: function(scope,element,attr){
	      var parsed = $parse(attr.compileHtml);
	      function getStringValue() { return (parsed(scope) || '').toString(); }            
	      scope.$watch(getStringValue, function (value) {
	      	//console.log(value);
	      	var $el = $("<div></div>");
	      	$el.html(value);
	      	$compile($el.contents())(scope);
	        element.html($el);       
	      });       
	    } 
	  };
	}])
	.directive('guider',['$sce', '$parse', '$compile', '$timeout', function($sce, $parse, $compile, $timeout){
	  return {
	  	restrict: 'E',
	  	scope: true,
	    link: function(scope, element, attr) {
	      //debugger;
	      var $el = $("<form></form>");
	      // Strip non form tags and compile
	      $el.append(element.find(".guiderInput"));
	      $compile($el.contents())(scope);
	      //console.log(html);
	      $timeout(function(){
	      	tour.addStep('myStep' + tour.steps.length, {
			  title: attr.description,
			  scrollTo: true,
			  text: $el[0],
			  attachTo: {element: element[0], on: 'bottom'},
			  classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
			  buttons: [
			  	{
			  		text: 'Back',
			  		classes: 'shepherd-button-example-primary shepherd-button-back',
			  		action: function() {
			  			scope.$apply(function(){
			  				tour.back();
			  			})
			  		}
			  	},
			    {
			      text: 'Next',
			      classes: 'shepherd-button-example-primary shepherd-button-next',
			      action: function() {
			      	scope.$apply(function(){
			      		tour.next();
			      	});
			      }
			    }
			  ]
			});
	      }, 0)
	      
	    } 
	  };
	}])
	.directive('variable',['$compile', 'dataService', function($compile, dataService){
	  return {
	  	restrict: 'E',
	  	replace: true,
	  	scope: true,
	  	template: function(element, attr){
	  		return '<span><div class="guiderInput"><label for="' + attr.name +'">' + attr.question + '</label><input type="text" name="' + attr.name +'" ng-model="dataService.' + attr.name +'"/></div>' + '<span class="variableDisp" ng-bind="dataService.' + attr.name +'"></span></span>';
	  	},
	  	link: function(scope, element, attr){
	      //console.log('i am alive!', dataService);
	      //debugger; 
	    } 
	  };
	}])
	.directive('listTemplates',['$compile', '$http', '$location', 'dataService', function($compile, $http, $location, dataService){
	  return {
	  	restrict: 'E',
	  	replace: true,
	  	scope: true,
	  	templateUrl: 'templates/list-templates.html',
	  	link: function(scope, element, attr){
	      //console.log('i am alive!', dataService);
	      scope.selectTemplate = function(template) {
	      	dataService.html = template.html;
	      	//if(!scope.$$phase)
	      	$location.path("/form");
	      }
	      //debugger; 
	      $http.get('/templates.json').success(function(data){
	      	scope.data = data;
	      	//$compile(element)(scope);
	      	//console.log(data);
	      	//alert("yoyo");
	      	//debugger;
	      })
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
	      //debugger; 
	      //debugger;
	      scope.steps = tour.steps;

	      scope.stepLength = function(){
	      	return tour.steps.length;
	      }

	      scope.isCurrentStep = function(step) {
	      	console.log('is Current Step Running')
	      	return step == tour.getCurrentStep();
	      }

	      scope.getCurrentStep = function() {
	      	var step = tour.getCurrentStep();
	      	if(step)
	      		return step.id
	      	else
	      		return null;
	      }

	      scope.$watch(scope.getCurrentStep, function(a,b){
	      	debugger;
	      })

	      scope.$watch(scope.stepLength, function(data, newdata){
	      	console.log(data);
	      	scope.steps = tour.steps;
	      	//debugger;
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
	      //debugger; 
	      scope.saveTemplate = function(data) {
	      	var formData = element.serializeJSON();
	      	//debugger;
	      	//debugger;
	      	$http.post('/templates.json', formData).success(function(data){
	      		alert("Saved Successfully");
	      	});
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
	      		//debugger;
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