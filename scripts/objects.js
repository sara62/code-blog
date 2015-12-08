/* The Site Object */
var Site = function(siteTitle,socialData) {
  this.container = $('main');
  $('#site-title a').text(siteTitle);
  this.templates = new Templates();
  this.navigation = new Navigation(socialData,this.templates);
  this.articleIdIndex = 0;
  this.articlesIdIndex = 0;
};
/* The Navigation Object */
var Navigation = function(socialData,siteTemplates) {
  this.pages = [];
  this.templates = siteTemplates;
  this.setupHamburgerMenu();
  this.addSocialLinks(socialData);
};
Navigation.prototype.setupHamburgerMenu = function() {
  var menuOffScreen = (-1 * ($('#mobile-menu').find('.site-menu').width())) - 5;
  $('#navigation').on('click','.hamburger-menu',function() {
    if ($('#mobile-menu').css('width') !== '0px') {
      $('#mobile-menu').find('.hamburger-menu').rotate({duration:500,angle: 90,animateTo:0});
      $('#mobile-menu').css('width','0px');
      var menuOffScreen = (-1 * ($('#mobile-menu').find('.site-menu').width())) - 5;
      $('#mobile-menu').find('.site-menu').animate({left: menuOffScreen}, 500, function() {});
    } else {
      $('#mobile-menu').find('.hamburger-menu').rotate({duration:500,angle: 0,animateTo:90});
      $('#mobile-menu').css('width','auto');
      $('#mobile-menu').find('.site-menu').animate({left: '-18px'}, 500, function() {});
    }
  });
  $('#navigation').on('click','#mobile-menu .nav-link-item',function() {
    if ($('#mobile-menu').css('width') !== '0px') {
      $('#mobile-menu').find('.hamburger-menu').rotate({duration:500,angle: 90,animateTo:0});
      $('#mobile-menu').css('width','0px');
      $('#mobile-menu').find('.site-menu').animate({left: menuOffScreen}, 500, function() {});
    } else {
      $('#mobile-menu').find('.hamburger-menu').rotate({duration:500,angle: 0,animateTo:90});
      $('#mobile-menu').css('width','auto');
      $('#mobile-menu').find('.site-menu').animate({left: '-18px'}, 500, function() {});
    }
  });
  $('#site-title').on('click',function() {
    if ($('#mobile-menu').css('width') !== '0px') {
      $('#mobile-menu').find('.hamburger-menu').rotate({duration:500,angle: 90,animateTo:0});
      $('#mobile-menu').css('width','0px');
      $('#mobile-menu').find('.site-menu').animate({left: menuOffScreen}, 500, function() {});
    }
    $('main').children().hide();
    $('.filters').hide();
  });
  $('#mobileMenu').find('.site-menu').animate({left: menuOffScreen}, 500, function() {});
  $('#mobile-menu').css('width','0px');
};
Navigation.prototype.addSocialLinks = function(data) {
  var $socialLinks = this.templates.getTemplate('navigation-social-link');
  $socialLinks = this.templates.renderTemplate($socialLinks,data);
  $mobileSocialLinks = $socialLinks.clone();
  $desktopSocialLinks = $socialLinks.clone();
  $mobileSocialLinks.appendTo('#mobile-menu ul');
  $desktopSocialLinks.appendTo('#desktop-menu .social ul');
};
/* The Templates Object */
var Templates = function() {
  this.templates = [];
  this.addTemplates();
};
Templates.prototype.addTemplates = function() {
  var $basicArticlesTemplate = $(('<script type="text/x-handlebars-template" id="basic-article-template">' +
    '<div id="{{title}}-{{id}}" class="articles">' +
      '{{#each articles}}' +
        '<article id="article-{{id}}">' +
          '<div class="article-title"><h2>{{title}}</h2></div>' +
          '<div class="article-meta-information">' +
            '<div class="article-author"><a href="{{authorUrl}}" target="_blank" rel="author">{{author}}</a></div>' +
            '<div class="article-category"><span>{{category}}</span></div>' +
            '<div class="article-published-date"><span>Published On </span><time datetime="{{date}}">{{date}}</time><span>{{timePassed}}</span></div>' +
          '</div>' +
          '<div class="article-content">{{{content}}}</div>' +
          '<a href="#article-{{id}}" class="read-more">Continue reading...</a>' +
        '</article>' +
      '{{/each}}' +
    '</div>' +
  '</script>'));
  var $basicArticlesFiltersTemplate = $(('<script type="text/x-handlebars-template" id="basic-article-filters-template">' +
      '<div id="{{title}}-{{id}}-filters" class="filters">' +
        '<ul>' +
          '<li class="author-filter" class="filter" name="author-filter">' +
            '<select class="filter-select">' +
              '{{#each authors}}' +
                '<option class="filter-option" value="{{author}}">{{author}}</option>' +
              '{{/each}}' +
            '</select>' +
          '<li>' +
          '<li class="category-filter" class="filter" name="category-filter">' +
            '<select class="filter-select">' +
              '{{#each categories}}' +
                '<option class="filter-option" value="{{category}}">{{category}}</option>' +
              '{{/each}}' +
            '</select>' +
          '<li>' +
        '</ul>' +
      '</div>' +
    '</script>'));
  var $basicPageTemplate = $(('<script type="text/x-handlebars-template" id="basic-page-template">' +
      '<div id="{{title}}-page" class="page">' +
        '<article class="basic-page">' +
          '<div class="basic-title"><h2>{{title}}</h2></div>' +
          '<div class="basic-content">{{{content}}}</div>' +
        '</article>' +
      '</div>' +
    '</script>'));
  var $referencePageTemplate = $(('<script type="text/x-handlebars-template" id="reference-page-template">' +
      '<div id="{{title}}-page" class="page">' +
        '<article class="reference-page">' +
          '<div class="reference-title"><h2>{{title}}</h2></div>' +
          '<div class="reference-content">{{{content}}}</div>' +
          '<div class="link-items">' +
            '{{#each links}}' +
            '<div class="link-item"><span>{{linkTitle}}: </span><a href="{{linkUrl}}" target="_blank">{{linkUrl}}</a></div>' +
            '{{/each}}' +
          '</div>' +
        '</article>' +
      '</div>' +
    '</script>'));
  var $navigationLinkTemplate = $(('<script type="text/x-handlebars-template" id="navigation-link-template">' +
      '<li class="nav-link-item">' +
        '<a href="#{{url}}">{{title}}</a>' +
      '</li>' +
    '</script>'));
  var $navigationSocialLinkTemplate = $(('<script type="text/x-handlebars-template" id="navigation-social-link-template">' +
      '{{#each links}}' +
        '<li class="nav-social-link-item">' +
          '<a href="{{url}}" target="_blank"><img width={{width}} height={{height}} alt="My {{title}}" src="{{srcUrl}}" class="icon {{imgClass}}"></a>' +
        '</li>' +
      '{{/each}}' +
    '</script>'));
  this.templates['basic-articles'] = $basicArticlesTemplate;
  this.templates['basic-article-filters'] = $basicArticlesFiltersTemplate;
  this.templates['basic-page'] = $basicPageTemplate;
  this.templates['reference-page'] = $referencePageTemplate;
  this.templates['navigation-link'] = $navigationLinkTemplate;
  this.templates['navigation-social-link'] = $navigationSocialLinkTemplate;
};
Templates.prototype.getTemplate = function(template) {
  return this.templates[template];
};
Templates.prototype.renderTemplate = function($template,context) {
  var handlebarTemplate = Handlebars.compile($template.html());
  return $(handlebarTemplate(context));
};
/* The Page Object */
var Page = function(pageSite,pageType,pageData) {
  if(pageType === 'basic-articles') {
    pageData.id = pageSite.articlesIdIndex;
    pageSite.articlesIdIndex += 1;
    var currentDate = new Date();
    $.each(pageData['articles'],function(index,value) {
      this.id = pageSite.articleIdIndex;
      pageSite.articleIdIndex += 1;
      var publishedDate = new Date(this.date);
      var publishedYear = publishedDate.getFullYear();
      var publishedMonth = publishedDate.getMonth()+1;
      var publishedDay = function() {
        if(publishedDate.getDate()<10) {
          return ('0' + publishedDate.getDate());
        } else {
          return publishedDate.getDate();
        }
      }();
      var publishDate = (publishedYear.toString()+publishedMonth.toString()+publishedDay.toString());
      this.timePassed = (', '+moment(publishDate,'YYYYMMDD').endOf('day').fromNow());
    });
  }
  this.$obj = pageSite.templates.getTemplate(pageType);
  this.$obj = pageSite.templates.renderTemplate(this.$obj,pageData);
  $('main').append(this.$obj);
  this.$obj.hide();
  this.$navLink = pageSite.templates.getTemplate('navigation-link');
  var navLinkData = {};
  if(pageType === 'basic-articles') {
    navLinkData = {'title':pageData['title'],'url':(pageData['title'] + '-' + pageData['id'] + '-filters')};
  } else {
    navLinkData = {'title':pageData['title'],'url':(pageData['title'] + '-page')};
  }
  this.$mobileNavLink = pageSite.templates.renderTemplate(this.$navLink,navLinkData);
  this.$mobileNavLink.appendTo($('#mobile-menu .site-menu ul'));
  this.$desktopNavLink = pageSite.templates.renderTemplate(this.$navLink,navLinkData);
  this.$desktopNavLink.appendTo($('#desktop-menu .site-menu ul'));
  this.$mobileNavLink.on('click',function() {
    if(pageType === 'basic-articles') {
      var $articles = $('#' + pageData['title'] + '-' + pageData['id']);
      $('main').children().not($articles).hide();
      $articles.find('article .article-content :not(:first-child)').hide();
      $articles.find('.read-more').show();
      $articles.find('article').show();
      $articles.on('click','.read-more',function() {
        $(this).parent().find('.article-content *').each(function(index,value) {
          $(value).show();
        });
        $(this).hide();
      });
      $articles.show();
    } else {
      $('main').children().not(('#' + pageData['title'] + '-page')).hide();
      $('.filters').hide();
      $(('#' + pageData['title'] + '-page')).show();
    }
  });
  this.$desktopNavLink.on('click',function() {
    if(pageType === 'basic-articles') {
      var $articles = $('#' + pageData['title'] + '-' + pageData['id']);
      $('main').children().not($articles).hide();
      $articles.find('article .article-content :not(:first-child)').hide();
      $articles.find('.read-more').show();
      $articles.find('article').show();
      $articles.on('click','.read-more',function() {
        $(this).parent().find('.article-content *').each(function(index,value) {
          $(value).show();
        });
        $(this).hide();
      });
      $articles.show();
    } else {
      $('main').children().not(('#' + pageData['title'] + '-page')).hide();
      $('.filters').hide();
      $(('#' + pageData['title'] + '-page')).show();
    }
  });
  if (pageType === 'basic-articles') {
    var $articleFilters = pageSite.templates.getTemplate('basic-article-filters');
    var filterData = {
      'id' : pageData['id'],
      'title' : pageData['title'],
      'authors' : [],
      'categories' : []
    };
    var utility = new Utilities();
    var authorsArray = [];
    var categoriesArray = [];
    $.each(pageData['articles'],function(index,value) {
      authorsArray.push(value.author);
      categoriesArray.push(value.category);
    });
    authorsArray = utility.uniqueArray(authorsArray);
    categoriesArray = utility.uniqueArray(categoriesArray);
    filterData['authors'].push({author:'All Authors'});
    filterData['categories'].push({category:'All Categories'});
    $.each(authorsArray,function(index,value) {
      filterData['authors'].push({author:value});
    });
    $.each(categoriesArray,function(index,value) {
      filterData['categories'].push({category:value});
    });
    $articleFilters = pageSite.templates.renderTemplate($articleFilters,filterData);
    if ($('#mobile-menu').css('display') === 'none') {
      $articleFilters.appendTo('#desktop-menu nav');
      $articleFilters.hide();
    } else {
      $articleFilters.appendTo('header');
      $articleFilters.hide();
    }
    var $filters = $(('#' + pageData['title'] + '-' + pageData['id'] + '-filters'));
    var $articles = $(('#' + pageData['title'] + '-' + pageData['id'] + ' article'));
    var $articleContainer = $(('#' + pageData['title'] + '-' + pageData['id']));
    $filters.find('.author-filter').on('change',function() {
      $filters.find('.category-filter .filter-select').val('All Categories');
      $articles.show();
      var selection = $filters.find('.author-filter option:selected').attr('value');
      if (selection !== 'All Authors') {
        $articles.each(function() {
          var articleAuthor = $(this).find('.article-author').text();
          if(articleAuthor !== selection) {
            $articleContainer.find('article p:not(:first-child)').hide();
            $articleContainer.find('.read-more').show();
            $(this).hide();
          }
        });
      }
    });
    $filters.find('.category-filter').on('change',function() {
      $filters.find('.author-filter .filter-select').val('All Authors');
      $articles.show();
      var selection = $filters.find('.category-filter option:selected').attr('value');
      if (selection !== 'All Categories') {
        $articles.each(function() {
          var articleCategory = $(this).find('.article-category span').text();
          if(articleCategory !== selection) {
            $articleContainer.find('article p:not(:first-child)').hide();
            $articleContainer.find('.read-more').show();
            $(this).hide();
          }
        });
      }
    });
    this.$mobileNavLink.on('click',function() {
      $filters.show();
      $filters.find('.author-filter .filter-select').val('All Authors');
      $filters.find('.category-filter .filter-select').val('All Categories');
    });
    this.$desktopNavLink.on('click',function() {
      $filters.show();
      $filters.find('.author-filter .filter-select').val('All Authors');
      $filters.find('.category-filter .filter-select').val('All Categories');
    });
    $(window).on('resize',function() {
      if ($('#mobile-menu').css('display') === 'none') {
        $articleFilters.appendTo('#desktop-menu nav');
      } else {
        $articleFilters.appendTo('header');
      }
    });
  }
  $socialNavLinks = $('#mobile-menu .nav-social-link-item').clone();
  $('#mobile-menu .nav-social-link-item').remove();
  $socialNavLinks.appendTo('#mobile-menu .site-menu ul');
};
